pub mod HeartbeatLogic {
    // Vault States
    pub const STATE_INACTIVE: u8 = 0;
    pub const STATE_ACTIVE: u8 = 1;
    pub const STATE_GRACE_PERIOD: u8 = 2;
    pub const STATE_UNLOCKED_FOR_CLAIM: u8 = 3;
    pub const STATE_SETTLED: u8 = 4;
    pub const STATE_REVOKED: u8 = 5;

    // Standard Cadence presets (in seconds)
    pub const CADENCE_30_DAYS: u64 = 2592000;
    pub const CADENCE_90_DAYS: u64 = 7776000;
    pub const CADENCE_180_DAYS: u64 = 15552000;
    pub const CADENCE_365_DAYS: u64 = 31536000;
    pub const DEFAULT_GRACE_PERIOD: u64 = 604800; // 7 days

    pub fn compute_vault_state(
        current_time: u64,
        last_heartbeat: u64,
        cadence: u64,
        grace_period: u64,
        is_revoked: bool,
        is_settled: bool
    ) -> u8 {
        if is_revoked {
            return STATE_REVOKED;
        }
        if is_settled {
            return STATE_SETTLED;
        }
        if last_heartbeat == 0 {
            return STATE_INACTIVE;
        }

        let expiry_time = last_heartbeat + cadence;
        if current_time <= expiry_time {
            return STATE_ACTIVE;
        }

        let grace_expiry = expiry_time + grace_period;
        if current_time <= grace_expiry {
            return STATE_GRACE_PERIOD;
        }

        return STATE_UNLOCKED_FOR_CLAIM;
    }
}
