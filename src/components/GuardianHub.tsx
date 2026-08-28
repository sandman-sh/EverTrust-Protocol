'use client';

import React, { useState } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { Shield, UserCheck, CheckCircle2, AlertTriangle, Plus, Key, FileCheck, Stethoscope, Scale, Users, Sparkles } from 'lucide-react';
import { Guardian } from '@/lib/strk20';

export const GuardianHub: React.FC = () => {
  const { activeVault, toggleGuardianAttestation } = useStarknetWallet();
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianAddress, setNewGuardianAddress] = useState('');
  const [newGuardianRole, setNewGuardianRole] = useState<'Legal Counsel' | 'Medical Physician' | 'Trusted Co-Signer' | 'Family Trustee'>('Legal Counsel');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  if (!activeVault) return null;

  const guardians = activeVault.guardians || [];
  const attestedCount = guardians.filter(g => g.hasAttested).length;
  const requiredCount = Math.min(guardians.length, 2);
  const isConsensusReached = attestedCount >= requiredCount && guardians.length > 0;

  const handleToggleAttestation = async (guardianId: string) => {
    setIsProcessing(guardianId);
    await toggleGuardianAttestation(activeVault.id, guardianId);
    setIsProcessing(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Medical Physician':
        return <Stethoscope className="h-4 w-4 text-emerald-500" />;
      case 'Legal Counsel':
        return <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'Family Trustee':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-purple-500" />
          <span className="label-mono text-purple-600 dark:text-purple-400">Social Consensus & Guardians</span>
        </div>
        <h1 className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
          Social Guardians & Incapacity Attestation ({activeVault.name})
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
          Appoint legal counsel, physicians, or trusted family trustees who can submit cryptographic attestations to confirm incapacity or safeguard the trust against unauthorized claims.
        </p>
      </div>

      {/* Consensus Status Card */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="hairline-card p-6 bg-white dark:bg-night md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="label-mono">Guardian Consensus Threshold</span>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-0.5 border ${
                isConsensusReached
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400'
              }`}
            >
              {isConsensusReached ? 'CONSENSUS SATISFIED' : 'AWAITING ATTESTATIONS'}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="font-sans text-3xl font-extrabold text-zinc-900 dark:text-white">
              {attestedCount} / {guardians.length} Attested
            </div>
            <div className="h-2 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${guardians.length ? (attestedCount / guardians.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <p className="mt-3 font-mono text-xs text-zinc-600 dark:text-steel">
            {isConsensusReached
              ? '✅ Multi-sig guardian quorum reached. Smart contract allows expedited unshielding for designated heirs.'
              : `Requires at least ${requiredCount} guardian cryptographic attestations to establish verified social consensus.`}
          </p>
        </div>

        <div className="hairline-card p-6 bg-white dark:bg-night flex flex-col justify-center">
          <span className="label-mono">Security Model</span>
          <p className="mt-2 font-sans text-base font-bold text-zinc-900 dark:text-white">
            Dual-Proof Protection
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-graphite">
            Cadence timers + Social Guardian threshold signatures provide defense-in-depth against premature liquidation.
          </p>
        </div>
      </div>

      {/* Guardians List */}
      <div className="mt-8 space-y-4">
        <h3 className="font-sans text-lg font-bold text-zinc-900 dark:text-white">
          Appointed Vault Guardians ({guardians.length})
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {guardians.map(guardian => (
            <div
              key={guardian.id}
              className={`hairline-card p-6 bg-white dark:bg-night transition-all ${
                guardian.hasAttested
                  ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black">
                    {getRoleIcon(guardian.role)}
                  </div>
                  <div>
                    <h4 className="font-sans text-base font-bold text-zinc-900 dark:text-white">
                      {guardian.name}
                    </h4>
                    <span className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400 font-bold">
                      {guardian.role}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-mono text-[0.65rem] font-bold px-2 py-0.5 border ${
                    guardian.hasAttested
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black text-zinc-400'
                  }`}
                >
                  {guardian.hasAttested ? 'ATTESTED' : 'PENDING'}
                </span>
              </div>

              <div className="mt-4 border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-2.5 font-mono text-[0.7rem] text-zinc-700 dark:text-steel truncate">
                {guardian.address}
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-white/10">
                <span className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
                  {guardian.attestationTimestamp
                    ? `Signed on-chain ${new Date(guardian.attestationTimestamp * 1000).toLocaleDateString()}`
                    : 'Awaiting signature'}
                </span>

                <button
                  onClick={() => handleToggleAttestation(guardian.id)}
                  disabled={isProcessing === guardian.id}
                  className={`py-1.5 px-3 text-xs font-mono font-bold transition-colors ${
                    guardian.hasAttested
                      ? 'border border-red-500/40 text-red-500 hover:bg-red-500/10'
                      : 'btn-primary'
                  }`}
                >
                  {guardian.hasAttested ? 'Revoke Signature' : 'Simulate Sign Attestation'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
