'use client';

import React, { useState } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { Clock, Shield, ArrowRight, CheckCircle2, Lock, Sparkles, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { formatStrkAmount } from '@/lib/strk20';

export const VestingManager: React.FC = () => {
  const { activeVault } = useStarknetWallet();
  const [selectedHeirIndex, setSelectedHeirIndex] = useState<number>(0);
  const [simulatedElapsedMonths, setSimulatedElapsedMonths] = useState<number>(3);

  if (!activeVault) return null;

  const beneficiary = activeVault.beneficiaries[selectedHeirIndex] || activeVault.beneficiaries[0];
  const totalHeirAllocation = (parseFloat(activeVault.totalShieldedAmount) * beneficiary.percentage) / 100;

  // 4 quarterly tranches: 25% immediate, 25% at 3m, 25% at 6m, 25% at 9m
  const tranches = [
    { number: 1, label: 'Tranche 1 (Immediate Succession Claim)', percent: 25, monthOffset: 0 },
    { number: 2, label: 'Tranche 2 (+90 Days Quarterly Release)', percent: 25, monthOffset: 3 },
    { number: 3, label: 'Tranche 3 (+180 Days Semi-Annual Release)', percent: 25, monthOffset: 6 },
    { number: 4, label: 'Tranche 4 (+270 Days Final Settlement)', percent: 25, monthOffset: 9 },
  ];

  // Calculate unlocked amount based on simulated months
  let unlockedPercent = 25;
  if (simulatedElapsedMonths >= 9) unlockedPercent = 100;
  else if (simulatedElapsedMonths >= 6) unlockedPercent = 75;
  else if (simulatedElapsedMonths >= 3) unlockedPercent = 50;

  const unlockedAmount = (totalHeirAllocation * unlockedPercent) / 100;
  const lockedAmount = totalHeirAllocation - unlockedAmount;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-purple-500" />
          <span className="label-mono text-purple-600 dark:text-purple-400">Trust Fund & Vesting Schedules</span>
        </div>
        <h1 className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
          Time-Locked Milestone Payouts ({activeVault.name})
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
          Protect younger beneficiaries and long-term generational wealth with automated on-chain vesting tranches rather than a single lump-sum payout.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Left Column: Heir Selector & Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="hairline-card p-6 bg-white dark:bg-night space-y-4">
            <div>
              <label className="label-mono block">Select Beneficiary Trust</label>
              <select
                value={selectedHeirIndex}
                onChange={e => setSelectedHeirIndex(parseInt(e.target.value))}
                className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
              >
                {activeVault.beneficiaries.map((b, idx) => (
                  <option key={b.id} value={idx}>
                    {b.name} ({b.percentage}% Allocation)
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-purple-500/30 bg-purple-500/5 p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-graphite">Total Allocation:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {totalHeirAllocation.toFixed(2)} STRK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-graphite">Vesting Schedule:</span>
                <span className="font-bold text-zinc-900 dark:text-white">4 Tranches (12 Mo)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-graphite">Immediate Unlock:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">25.00%</span>
              </div>
            </div>

            {/* Interactive Timeline Simulator Slider */}
            <div className="pt-2">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-zinc-500 dark:text-graphite">Simulate Time Elapsed:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  Month {simulatedElapsedMonths} / 12
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="3"
                value={simulatedElapsedMonths}
                onChange={e => setSimulatedElapsedMonths(parseInt(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between font-mono text-[0.6rem] text-zinc-400 mt-1">
                <span>Unlock (M0)</span>
                <span>M3</span>
                <span>M6</span>
                <span>M9</span>
                <span>Complete (M12)</span>
              </div>
            </div>
          </div>

          {/* Real-Time Balance Status */}
          <div className="hairline-card p-6 bg-white dark:bg-night space-y-4">
            <h3 className="font-sans text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Vesting State (Month {simulatedElapsedMonths})
            </h3>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="border border-emerald-500/30 bg-emerald-500/10 p-3">
                <span className="text-[0.65rem] text-emerald-700 dark:text-emerald-300 block">Claimable Unshielded</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {unlockedAmount.toFixed(2)} STRK
                </span>
              </div>
              <div className="border border-zinc-200 dark:border-white/10 p-3 bg-zinc-50 dark:bg-black">
                <span className="text-[0.65rem] text-zinc-500 dark:text-steel block">Time-Locked In Pool</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {lockedAmount.toFixed(2)} STRK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tranche Roadmap */}
        <div className="lg:col-span-8">
          <div className="hairline-card p-6 sm:p-8 bg-white dark:bg-night space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-white">
                  Automated On-Chain Release Tranches
                </h3>
                <p className="font-mono text-xs text-zinc-500 dark:text-graphite">
                  Calculated by Starknet block timestamps using Poseidon milestone proofs.
                </p>
              </div>
              <div className="border border-purple-500/40 bg-purple-500/10 px-3 py-1 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                {unlockedPercent}% Unlocked
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {tranches.map(t => {
                const isTrancheUnlocked = simulatedElapsedMonths >= t.monthOffset;
                const trancheAmount = (totalHeirAllocation * t.percent) / 100;

                return (
                  <div
                    key={t.number}
                    className={`border p-4 transition-all ${
                      isTrancheUnlocked
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10'
                        : 'border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-7 w-7 flex items-center justify-center rounded-full font-mono text-xs font-bold ${
                            isTrancheUnlocked
                              ? 'bg-emerald-500 text-white'
                              : 'border border-zinc-300 dark:border-white/20 text-zinc-500'
                          }`}
                        >
                          {isTrancheUnlocked ? <CheckCircle2 className="h-4 w-4" /> : t.number}
                        </div>
                        <div>
                          <p className="font-sans text-sm font-bold text-zinc-900 dark:text-white">
                            {t.label}
                          </p>
                          <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
                            {t.percent}% of total allocation • {isTrancheUnlocked ? 'STATUS: CLAIMABLE' : 'STATUS: TIME-LOCKED'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {trancheAmount.toFixed(2)} STRK
                        </p>
                        <span
                          className={`text-[0.6rem] font-bold uppercase tracking-wider ${
                            isTrancheUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                          }`}
                        >
                          {isTrancheUnlocked ? 'Unlocked on-chain' : `Unlocks Month ${t.monthOffset}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Smart Contract Invariant Note */}
            <div className="border-t border-zinc-200 dark:border-white/10 pt-4 flex items-center gap-2 font-mono text-[0.65rem] text-zinc-500 dark:text-steel">
              <Shield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-none" />
              <span>
                Cairo Smart Contract Invariant: Funds remain shielded inside the STRK20 Privacy Pool until block timestamp matches tranche milestones.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
