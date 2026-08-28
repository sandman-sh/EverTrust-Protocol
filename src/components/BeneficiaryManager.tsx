'use client';

import React, { useState } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { Users, Key, Copy, Check, Shield, Download, Plus, ArrowUpRight, Lock, FileText, ScrollText, Printer, QrCode } from 'lucide-react';
import { PrintableHeritageCardModal } from './PrintableHeritageCardModal';
import { Beneficiary } from '@/lib/strk20';

export const BeneficiaryManager: React.FC = () => {
  const { activeVault } = useStarknetWallet();
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [printingBeneficiary, setPrintingBeneficiary] = useState<Beneficiary | null>(null);

  if (!activeVault) return null;

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const exportBackupPackage = () => {
    const backupData = {
      vaultName: activeVault.name,
      vaultAddress: activeVault.address,
      owner: activeVault.ownerAddress,
      totalShieldedAmount: activeVault.totalShieldedAmount,
      cadenceDays: Math.round(activeVault.cadenceSeconds / 86400),
      beneficiaries: activeVault.beneficiaries,
      exportTimestamp: new Date().toISOString(),
      protocol: 'EverTrust Protocol v1.0',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evertrust-backup-${activeVault.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-purple-500" />
            <span className="label-mono text-purple-600 dark:text-purple-400">Heir Allocation & Key Shards</span>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
            Beneficiary Management ({activeVault.name})
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
            Share each secret claim key with its respective heir. Keys remain dormant until the dead man&#39;s switch triggers.
          </p>
        </div>

        <button onClick={exportBackupPackage} className="btn-ghost py-2 text-xs">
          <Download className="h-3.5 w-3.5" />
          <span>Export Backup Package</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {activeVault.beneficiaries.map((b, idx) => {
          const shareAmount = (
            (parseFloat(activeVault.totalShieldedAmount) * b.percentage) /
            100
          ).toFixed(2);

          return (
            <div key={b.id} className="hairline-card p-6 bg-white dark:bg-night flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400 font-bold">Heir Slot #{idx + 1}</span>
                    <h3 className="mt-1 font-sans text-lg font-bold text-zinc-900 dark:text-white">{b.name}</h3>
                    <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite break-all">{b.addressOrPubKey}</p>
                  </div>
                  <div className="border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-right">
                    <p className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">{b.percentage}%</p>
                    <p className="font-mono text-[0.6rem] text-zinc-600 dark:text-steel">{shareAmount} STRK</p>
                  </div>
                </div>

                {/* Cryptographic Poseidon Commitment */}
                <div className="mt-4 border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-graphite">On-Chain Poseidon Commitment:</span>
                    <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="mt-1 text-zinc-700 dark:text-steel break-all text-[0.7rem]">{b.commitment}</p>
                </div>

                {/* Encrypted Digital Will Status */}
                <div className="mt-3 border border-purple-500/30 bg-purple-500/5 dark:border-purple-500/20 dark:bg-purple-950/10 p-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1.5">
                      <Lock className="h-3 w-3" />
                      <span>Encrypted Digital Will Attached:</span>
                    </span>
                    <span className="text-[0.65rem] border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-purple-600 dark:text-purple-300 font-bold">
                      AES-GCM SHIELDED
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-500 dark:text-steel text-[0.65rem]">
                    Confidential instructions are encrypted with the heir&#39;s key and will only be decrypted upon redemption.
                  </p>
                </div>

                {/* Shareable Claim Key */}
                <div className="mt-3 border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-night p-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-graphite">Private Heir Claim Shard:</span>
                    <button
                      onClick={() => copyKey(b.id, b.claimKey || '')}
                      className="flex items-center gap-1 text-[0.65rem] text-purple-600 dark:text-purple-400 hover:underline font-bold"
                    >
                      {copiedKeyId === b.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKeyId === b.id ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <p className="mt-1 text-zinc-900 dark:text-white break-all text-[0.75rem] font-bold">
                    {b.claimKey}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Printable Heritage Card */}
              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setPrintingBeneficiary(b)}
                  className="btn-ghost py-1.5 px-3 text-xs w-full flex items-center justify-center gap-2 hover:border-purple-500"
                >
                  <Printer className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Generate Printable Heritage Card</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Modal */}
      {printingBeneficiary && (
        <PrintableHeritageCardModal
          isOpen={!!printingBeneficiary}
          onClose={() => setPrintingBeneficiary(null)}
          vault={activeVault}
          beneficiary={printingBeneficiary}
        />
      )}
    </div>
  );
};
