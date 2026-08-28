'use client';

import React, { useState } from 'react';
import { Shield, Lock, Activity, Users, Key, ArrowRight, ArrowUpRight, CheckCircle2, FileText, ChevronRight, EyeOff, Sparkles, Heart } from 'lucide-react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { ParticleCanvas } from './ParticleCanvas';
import { SimulatorWidget } from './SimulatorWidget';

interface HeroLandingProps {
  onLaunchApp: () => void;
  onOpenClaim: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onLaunchApp, onOpenClaim }) => {
  const { isConnected, connectWallet } = useStarknetWallet();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="flex flex-col overflow-hidden bg-slate-50 dark:bg-black pt-20 transition-colors duration-200">
      {/* Hero Section with Particle Canvas */}
      <section className="relative isolate flex min-h-[92vh] flex-col justify-center overflow-hidden border-b border-zinc-200 dark:border-white/10">
        {/* Dynamic Canvas Particles */}
        <ParticleCanvas />

        {/* Crisp grid lines background overlay */}
        <div className="pointer-events-none absolute inset-0 grid-lines" />
        <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-purple-500/15 via-transparent to-transparent opacity-50 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          {/* Eyebrow badge with glow */}
          <div className="animate-fade-up inline-flex items-center gap-2 border border-purple-500/40 bg-purple-500/10 px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Starknet STRK20 Shielded Privacy Rail</span>
          </div>

          {/* Main Title — Modern Sleek Typography */}
          <h1 className="animate-fade-up mt-6 font-sans text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl">
            Autonomous Wealth Succession. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Zero Public Paper Trail.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up mx-auto mt-6 max-w-3xl font-mono text-xs leading-relaxed text-zinc-600 dark:text-steel sm:text-sm sm:leading-relaxed">
            EverTrust Protocol solves the multi-billion dollar crypto inheritance dilemma. Lock STRK into the shielded privacy pool, maintain a periodic on-chain heartbeat, and guarantee that your heirs can trustlessly claim their allocated assets into fresh unlinked wallets if you are ever incapacitated.
          </p>

          {/* Action CTAs */}
          <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onLaunchApp}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] group"
            >
              <span>Launch Trust Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onOpenClaim}
              className="btn-ghost w-full sm:w-auto px-8 py-3.5 text-sm group"
            >
              <span>Heir Claim Portal</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Protocol Metric Strip */}
          <div className="animate-fade-up mt-16 grid grid-cols-2 gap-px border border-zinc-200 bg-zinc-200 dark:border-white/10 dark:bg-white/10 md:grid-cols-4">
            <div className="bg-white dark:bg-black p-6 text-center transition-colors">
              <span className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500 dark:text-graphite">
                Protected Capital
              </span>
              <span className="mt-2 block font-sans text-2xl font-bold text-purple-600 dark:text-purple-400 md:text-3xl">
                100% Shielded
              </span>
            </div>
            <div className="bg-white dark:bg-black p-6 text-center transition-colors">
              <span className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500 dark:text-graphite">
                Public Identity Leakage
              </span>
              <span className="mt-2 block font-sans text-2xl font-bold text-purple-600 dark:text-purple-400 md:text-3xl">
                0 Bits
              </span>
            </div>
            <div className="bg-white dark:bg-black p-6 text-center transition-colors">
              <span className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500 dark:text-graphite">
                Custodian Intermediaries
              </span>
              <span className="mt-2 block font-sans text-2xl font-bold text-purple-600 dark:text-purple-400 md:text-3xl">
                0 Required
              </span>
            </div>
            <div className="bg-white dark:bg-black p-6 text-center transition-colors">
              <span className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500 dark:text-graphite">
                Settlement Verification
              </span>
              <span className="mt-2 block font-sans text-2xl font-bold text-purple-600 dark:text-purple-400 md:text-3xl">
                Cairo 2.x ZK
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-night py-3.5">
        <div className="flex w-max animate-marquee">
          <div className="flex shrink-0 items-center gap-8 px-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-700 dark:text-steel">
            <span>STRK20 Shielded Note Commitments</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Cryptographic Proof of Life</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Zero Unlinkable Heir Addresses</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Automated Dead Man&#39;s Switch</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Selective Disclosure Viewing Keys</span>
            <span className="text-purple-500 font-bold">✦</span>
          </div>
          <div className="flex shrink-0 items-center gap-8 px-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-700 dark:text-steel" aria-hidden="true">
            <span>STRK20 Shielded Note Commitments</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Cryptographic Proof of Life</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Zero Unlinkable Heir Addresses</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Automated Dead Man&#39;s Switch</span>
            <span className="text-purple-500 font-bold">✦</span>
            <span>Selective Disclosure Viewing Keys</span>
            <span className="text-purple-500 font-bold">✦</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Section */}
      <section className="border-b border-zinc-200 dark:border-white/10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 bg-purple-500" />
              <span className="label-mono text-purple-600 dark:text-purple-400">01 / Live Sandbox</span>
            </div>
            <h2 className="mt-2 font-sans text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
              Experience the Cryptographic Invariant Live
            </h2>
            <p className="mx-auto mt-2 max-w-xl font-mono text-xs text-zinc-600 dark:text-steel">
              Interact with the state machine below: emit heartbeat pings, test grace period countdowns, and verify succession unlocks.
            </p>
          </div>

          <SimulatorWidget />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-b border-zinc-200 dark:border-white/10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 bg-purple-500" />
            <span className="label-mono text-purple-600 dark:text-purple-400">02 / Protocol Lifecycle</span>
          </div>
          <h2 className="mt-4 font-sans text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            How EverTrust Protects Generational Wealth
          </h2>
          <p className="mt-3 max-w-2xl font-mono text-xs text-zinc-600 dark:text-steel">
            Four deterministic on-chain steps that eliminate the need for centralized lawyers, probate court records, or risky seed phrase paper backups.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`hairline-card p-6 transition-all duration-300 ${
                hoveredCard === 1 ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : ''
              }`}
            >
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">01. Setup</span>
              <h3 className="mt-3 font-sans text-lg font-bold text-zinc-900 dark:text-white">Create Trust & Shield STRK</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-600 dark:text-steel">
                Deposit STRK into the STRK20 Shielded Privacy Pool. Assign percentage shares to beneficiary public keys with encrypted note payloads.
              </p>
            </div>

            {/* Step 2 */}
            <div
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`hairline-card p-6 transition-all duration-300 ${
                hoveredCard === 2 ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : ''
              }`}
            >
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">02. Cadence</span>
              <h3 className="mt-3 font-sans text-lg font-bold text-zinc-900 dark:text-white">Maintain the Pulse</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-600 dark:text-steel">
                Configure your check-in interval (30, 90, 180, or 365 days). Click &quot;Send Heartbeat Ping&quot; whenever active. Each ping resets the on-chain timer.
              </p>
            </div>

            {/* Step 3 */}
            <div
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`hairline-card p-6 transition-all duration-300 ${
                hoveredCard === 3 ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : ''
              }`}
            >
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">03. Fail-Safe</span>
              <h3 className="mt-3 font-sans text-lg font-bold text-zinc-900 dark:text-white">Automated Trigger</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-600 dark:text-steel">
                If the heartbeat and 7-day grace period expire without a check-in, the Cairo state machine automatically unlocks succession for designated heirs.
              </p>
            </div>

            {/* Step 4 */}
            <div
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`hairline-card p-6 transition-all duration-300 ${
                hoveredCard === 4 ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : ''
              }`}
            >
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">04. Claim</span>
              <h3 className="mt-3 font-sans text-lg font-bold text-zinc-900 dark:text-white">Confidential Unshield</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-600 dark:text-steel">
                Beneficiaries open the claim portal, submit their ephemeral key, and unshield funds directly to a fresh address with 0 link to the deceased.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cryptography & Threat Model */}
      <section className="border-b border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-night py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 bg-purple-500" />
                <span className="label-mono text-purple-600 dark:text-purple-400">03 / Security</span>
              </div>
              <h2 className="mt-4 font-sans text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
                Cryptographic Invariants & Privacy Bounds
              </h2>
              <p className="mt-4 font-mono text-xs leading-relaxed text-zinc-600 dark:text-steel">
                EverTrust enforces absolute privacy boundaries using the mathematical properties of Starknet&#39;s native STRK20 Note Commitments and STARK proofs.
              </p>

              <div className="mt-8 space-y-3 font-mono text-xs text-zinc-700 dark:text-steel">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-purple-600 dark:text-purple-400" />
                  <span><strong>Hidden Beneficiary Identities:</strong> Heir addresses are stored as Poseidon commitments; zero plaintext is written to storage.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-purple-600 dark:text-purple-400" />
                  <span><strong>Owner Revocation:</strong> Owner can revoke the vault and reclaim 100% of shielded assets at any moment while active.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-purple-600 dark:text-purple-400" />
                  <span><strong>Viewing Key Compliance:</strong> Export cryptographic viewing keys for authorized tax auditors without revealing unrelated wallets.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="border border-zinc-200 dark:border-white/10 bg-white dark:bg-black p-6 md:p-8 shadow-2xl">
                <span className="label-mono">Privacy State Transition Proof</span>
                
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-night p-3">
                    <span className="text-zinc-500 dark:text-graphite"># 1. Note Commitment Generation</span>
                    <p className="text-zinc-800 dark:text-steel font-medium">Commitment = Poseidon(HeirPubKey || PercentageBps || SecretSalt)</p>
                  </div>
                  <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-night p-3">
                    <span className="text-zinc-500 dark:text-graphite"># 2. Heartbeat State Invariant</span>
                    <p className="text-zinc-800 dark:text-steel font-medium">State = BlockTimestamp &gt; (LastPing + Cadence + Grace) ? UNLOCKED : ACTIVE</p>
                  </div>
                  <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-night p-3">
                    <span className="text-zinc-500 dark:text-graphite"># 3. STRK20 Privacy Invoke Unshield</span>
                    <p className="text-zinc-800 dark:text-steel font-medium">Pool.unshield(STRK, ShareAmount, Nullifier, FreshRecipient, ZKProof)</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={onLaunchApp} className="btn-primary py-2.5 text-xs shadow-md">
                    Deploy Trust Vault →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
