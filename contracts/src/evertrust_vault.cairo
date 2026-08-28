#[starknet::contract]
pub mod EverTrustVault {
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address, get_block_timestamp
    };
    use core::poseidon::poseidon_hash_span;
    use super::super::interfaces::{IERC20Dispatcher, IERC20DispatcherTrait, ISTRK20PoolDispatcher, ISTRK20PoolDispatcherTrait, IEverTrustVault};
    use super::super::heartbeat::HeartbeatLogic;
    use super::super::beneficiary_escrow::BeneficiaryEscrow;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        strk_token: ContractAddress,
        privacy_pool: ContractAddress,
        cadence_seconds: u64,
        grace_period_seconds: u64,
        last_heartbeat_timestamp: u64,
        total_shielded_amount: u256,
        remaining_shielded_amount: u256,
        is_revoked: bool,
        is_settled: bool,
        beneficiary_count: u32,
        beneficiary_commitments: LegacyMap<u32, felt252>,
        claimed_nullifiers: LegacyMap<felt252, bool>,
        claimed_count: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        VaultCreated: VaultCreated,
        HeartbeatPinged: HeartbeatPinged,
        BeneficiaryClaimed: BeneficiaryClaimed,
        VaultRevoked: VaultRevoked,
    }

    #[derive(Drop, starknet::Event)]
    pub struct VaultCreated {
        pub owner: ContractAddress,
        pub total_amount: u256,
        pub cadence_seconds: u64,
        pub beneficiary_count: u32,
    }

    #[derive(Drop, starknet::Event)]
    pub struct HeartbeatPinged {
        pub owner: ContractAddress,
        pub timestamp: u64,
        pub next_expiry: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct BeneficiaryClaimed {
        pub nullifier: felt252,
        pub recipient: ContractAddress,
        pub share_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct VaultRevoked {
        pub owner: ContractAddress,
        pub refund_amount: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        strk_token: ContractAddress,
        privacy_pool: ContractAddress,
        cadence_seconds: u64,
        grace_period_seconds: u64,
        total_amount: u256,
        commitments: Array<felt252>
    ) {
        assert(!owner.is_zero(), 'Owner cannot be zero');
        assert(cadence_seconds > 0, 'Cadence must be > 0');
        assert(total_amount > 0, 'Amount must be > 0');

        let now = get_block_timestamp();
        self.owner.write(owner);
        self.strk_token.write(strk_token);
        self.privacy_pool.write(privacy_pool);
        self.cadence_seconds.write(cadence_seconds);
        self.grace_period_seconds.write(grace_period_seconds);
        self.last_heartbeat_timestamp.write(now);
        self.total_shielded_amount.write(total_amount);
        self.remaining_shielded_amount.write(total_amount);
        self.is_revoked.write(false);
        self.is_settled.write(false);
        self.claimed_count.write(0);

        let len = commitments.len();
        self.beneficiary_count.write(len);

        let mut i: u32 = 0;
        loop {
            if i >= len {
                break;
            }
            let commitment = *commitments.at(i);
            self.beneficiary_commitments.write(i, commitment);
            i += 1;
        };

        self.emit(
            VaultCreated {
                owner,
                total_amount,
                cadence_seconds,
                beneficiary_count: len
            }
        );
    }

    #[abi(embed_v0)]
    impl EverTrustVaultImpl of IEverTrustVault<ContractState> {
        fn ping_heartbeat(ref self: ContractState) {
            let caller = get_caller_address();
            let owner = self.owner.read();
            assert(caller == owner, 'Only owner can ping');
            assert(!self.is_revoked.read(), 'Vault is revoked');
            assert(!self.is_settled.read(), 'Vault is settled');

            let now = get_block_timestamp();
            self.last_heartbeat_timestamp.write(now);
            let next_expiry = now + self.cadence_seconds.read();

            self.emit(
                HeartbeatPinged {
                    owner,
                    timestamp: now,
                    next_expiry
                }
            );
        }

        fn get_vault_state(self: @ContractState) -> u8 {
            let now = get_block_timestamp();
            let last_heartbeat = self.last_heartbeat_timestamp.read();
            let cadence = self.cadence_seconds.read();
            let grace_period = self.grace_period_seconds.read();
            let is_revoked = self.is_revoked.read();
            let is_settled = self.is_settled.read();

            HeartbeatLogic::compute_vault_state(
                now, last_heartbeat, cadence, grace_period, is_revoked, is_settled
            )
        }

        fn get_last_heartbeat(self: @ContractState) -> u64 {
            self.last_heartbeat_timestamp.read()
        }

        fn get_cadence(self: @ContractState) -> u64 {
            self.cadence_seconds.read()
        }

        fn get_next_expiry(self: @ContractState) -> u64 {
            self.last_heartbeat_timestamp.read() + self.cadence_seconds.read()
        }

        fn get_total_shielded(self: @ContractState) -> u256 {
            self.total_shielded_amount.read()
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn get_beneficiary_count(self: @ContractState) -> u32 {
            self.beneficiary_count.read()
        }

        fn get_beneficiary_commitment(self: @ContractState, index: u32) -> felt252 {
            self.beneficiary_commitments.read(index)
        }

        fn is_nullifier_claimed(self: @ContractState, nullifier: felt252) -> bool {
            self.claimed_nullifiers.read(nullifier)
        }

        fn claim_inheritance(
            ref self: ContractState,
            beneficiary_index: u32,
            heir_pubkey: felt252,
            percentage_bps: u16,
            salt: felt252,
            nullifier: felt252,
            claim_proof: Array<felt252>,
            recipient: ContractAddress
        ) {
            // 1. Check state is UNLOCKED_FOR_CLAIM
            let state = self.get_vault_state();
            assert(state == HeartbeatLogic::STATE_UNLOCKED_FOR_CLAIM, 'Vault not unlocked for claim');

            // 2. Validate index and nullifier
            assert(beneficiary_index < self.beneficiary_count.read(), 'Invalid beneficiary index');
            assert(!self.claimed_nullifiers.read(nullifier), 'Nullifier already claimed');

            // 3. Verify commitment
            let stored_commitment = self.beneficiary_commitments.read(beneficiary_index);
            let computed_commitment = BeneficiaryEscrow::compute_commitment(
                heir_pubkey, percentage_bps, salt
            );
            assert(stored_commitment == computed_commitment, 'Invalid heir commitment');

            // 4. Mark nullifier claimed
            self.claimed_nullifiers.write(nullifier, true);
            let new_claimed = self.claimed_count.read() + 1;
            self.claimed_count.write(new_claimed);

            // 5. Calculate share amount
            let total = self.total_shielded_amount.read();
            let share_amount = BeneficiaryEscrow::compute_share_amount(total, percentage_bps);

            // 6. Invoke STRK20 pool unshield / payout
            let pool = self.privacy_pool.read();
            let strk = self.strk_token.read();
            
            if !pool.is_zero() {
                let pool_dispatcher = ISTRK20PoolDispatcher { contract_address: pool };
                pool_dispatcher.unshield(strk, share_amount, nullifier, recipient, claim_proof);
            } else {
                let erc20_dispatcher = IERC20Dispatcher { contract_address: strk };
                erc20_dispatcher.transfer(recipient, share_amount);
            }

            // 7. Update remaining balance and settle if all claimed
            let remaining = self.remaining_shielded_amount.read();
            if share_amount <= remaining {
                self.remaining_shielded_amount.write(remaining - share_amount);
            } else {
                self.remaining_shielded_amount.write(0);
            }

            if new_claimed >= self.beneficiary_count.read() {
                self.is_settled.write(true);
            }

            self.emit(
                BeneficiaryClaimed {
                    nullifier,
                    recipient,
                    share_amount
                }
            );
        }

        fn revoke_vault(ref self: ContractState) {
            let caller = get_caller_address();
            let owner = self.owner.read();
            assert(caller == owner, 'Only owner can revoke');
            assert(!self.is_revoked.read(), 'Already revoked');
            assert(!self.is_settled.read(), 'Already settled');

            let remaining = self.remaining_shielded_amount.read();
            self.is_revoked.write(true);
            self.remaining_shielded_amount.write(0);

            // Return remaining funds to owner
            let strk = self.strk_token.read();
            let erc20_dispatcher = IERC20Dispatcher { contract_address: strk };
            erc20_dispatcher.transfer(owner, remaining);

            self.emit(
                VaultRevoked {
                    owner,
                    refund_amount: remaining
                }
            );
        }
    }
}
