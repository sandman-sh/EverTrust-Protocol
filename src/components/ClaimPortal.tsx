'use client';

import React, { useState, useEffect } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { formatStrkAmount } from '@/lib/strk20';
import { Shield, Key, Lock, CheckCircle2, AlertTriangle, ArrowRight, Wallet, Sparkles, FileText, ScrollText } from 'lucide-react';

const DEFAULT_RECIPIENT = '0x07f18a2bc41904ad7544a55873584f3d8fb41a780e5466d152b3e1f12d578e75';

export const ClaimPortal: React.FC = () => {
  const { vaults, claimInheritance, isConnected, address } = useStarknetWallet();
  const [selectedVaultId, setSelectedVaultId] = useState<string>(vaults[0]?.id || '');
  const [claimKeyInput, setClaimKeyInput] = useState<string>('claim_evertrust_sarah_901827419');
  const [beneficiaryIndex, setBeneficiaryIndex] = useState<number>(0);
  const [recipientAddress, setRecipientAddress] = useState<string>(
    address || DEFAULT_RECIPIENT
  );
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimResult, setClaimResult] = useState<{ success: boolean; amount?: string; decryptedMessage?: string; error?: string } | null>(null);

  // Sync recipient address when wallet connects (only if user hasn't customized it)
  useEffect(() => {
    if (address && (recipientAddress === DEFAULT_RECIPIENT || recipientAddress === '')) {
      setRecipientAddress(address);
    }
  }, [address]);

  const selectedVault = vaults.find(v => v.id === selectedVaultId) || vaults[0];
  const isUnlocked = selectedVault?.state === 'UNLOCKED_FOR_CLAIM';

  const handleClaim = async () => {
    if (!selectedVault) return;
    setIsClaiming(true);
    setClaimResult(null);

    const result = await claimInheritance(selectedVault.id, claimKeyInput, beneficiaryIndex, recipientAddress);
    setIsClaiming(false);
    setClaimResult(result);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 border border-purple-500/40 bg-purple-500/10 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
          <Key className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Beneficiary Redemption Rail</span>
        </div>
        <h1 className="mt-4 font-sans text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
          Confidential Inheritance Claim Portal
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-mono text-xs text-zinc-600 dark:text-steel">
          If a trust vault owner becomes inactive and the heartbeat expires, designated beneficiaries redeem their allocated STRK20 notes into unlinked fresh addresses.
        </p>
      </div>

      {/* Main Claim Card */}
      <div className="hairline-card mt-10 p-6 sm:p-8 bg-white dark:bg-night">
        <div className="space-y-6">
          {/* Select Target Vault */}
          <div>
            <label className="label-mono block">Select Trust Vault</label>
            <select
              value={selectedVaultId}
              onChange={e => setSelectedVaultId(e.target.value)}
              aria-label="Select Trust Vault to Claim From"
              className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/15 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
            >
              {vaults.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.totalShieldedAmount} STRK) — Status: {v.state}
                </option>
              ))}
            </select>
          </div>

          {/* Vault Status Warning/Success Badge */}
          <div
            className={`border p-4 ${
              isUnlocked
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {isUnlocked ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-500 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-yellow-500 dark:text-yellow-400" />
              )}
              <div className="font-mono text-xs">
                <p className="font-bold uppercase tracking-wider">
                  Vault State: {selectedVault?.state || 'ACTIVE'}
                </p>
                <p className="mt-1 text-zinc-600 dark:text-steel">
                  {isUnlocked
                    ? 'The heartbeat timer has expired with zero check-ins. Succession is now unlocked for valid keyholders.'
                    : 'The vault owner heartbeat is currently active or in grace period. Inheritance notes remain locked in the STRK20 pool.'}
                </p>
              </div>
            </div>
          </div>

          {/* Claim Key Input */}
          <div>
            <label className="label-mono block">Ephemeral Heir Secret Key / Note Shard</label>
            <input
              type="text"
              value={claimKeyInput}
              onChange={e => setClaimKeyInput(e.target.value)}
              placeholder="e.g. claim_evertrust_sarah_..."
              className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/15 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Select Heir Index */}
          <div>
            <label className="label-mono block">Beneficiary Allocation Slot</label>
            <select
              value={beneficiaryIndex}
              onChange={e => setBeneficiaryIndex(parseInt(e.target.value))}
              aria-label="Select Beneficiary Allocation Slot"
              className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/15 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
            >
              {selectedVault?.beneficiaries.map((b, idx) => (
                <option key={b.id} value={idx}>
                  Slot #{idx + 1}: {b.name} ({b.percentage}% Allocation — {b.claimed ? 'ALREADY CLAIMED' : 'UNCLAIMED'})
                </option>
              ))}
            </select>
          </div>

          {/* Fresh Recipient Address */}
          <div>
            <label className="label-mono block">Fresh Recipient Starknet Address (Zero-Link Payout)</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={e => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/15 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
            />
            <p className="mt-1.5 font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
              🛡️ Privacy Recommendation: Use a fresh, unlinked Starknet address to receive unshielded funds without any on-chain link to the deceased owner.
            </p>
          </div>

          {/* Submit Claim Action */}
          <div className="pt-4">
            <button
              onClick={handleClaim}
              disabled={isClaiming || !isUnlocked}
              className={`btn-primary w-full py-3.5 text-xs ${
                !isUnlocked ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{isClaiming ? 'Verifying ZK Proof & Unshielding...' : 'Redeem Shielded Inheritance Note'}</span>
            </button>
          </div>

          {/* Claim Outcome Result Alert */}
          {claimResult && (
            <div className="space-y-4">
              <div
                className={`border p-4 ${
                  claimResult.success
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {claimResult.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-wider">
                          Succession Payout Executed!
                        </p>
                        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
                          Transferred <strong>{claimResult.amount} STRK</strong> from the STRK20 Shielded Pool to recipient address <span className="font-bold text-zinc-900 dark:text-white">{recipientAddress.slice(0, 12)}...</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                      <p className="font-mono text-xs font-bold">{claimResult.error}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Decrypted Digital Will Showcase */}
              {claimResult.success && claimResult.decryptedMessage && (
                <div className="border border-purple-500/50 bg-purple-500/10 dark:bg-purple-950/20 p-5 shadow-lg">
                  <div className="flex items-center gap-2 border-b border-purple-500/30 pb-3">
                    <ScrollText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h4 className="font-sans text-sm font-bold text-zinc-900 dark:text-white">
                        Decrypted Confidential Digital Will & Instructions
                      </h4>
                      <p className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400">
                        AES-GCM Decryption Key Verified • Private to Heir
                      </p>
                    </div>
                  </div>
                  <div className="mt-3.5 border border-purple-500/20 bg-white dark:bg-black p-4 font-mono text-xs text-zinc-800 dark:text-white leading-relaxed whitespace-pre-wrap">
                    {claimResult.decryptedMessage}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
