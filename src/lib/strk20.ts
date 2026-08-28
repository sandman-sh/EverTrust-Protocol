/**
 * STRK20 Privacy Pool & Starknet Mainnet Configurations
 */

export const STARKNET_CONFIG = {
  chainId: 'SN_MAIN',
  networkName: 'Starknet Mainnet',
  rpcUrl: 'https://starknet-mainnet.public.blastapi.io',
  explorerUrl: 'https://starkscan.co',
  
  // Supported Token Addresses on Starknet Mainnet
  strkTokenAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ethTokenAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  usdcTokenAddress: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  
  // STRK20 Privacy Pool Contract Address on Mainnet
  privacyPoolAddress: '0x0254a6b2997ef52e9f830ce1f543f6b29768295e8d17e2267d672c552cfe0d91',
  
  // EverTrust Vault Factory Contract Address (Mainnet)
  evertrustFactoryAddress: '0x07a119e42c26d83a11bf74ca966f63bbbd0509844098ff63f5adef2a4a96',
  
  // Standard Default Cadence Settings
  cadencePresets: [
    { label: '30 Days (Active Trader)', seconds: 2592000, days: 30 },
    { label: '90 Days (Standard Quarterly)', seconds: 7776000, days: 90 },
    { label: '180 Days (Semi-Annual)', seconds: 15552000, days: 180 },
    { label: '365 Days (Annual Guardian)', seconds: 31536000, days: 365 },
  ],
  
  gracePeriodSeconds: 604800, // 7 days grace period
};

export interface ShieldedAsset {
  symbol: 'STRK' | 'ETH' | 'USDC';
  name: string;
  amount: string;
  tokenAddress: string;
  usdValue: number;
}

export interface VestingSchedule {
  enabled: boolean;
  initialUnlockPercent: number; // e.g. 25%
  streamingDurationDays: number; // e.g. 365 days
  totalTranches: number; // e.g. 4 quarterly tranches
}

export interface Beneficiary {
  id: string;
  name: string;
  addressOrPubKey: string;
  percentage: number; // 0 to 100
  salt?: string;
  commitment?: string;
  claimKey?: string;
  claimed?: boolean;
  encryptedMessage?: string;
  decryptedMessage?: string;
  vestingSchedule?: VestingSchedule;
}

export interface Guardian {
  id: string;
  name: string;
  address: string;
  role: 'Legal Counsel' | 'Medical Physician' | 'Trusted Co-Signer' | 'Family Trustee';
  hasAttested: boolean;
  attestationTimestamp?: number;
}

export interface TrustVault {
  id: string;
  address: string;
  ownerAddress: string;
  name: string;
  totalShieldedAmount: string; // in STRK
  cadenceSeconds: number;
  lastHeartbeatTimestamp: number;
  createdAt: number;
  gracePeriodSeconds: number;
  beneficiaries: Beneficiary[];
  state: 'ACTIVE' | 'WARNING' | 'GRACE_PERIOD' | 'UNLOCKED_FOR_CLAIM' | 'SETTLED' | 'REVOKED';
  viewingKey?: string;
  vestingSchedule?: VestingSchedule;
  guardians?: Guardian[];
  assets?: ShieldedAsset[];
}

export function formatStrkAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00 STRK';
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} STRK`;
}

export function formatTimeRemaining(seconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  if (seconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '00d 00h 00m 00s' };
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formatted = `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${remainingSeconds.toString().padStart(2, '0')}s`;

  return { days, hours, minutes, seconds: remainingSeconds, formatted };
}
