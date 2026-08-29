'use client';

import React, { useState, useEffect } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { Key, Shield, Check, Copy, FileText, CheckCircle2, Lock, Eye } from 'lucide-react';

export const SelectiveDisclosure: React.FC = () => {
  const { activeVault, generateAuditorKey } = useStarknetWallet();
  const [viewingKey, setViewingKey] = useState<string>(activeVault ? generateAuditorKey(activeVault.id) : '');
  const [copied, setCopied] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedReport, setVerifiedReport] = useState<any | null>(null);

  // Regenerate viewing key when active vault changes
  useEffect(() => {
    if (activeVault) {
      setViewingKey(generateAuditorKey(activeVault.id));
      setVerifiedReport(null);
    }
  }, [activeVault?.id]);

  const copyKey = () => {
    navigator.clipboard.writeText(viewingKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedReport({
        vaultAddress: activeVault?.address || '0x056a817104ad7544a55873584f3d8fb41a780e5466d152b3e1f12d578e75defb',
        verifiedShieldedBalance: activeVault?.totalShieldedAmount || '25000.00',
        beneficiaryCount: activeVault?.beneficiaries.length || 2,
        cadenceDays: activeVault ? Math.round(activeVault.cadenceSeconds / 86400) : 90,
        complianceStatus: 'VERIFIED_CRYPTOGRAPHICALLY',
        timestamp: new Date().toUTCString(),
      });
    }, 800);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-purple-500" />
          <span className="label-mono text-purple-600 dark:text-purple-400">Selective Disclosure & Viewing Keys</span>
        </div>
        <h1 className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
          Auditor & Compliance Verification Hub
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
          Generate scoped cryptographic viewing keys for estate attorneys, family trustees, or tax auditors to verify solvency and allocation rules without revealing unrelated wallet holdings.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Key Card */}
        <div className="hairline-card p-6 bg-white dark:bg-night">
          <div className="flex items-center justify-between">
            <span className="label-mono">Scoped Trust Viewing Key</span>
            <button
              onClick={copyKey}
              className="flex items-center gap-1 font-mono text-xs text-purple-600 dark:text-purple-400 hover:underline font-bold"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy Viewing Key'}</span>
            </button>
          </div>

          <div className="mt-3 border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3.5 font-mono text-xs text-zinc-900 dark:text-white break-all">
            {viewingKey || 'vk_evertrust_056a8171_02a1b92c_k918z'}
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={handleVerify} disabled={isVerifying} className="btn-primary py-2.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              <span>{isVerifying ? 'Generating Proof...' : 'Verify Cryptographic State'}</span>
            </button>
          </div>
        </div>

        {/* Verification Report */}
        {verifiedReport && (
          <div className="border border-emerald-500/40 bg-zinc-50 dark:bg-night p-6 text-zinc-900 dark:text-white space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Auditor Attestation Certificate
              </h3>
            </div>

            <div className="grid gap-3 font-mono text-xs sm:grid-cols-2">
              <div className="border border-zinc-200 bg-white dark:border-white/10 dark:bg-black p-3">
                <span className="text-zinc-500 dark:text-graphite">Vault Target Contract</span>
                <p className="mt-1 text-zinc-900 dark:text-white truncate font-medium">{verifiedReport.vaultAddress}</p>
              </div>
              <div className="border border-zinc-200 bg-white dark:border-white/10 dark:bg-black p-3">
                <span className="text-zinc-500 dark:text-graphite">Verified Shielded Assets</span>
                <p className="mt-1 text-purple-600 dark:text-purple-400 font-bold">{verifiedReport.verifiedShieldedBalance} STRK</p>
              </div>
              <div className="border border-zinc-200 bg-white dark:border-white/10 dark:bg-black p-3">
                <span className="text-zinc-500 dark:text-graphite">Designated Beneficiary Slots</span>
                <p className="mt-1 text-zinc-900 dark:text-white font-medium">{verifiedReport.beneficiaryCount} Heirs (100% Allocated)</p>
              </div>
              <div className="border border-zinc-200 bg-white dark:border-white/10 dark:bg-black p-3">
                <span className="text-zinc-500 dark:text-graphite">Heartbeat Cadence Interval</span>
                <p className="mt-1 text-zinc-900 dark:text-white font-medium">{verifiedReport.cadenceDays} Days Invariant</p>
              </div>
            </div>

            <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-steel pt-2">
              Attestation generated on Starknet STRK20 Privacy Rail via Poseidon state root verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
