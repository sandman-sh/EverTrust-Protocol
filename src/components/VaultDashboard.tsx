'use client';

import React, { useState, useEffect } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { formatStrkAmount, formatTimeRemaining } from '@/lib/strk20';
import { HeartbeatVisualizer } from './HeartbeatVisualizer';
import { Shield, Heart, Users, Key, AlertTriangle, ArrowUpRight, Copy, Check, RefreshCw, Trash2 } from 'lucide-react';

interface VaultDashboardProps {
  onOpenCreate: () => void;
  onOpenClaim: () => void;
  onOpenBeneficiaries: () => void;
  onOpenAudit: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  onOpenCreate,
  onOpenClaim,
  onOpenBeneficiaries,
  onOpenAudit,
}) => {
  const { vaults, activeVault, pingHeartbeat, revokeVault, setActiveVaultId, address } = useStarknetWallet();
  const [isPinging, setIsPinging] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Update countdown timer every second
  useEffect(() => {
    if (!activeVault) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiry = activeVault.lastHeartbeatTimestamp + activeVault.cadenceSeconds;
      const diff = expiry - now;
      setSecondsRemaining(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeVault]);

  const handlePing = async () => {
    if (!activeVault) return;
    setIsPinging(true);
    await pingHeartbeat(activeVault.id);
    setIsPinging(false);
  };

  const handleRevoke = async () => {
    if (!activeVault) return;
    if (confirm('Are you sure you want to revoke this trust vault and reclaim all shielded STRK?')) {
      await revokeVault(activeVault.id);
    }
  };

  if (!activeVault) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="hairline-card p-12 text-center bg-white dark:bg-night">
          <Shield className="mx-auto h-12 w-12 text-purple-600 dark:text-purple-400" />
          <h2 className="mt-4 font-sans text-2xl font-bold text-zinc-900 dark:text-white">No Active Trust Vaults Found</h2>
          <p className="mx-auto mt-2 max-w-md font-mono text-xs text-zinc-600 dark:text-steel">
            Deploy your first confidential estate succession vault on Starknet STRK20.
          </p>
          <button onClick={onOpenCreate} className="btn-primary mt-6">
            + Create Trust Vault
          </button>
        </div>
      </div>
    );
  }

  const timeData = formatTimeRemaining(secondsRemaining);
  const percentElapsed = Math.min(
    100,
    Math.max(0, ((activeVault.cadenceSeconds - secondsRemaining) / activeVault.cadenceSeconds) * 100)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header & Vault Selector */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 bg-purple-500" />
            <span className="label-mono text-purple-600 dark:text-purple-400">Trust Vault Control Center</span>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
            {activeVault.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-graphite break-all">
            Contract: {activeVault.address}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Switch Vault Selector if multiple */}
          {vaults.length > 1 && (
            <select
              value={activeVault.id}
              onChange={e => setActiveVaultId(e.target.value)}
              aria-label="Select Active Trust Vault"
              className="border border-zinc-200 bg-white dark:border-white/15 dark:bg-night px-3 py-2 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
            >
              {vaults.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.totalShieldedAmount} STRK)
                </option>
              ))}
            </select>
          )}

          <button onClick={onOpenCreate} className="btn-ghost py-2 text-xs">
            + New Vault
          </button>
        </div>
      </div>

      {/* Main Grid: Life Pulse Monitor & Circular Timer */}
      <div className="mt-8 space-y-6">
        {/* Heartbeat EKG Pulse Visualizer */}
        <HeartbeatVisualizer
          state={activeVault.state}
          cadenceSeconds={activeVault.cadenceSeconds}
          lastHeartbeatTimestamp={activeVault.lastHeartbeatTimestamp}
          onPing={handlePing}
          isPinging={isPinging}
        />

        {/* 3 Metric Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Shielded Capital */}
          <div className="hairline-card p-6 bg-white dark:bg-night">
            <div className="flex items-center justify-between">
              <span className="label-mono">Shielded Assets</span>
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="mt-3 font-sans text-3xl font-bold text-zinc-900 dark:text-white">
              {formatStrkAmount(activeVault.totalShieldedAmount)}
            </p>
            <p className="mt-2 font-mono text-[0.7rem] text-zinc-600 dark:text-steel">
              Pooled in STRK20 Privacy Rail • 0 Public Balance Leakage
            </p>
            <div className="mt-4 border-t border-zinc-200 dark:border-white/10 pt-3">
              <span className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
                Protected Value: ~${(parseFloat(activeVault.totalShieldedAmount) * 0.45).toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Card 2: Countdown Timer */}
          <div className="hairline-card p-6 bg-white dark:bg-night">
            <div className="flex items-center justify-between">
              <span className="label-mono">Next Check-In Due</span>
              <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-zinc-900 dark:text-white">
              {timeData.formatted}
            </p>
            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden bg-zinc-200 dark:bg-white/10">
              <div
                className={`h-full transition-all duration-500 ${
                  percentElapsed > 85 ? 'bg-red-500' : percentElapsed > 60 ? 'bg-yellow-500' : 'bg-purple-600 dark:bg-purple-500'
                }`}
                style={{ width: `${percentElapsed}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
              <span>Elapsed: {Math.round(percentElapsed)}%</span>
              <span>Cadence: {Math.round(activeVault.cadenceSeconds / 86400)}d</span>
            </div>
          </div>

          {/* Card 3: Beneficiaries & Allocation */}
          <div className="hairline-card p-6 bg-white dark:bg-night">
            <div className="flex items-center justify-between">
              <span className="label-mono">Allocated Heirs</span>
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="mt-3 font-sans text-3xl font-bold text-zinc-900 dark:text-white">
              {activeVault.beneficiaries.length} Designated
            </p>
            <p className="mt-2 font-mono text-[0.7rem] text-zinc-600 dark:text-steel">
              100% of capital assigned to Poseidon commitments
            </p>
            <div className="mt-4 flex gap-2 border-t border-zinc-200 dark:border-white/10 pt-3">
              <button
                onClick={onOpenBeneficiaries}
                className="flex items-center gap-1 font-mono text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
              >
                <span>Manage Heirs</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Token Shielded Asset Basket */}
        <div className="hairline-card p-6 bg-white dark:bg-night space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Multi-Asset Shielded Portfolio Basket
              </h3>
            </div>
            <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
              Total USD Value: ~$30,900 USD
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(activeVault.assets || [
              { symbol: 'STRK', name: 'Starknet Token', amount: '25,000.00', usdValue: 8750 },
              { symbol: 'ETH', name: 'Ethereum L2', amount: '4.50', usdValue: 12150 },
              { symbol: 'USDC', name: 'USD Coin', amount: '10,000.00', usdValue: 10000 },
            ]).map(asset => (
              <div key={asset.symbol} className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-bold text-zinc-900 dark:text-white">{asset.symbol}</span>
                  <span className="font-mono text-[0.65rem] border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-purple-600 dark:text-purple-300 font-bold">
                    SHIELDED
                  </span>
                </div>
                <p className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                  {asset.amount} {asset.symbol}
                </p>
                <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
                  ≈ ${asset.usdValue.toLocaleString()} USD
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficiaries Breakdown Table */}
        <div className="hairline-card overflow-hidden bg-white dark:bg-night">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Designated Beneficiaries & Key Shards
              </h3>
            </div>
            <button
              onClick={onOpenBeneficiaries}
              className="btn-ghost py-1.5 px-3 text-[0.7rem]"
            >
              Configure Allocations
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-night text-[0.65rem] uppercase tracking-wider text-zinc-500 dark:text-graphite">
                <tr>
                  <th className="py-3.5 px-5">Beneficiary / Heir</th>
                  <th className="py-3.5 px-5">Allocation Share</th>
                  <th className="py-3.5 px-5">Shielded Entitlement</th>
                  <th className="py-3.5 px-5">ZK Commitment Hash</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5 bg-white dark:bg-black">
                {activeVault.beneficiaries.map((b, idx) => {
                  const shareAmount = (
                    (parseFloat(activeVault.totalShieldedAmount) * b.percentage) /
                    100
                  ).toFixed(2);

                  return (
                    <tr key={b.id} className="transition-colors hover:bg-purple-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-4 px-5">
                        <p className="font-sans font-semibold text-zinc-900 dark:text-white">{b.name}</p>
                        <p className="text-[0.65rem] text-zinc-500 dark:text-graphite">{b.addressOrPubKey.slice(0, 16)}...</p>
                      </td>
                      <td className="py-4 px-5">
                        <span className="border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-purple-600 dark:text-purple-300 font-bold">
                          {b.percentage}%
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-white">
                        {shareAmount} STRK
                      </td>
                      <td className="py-4 px-5 text-zinc-600 dark:text-steel">
                        {b.commitment ? `${b.commitment.slice(0, 12)}...` : 'Pending'}
                      </td>
                      <td className="py-4 px-5">
                        {b.claimed ? (
                          <span className="text-emerald-500 font-bold">Claimed ✓</span>
                        ) : (
                          <span className="text-zinc-500 dark:text-graphite">Locked in Pool</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Controls & Emergency Revocation */}
        <div className="flex flex-col justify-between gap-4 border border-zinc-200 bg-white dark:border-white/10 dark:bg-night p-6 sm:flex-row sm:items-center">
          <div>
            <h4 className="font-sans text-sm font-bold text-zinc-900 dark:text-white">Auditor & Compliance Viewing Keys</h4>
            <p className="mt-0.5 font-mono text-xs text-zinc-600 dark:text-steel">
              Generate a cryptographic viewing key for estate lawyers or tax auditors without revealing your wallet history.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onOpenAudit} className="btn-ghost text-xs">
              <Key className="h-3.5 w-3.5" />
              <span>Viewing Keys</span>
            </button>
            <button onClick={handleRevoke} className="btn-danger text-xs">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Revoke Vault</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
