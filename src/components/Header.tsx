'use client';

import React, { useState } from 'react';
import { useStarknetWallet, WalletType } from '@/context/StarknetWalletContext';
import { useTheme } from '@/context/ThemeContext';
import { Shield, Activity, Wallet, ChevronDown, Check, X, ArrowUpRight, Copy, KeyRound, Sun, Moon, Lock } from 'lucide-react';
import type { AppTab } from '@/app/page';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  openCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openCreateModal }) => {
  const { isConnected, isConnecting, address, walletType, connectWallet, disconnectWallet } = useStarknetWallet();
  const { theme, toggleTheme } = useTheme();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletSelect = async (type: WalletType) => {
    await connectWallet(type);
    setShowWalletModal(false);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Navigation tabs configuration
  const navTabs: { key: AppTab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'beneficiaries', label: 'Beneficiaries' },
    { key: 'shards', label: 'Shamir Shards' },
    { key: 'claim', label: 'Heir Claim' },
    { key: 'audit', label: 'Viewing Keys' },
    { key: 'ledger', label: 'STRK20 Ledger' },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/90 dark:border-white/10 dark:bg-black/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('landing')}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center border border-purple-500 bg-purple-500/10 transition-colors group-hover:bg-purple-500/20">
                <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                  Ever<span className="text-purple-600 dark:text-purple-400">Trust</span>
                </span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-zinc-500 dark:text-graphite">
                  Protocol
                </span>
              </div>
            </button>

            {/* Network Badge */}
            <div className="hidden items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2.5 py-1 dark:border-white/10 dark:bg-white/[0.02] md:flex">
              <span className="h-1.5 w-1.5 animate-pulse bg-emerald-500"></span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-600 dark:text-steel">
                Starknet Mainnet
              </span>
            </div>
          </div>

          {/* Navigation Links — Only visible after wallet connection */}
          {isConnected && (
            <nav className="hidden items-center gap-1 lg:flex">
              {navTabs.map(tab => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                      isActive
                        ? 'border border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-steel dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              className="flex h-9 w-9 items-center justify-center border border-zinc-200 bg-zinc-100 text-zinc-700 transition-colors hover:border-purple-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-steel dark:hover:text-purple-400"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
            </button>

            {isConnected && (
              <button
                onClick={openCreateModal}
                className="btn-ghost hidden px-3.5 py-2 text-xs sm:inline-flex"
              >
                + Create Trust Vault
              </button>
            )}

            {isConnected && address ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2 border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-white transition-colors hover:border-purple-500"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>{truncateAddress(address)}</span>
                  <ChevronDown className="h-3 w-3 text-zinc-500 dark:text-steel" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                disabled={isConnecting}
                className="btn-primary px-4 py-2 text-xs"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 p-4 backdrop-blur-sm">
          <div className="hairline-card w-full max-w-md bg-white dark:bg-night p-6 text-zinc-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-white">
                  {isConnected ? 'Starknet Account' : 'Connect Starknet Wallet'}
                </h3>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-graphite dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isConnected && address ? (
              <div className="mt-5 space-y-4">
                <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-4">
                  <div className="flex items-center justify-between">
                    <span className="label-mono">Connected Account</span>
                    <span className="font-mono text-[0.65rem] uppercase text-emerald-500 font-bold">Active</span>
                  </div>
                  <p className="mt-2 break-all font-mono text-xs text-zinc-800 dark:text-white">{address}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-1.5 border border-zinc-200 bg-white dark:border-white/15 dark:bg-transparent px-2.5 py-1 font-mono text-[0.65rem] text-zinc-700 dark:text-steel hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? 'Copied' : 'Copy Address'}</span>
                    </button>
                    <a
                      href={`https://starkscan.co/contract/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 border border-zinc-200 bg-white dark:border-white/15 dark:bg-transparent px-2.5 py-1 font-mono text-[0.65rem] text-zinc-700 dark:text-steel hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      <span>Starkscan</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setShowWalletModal(false);
                    }}
                    className="btn-danger w-full py-2.5 text-xs"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-2.5">
                <p className="font-mono text-xs text-zinc-600 dark:text-steel">
                  Select your Starknet wallet to authorize trust vaults and execute private inheritance note proofs.
                </p>

                <div className="grid gap-2 pt-2">
                  <button
                    onClick={() => handleWalletSelect('argentX')}
                    className="flex items-center justify-between border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3.5 transition-colors hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded bg-purple-500/20 p-1 text-purple-600 dark:text-purple-400">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-sans text-sm font-semibold text-zinc-900 dark:text-white">Argent X</p>
                        <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">Starknet Browser Extension</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400 dark:text-graphite" />
                  </button>

                  <button
                    onClick={() => handleWalletSelect('braavos')}
                    className="flex items-center justify-between border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3.5 transition-colors hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded bg-blue-500/20 p-1 text-blue-600 dark:text-blue-400">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-sans text-sm font-semibold text-zinc-900 dark:text-white">Braavos</p>
                        <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">Hardware & Biometric Wallet</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400 dark:text-graphite" />
                  </button>

                  <button
                    onClick={() => handleWalletSelect('ready')}
                    className="flex items-center justify-between border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3.5 transition-colors hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded bg-purple-500/20 p-1 text-purple-600 dark:text-purple-400">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-sans text-sm font-semibold text-zinc-900 dark:text-white">Ready Wallet</p>
                        <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">STRK20 Privacy Mobile API</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400 dark:text-graphite" />
                  </button>

                  <button
                    onClick={() => handleWalletSelect('test')}
                    className="flex items-center justify-between border border-purple-500/40 bg-purple-500/10 p-3.5 transition-colors hover:border-purple-500 hover:bg-purple-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded bg-purple-500/20 p-1 text-purple-600 dark:text-purple-300">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-sans text-sm font-semibold text-zinc-900 dark:text-white">Instant Sandbox Mode</p>
                        <p className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400">Pre-funded STRK20 Demo Session</p>
                      </div>
                    </div>
                    <span className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400 font-bold">1-CLICK</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
