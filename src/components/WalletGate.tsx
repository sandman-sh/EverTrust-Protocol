'use client';

import React, { useState } from 'react';
import { useStarknetWallet, WalletType } from '@/context/StarknetWalletContext';
import { Shield, Lock, Wallet, ArrowUpRight, KeyRound, X, Zap } from 'lucide-react';

interface WalletGateProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletGate: React.FC<WalletGateProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting } = useStarknetWallet();

  if (!isOpen) return null;

  const handleConnect = async (type: WalletType) => {
    const success = await connectWallet(type);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 dark:bg-black/90 p-4 backdrop-blur-lg">
      <div className="relative w-full max-w-lg overflow-hidden">
        {/* Background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 opacity-30 blur-2xl" />

        <div className="relative hairline-card bg-white dark:bg-night p-8 shadow-2xl text-zinc-900 dark:text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-900 dark:text-graphite dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon & Title */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-purple-500/60 bg-gradient-to-br from-purple-500/20 to-purple-600/10">
              <Lock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="mt-5 font-sans text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
              Wallet Connection Required
            </h2>
            <p className="mx-auto mt-3 max-w-sm font-mono text-xs leading-relaxed text-zinc-600 dark:text-steel">
              Connect your Starknet wallet to access the EverTrust Protocol dashboard, manage trust vaults, and execute shielded inheritance notes.
            </p>
          </div>

          {/* Wallet Options */}
          <div className="mt-7 grid gap-2.5">
            <button
              onClick={() => handleConnect('argentX')}
              disabled={isConnecting}
              className="flex items-center justify-between border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-4 transition-all hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-white/[0.03] hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-sans text-sm font-bold text-zinc-900 dark:text-white">Argent X</p>
                  <p className="font-mono text-[0.6rem] text-zinc-500 dark:text-graphite">Starknet Browser Extension</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-zinc-400 dark:text-graphite" />
            </button>

            <button
              onClick={() => handleConnect('braavos')}
              disabled={isConnecting}
              className="flex items-center justify-between border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-4 transition-all hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-white/[0.03] hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-sans text-sm font-bold text-zinc-900 dark:text-white">Braavos</p>
                  <p className="font-mono text-[0.6rem] text-zinc-500 dark:text-graphite">Hardware & Biometric Wallet</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-zinc-400 dark:text-graphite" />
            </button>

            <button
              onClick={() => handleConnect('test')}
              disabled={isConnecting}
              className="flex items-center justify-between border border-purple-500/50 bg-purple-500/10 p-4 transition-all hover:border-purple-500 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded bg-purple-500/30 text-purple-600 dark:text-purple-300">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-sans text-sm font-bold text-zinc-900 dark:text-white">Instant Sandbox Mode</p>
                  <p className="font-mono text-[0.6rem] text-purple-600 dark:text-purple-400">Pre-funded STRK20 Demo — No Extension Needed</p>
                </div>
              </div>
              <span className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400 font-bold">1-CLICK</span>
            </button>
          </div>

          {/* Security footer note */}
          <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[0.6rem] text-zinc-500 dark:text-graphite">
            <Shield className="h-3 w-3" />
            <span>Non-custodial. Your keys never leave your wallet.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
