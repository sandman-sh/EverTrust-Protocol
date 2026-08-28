'use client';

import React, { useState } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { STARKNET_CONFIG } from '@/lib/strk20';
import { Shield, Heart, Users, X, ArrowRight, ArrowLeft, Check, Plus, Trash2, Key } from 'lucide-react';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateVaultModal: React.FC<CreateVaultModalProps> = ({ isOpen, onClose }) => {
  const { createVault, strkBalance } = useStarknetWallet();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [vaultName, setVaultName] = useState<string>('Primary Family Trust');
  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [selectedCadence, setSelectedCadence] = useState<number>(STARKNET_CONFIG.cadencePresets[1].seconds); // 90 days

  const [beneficiaries, setBeneficiaries] = useState<
    { name: string; addressOrPubKey: string; percentage: number }[]
  >([
    {
      name: 'Primary Beneficiary (Child)',
      addressOrPubKey: '0x04ff4f083a4667930efe14963645f9bda00bb10d44e4c13a9ee808e66c076211',
      percentage: 70,
    },
    {
      name: 'Secondary Beneficiary (Partner)',
      addressOrPubKey: '0x03ce58babb9bc3651131657c273aae00cca554ffdccb13dba8b2d06ce60d61d5',
      percentage: 30,
    },
  ]);

  if (!isOpen) return null;

  const totalPercentage = beneficiaries.reduce((acc, b) => acc + (Number(b.percentage) || 0), 0);

  const addBeneficiary = () => {
    setBeneficiaries(prev => [
      ...prev,
      {
        name: `Beneficiary #${prev.length + 1}`,
        addressOrPubKey: '',
        percentage: Math.max(0, 100 - totalPercentage),
      },
    ]);
  };

  const removeBeneficiary = (idx: number) => {
    if (beneficiaries.length <= 1) return;
    setBeneficiaries(prev => prev.filter((_, i) => i !== idx));
  };

  const updateBeneficiary = (idx: number, field: string, value: any) => {
    setBeneficiaries(prev =>
      prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = async () => {
    if (totalPercentage !== 100) {
      setError(`Total beneficiary allocation must equal 100% (currently ${totalPercentage}%)`);
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid STRK deposit amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createVault(vaultName, depositAmount, selectedCadence, beneficiaries);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to deploy trust vault');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 p-4 backdrop-blur-md">
      <div className="hairline-card w-full max-w-2xl bg-white dark:bg-night p-6 sm:p-8 shadow-2xl text-zinc-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-purple-500 bg-purple-500/10">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-zinc-900 dark:text-white">Create Confidential Trust Vault</h3>
              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-zinc-500 dark:text-graphite">
                Step {step} of 3 • STRK20 Shielded Succession
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:text-graphite dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 border border-red-500/40 bg-red-500/10 p-3 font-mono text-xs text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Name & Deposit */}
        {step === 1 && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="label-mono block">Trust Vault Name</label>
              <input
                type="text"
                value={vaultName}
                onChange={e => setVaultName(e.target.value)}
                placeholder="e.g. Family Estate Fund"
                className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/15 dark:bg-black p-3 font-sans text-sm text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label-mono">STRK Shielded Deposit</label>
                <span className="font-mono text-xs text-zinc-500 dark:text-steel">Available: {strkBalance} STRK</span>
              </div>
              <div className="relative mt-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full border border-zinc-200 bg-zinc-50 dark:border-white/15 dark:bg-black p-3 font-mono text-base text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
                />
                <span className="absolute right-3 top-3.5 font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">STRK</span>
              </div>
              <p className="mt-2 font-mono text-[0.7rem] text-zinc-500 dark:text-steel">
                ⚡ Funds are atomically transferred and shielded into the STRK20 Privacy Pool.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Cadence Interval */}
        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="label-mono block">Heartbeat Check-In Cadence</label>
              <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
                How often must you send an on-chain heartbeat ping before the vault unlocks for heirs?
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {STARKNET_CONFIG.cadencePresets.map(preset => (
                  <button
                    key={preset.seconds}
                    type="button"
                    onClick={() => setSelectedCadence(preset.seconds)}
                    className={`border p-4 text-left transition-colors ${
                      selectedCadence === preset.seconds
                        ? 'border-purple-500 bg-purple-500/10 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-black dark:text-steel hover:border-purple-400'
                    }`}
                  >
                    <p className="font-sans text-sm font-bold text-zinc-900 dark:text-white">{preset.label}</p>
                    <p className="mt-1 font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
                      {preset.days} days cadence interval
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-4">
              <span className="label-mono">Grace Period Invariant</span>
              <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
                +7 Days Grace Period automatically added after cadence expiry before unshielding activates.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Beneficiary Allocations */}
        {step === 3 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="label-mono">Designate Beneficiaries & Shares</label>
              <span
                className={`font-mono text-xs font-bold ${
                  totalPercentage === 100 ? 'text-emerald-500 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'
                }`}
              >
                Total: {totalPercentage}% / 100%
              </span>
            </div>

            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {beneficiaries.map((b, idx) => (
                <div key={idx} className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={b.name}
                      onChange={e => updateBeneficiary(idx, 'name', e.target.value)}
                      placeholder="Beneficiary Name / Relation"
                      className="border border-zinc-200 bg-white dark:border-white/10 dark:bg-night p-2 font-sans text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none w-full"
                    />
                    <div className="flex items-center gap-1 w-28 flex-none">
                      <input
                        type="number"
                        value={b.percentage}
                        onChange={e => updateBeneficiary(idx, 'percentage', parseFloat(e.target.value) || 0)}
                        className="border border-zinc-200 bg-white dark:border-white/10 dark:bg-night p-2 font-mono text-xs text-zinc-900 dark:text-white text-right focus:border-purple-500 focus:outline-none w-full"
                      />
                      <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">%</span>
                    </div>
                    {beneficiaries.length > 1 && (
                      <button
                        onClick={() => removeBeneficiary(idx)}
                        className="text-zinc-400 hover:text-red-500 dark:text-graphite dark:hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={b.addressOrPubKey}
                    onChange={e => updateBeneficiary(idx, 'addressOrPubKey', e.target.value)}
                    placeholder="Starknet Address or Ephemeral Public Key (0x...)"
                    className="w-full border border-zinc-200 bg-white dark:border-white/10 dark:bg-night p-2 font-mono text-[0.7rem] text-zinc-700 dark:text-steel focus:border-purple-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addBeneficiary}
              type="button"
              className="flex items-center gap-1.5 font-mono text-xs text-purple-600 dark:text-purple-400 hover:underline pt-1 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Another Beneficiary</span>
            </button>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-200 dark:border-white/10 pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="btn-ghost py-2 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="btn-primary py-2 text-xs"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || totalPercentage !== 100}
              className="btn-primary py-2 text-xs"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Deploying on Starknet...' : 'Deploy Trust Vault'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
