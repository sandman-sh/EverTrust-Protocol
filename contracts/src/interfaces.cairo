use starknet::ContractAddress;

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn name(self: @TContractState) -> felt252;
    fn symbol(self: @TContractState) -> felt252;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
}

#[starknet::interface]
pub trait ISTRK20Pool<TContractState> {
    fn shield(ref self: TContractState, token: ContractAddress, amount: u256, commitment: felt252);
    fn unshield(
        ref self: TContractState,
        token: ContractAddress,
        amount: u256,
        nullifier: felt252,
        recipient: ContractAddress,
        proof: Array<felt252>
    );
    fn get_pool_balance(self: @TContractState, token: ContractAddress) -> u256;
}

#[starknet::interface]
pub trait IEverTrustVault<TContractState> {
    fn ping_heartbeat(ref self: TContractState);
    fn get_vault_state(self: @TContractState) -> u8;
    fn get_last_heartbeat(self: @TContractState) -> u64;
    fn get_cadence(self: @TContractState) -> u64;
    fn get_next_expiry(self: @TContractState) -> u64;
    fn get_total_shielded(self: @TContractState) -> u256;
    fn get_owner(self: @TContractState) -> ContractAddress;
    fn get_beneficiary_count(self: @TContractState) -> u32;
    fn get_beneficiary_commitment(self: @TContractState, index: u32) -> felt252;
    fn is_nullifier_claimed(self: @TContractState, nullifier: felt252) -> bool;
    fn claim_inheritance(
        ref self: TContractState,
        beneficiary_index: u32,
        heir_pubkey: felt252,
        percentage_bps: u16,
        salt: felt252,
        nullifier: felt252,
        claim_proof: Array<felt252>,
        recipient: ContractAddress
    );
    fn revoke_vault(ref self: TContractState);
}
