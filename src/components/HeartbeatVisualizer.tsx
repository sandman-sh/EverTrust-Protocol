'use client';

import React from 'react';
import { Activity, Heart, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';

interface HeartbeatVisualizerProps {
  state: 'ACTIVE' | 'WARNING' | 'GRACE_PERIOD' | 'UNLOCKED_FOR_CLAIM' | 'SETTLED' | 'REVOKED';
  cadenceSeconds: number;
  lastHeartbeatTimestamp: number;
  onPing?: () => void;
  isPinging?: boolean;
}

export const HeartbeatVisualizer: React.FC<HeartbeatVisualizerProps> = ({
  state,
  cadenceSeconds,
  lastHeartbeatTimestamp,
  onPing,
  isPinging = false,
}) => {
  const isHealthy = state === 'ACTIVE';
  const isGrace = state === 'GRACE_PERIOD' || state === 'WARNING';
  const isUnlocked = state === 'UNLOCKED_FOR_CLAIM';

  return (
    <div className="hairline-card relative overflow-hidden bg-white dark:bg-night p-6 md:p-8">
      {/* Background ambient glow */}
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl opacity-20 ${
          isHealthy ? 'bg-purple-600' : isGrace ? 'bg-yellow-500' : 'bg-red-500'
        }`}
      />

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isHealthy
                  ? 'bg-emerald-500 animate-pulse'
                  : isGrace
                  ? 'bg-yellow-500 animate-ping'
                  : 'bg-red-500'
              }`}
            />
            <span className="label-mono">On-Chain Life Signal Monitor</span>
          </div>
          <h3 className="mt-2 font-sans text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
            {isHealthy && 'Active Pulse — Vault Secured in STRK20 Pool'}
            {isGrace && 'Grace Period Warning — Heartbeat Required'}
            {isUnlocked && 'Heartbeat Inactive — Succession Unlocked for Heirs'}
            {state === 'SETTLED' && 'Succession Completed & Settled'}
            {state === 'REVOKED' && 'Vault Revoked by Owner'}
          </h3>
          <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
            Cadence: {Math.round(cadenceSeconds / 86400)} Days interval • Zero-Knowledge Note Shielding
          </p>
        </div>

        {onPing && state === 'ACTIVE' && (
          <button
            onClick={onPing}
            disabled={isPinging}
            className="btn-primary group relative px-6 py-3 text-xs shadow-lg"
          >
            <Heart className={`h-4 w-4 text-white transition-transform group-hover:scale-125 ${isPinging ? 'animate-spin' : 'animate-heartbeat'}`} />
            <span>{isPinging ? 'Broadcasting Ping...' : 'Send Heartbeat Ping'}</span>
          </button>
        )}
      </div>

      {/* SVG EKG Pulse Waveform */}
      <div className="relative mt-6 h-20 w-full overflow-hidden border border-zinc-200 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-2">
        <svg
          viewBox="0 0 800 100"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(147, 51, 234, 0.15)" strokeDasharray="4 4" />
          
          {/* Animated glowing heartbeat line */}
          <path
            d="M 0,50 L 150,50 L 170,45 L 185,55 L 200,50 L 250,50 L 270,10 L 285,90 L 300,30 L 315,60 L 330,50 L 450,50 L 470,45 L 485,55 L 500,50 L 550,50 L 570,10 L 585,90 L 600,30 L 615,60 L 630,50 L 800,50"
            fill="none"
            stroke={isHealthy ? '#A855F7' : isGrace ? '#EAB308' : '#EF4444'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />

          {/* Pulse head marker */}
          <circle cx="585" cy="90" r="4" fill="#C084FC" className="animate-ping" />
        </svg>

        {/* Live scanning overlay text */}
        <div className="pointer-events-none absolute bottom-1.5 right-3 flex items-center gap-2 font-mono text-[0.6rem] text-zinc-500 dark:text-graphite">
          <Activity className="h-3 w-3 text-purple-600 dark:text-purple-400" />
          <span>REALTIME STARKNET CADENCE MONITOR</span>
        </div>
      </div>
    </div>
  );
};
