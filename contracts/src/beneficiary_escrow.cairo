use core::poseidon::poseidon_hash_span;

pub mod BeneficiaryEscrow {
    use core::poseidon::poseidon_hash_span;

    // Basis points denominator (100.00% = 10000)
    pub const BPS_DENOMINATOR: u16 = 10000;

    pub fn compute_commitment(heir_pubkey: felt252, percentage_bps: u16, salt: felt252) -> felt252 {
        let mut data: Array<felt252> = ArrayTrait::new();
        data.append(heir_pubkey);
        data.append(percentage_bps.into());
        data.append(salt);
        poseidon_hash_span(data.span())
    }

    pub fn compute_share_amount(total_amount: u256, percentage_bps: u16) -> u256 {
        (total_amount * percentage_bps.into()) / BPS_DENOMINATOR.into()
    }
}
