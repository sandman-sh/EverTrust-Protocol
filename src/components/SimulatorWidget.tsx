'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Shield, Activity, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SimulatorWidget: React.FC = () => {
  const [daysRemaining, setDaysRemaining] = useState<number>(82);
  const [cadence, setCadence] = useState<number>(90);
  const [simState, setSimState] = useState<'ACTIVE' | 'GRACE_PERIOD' | 'UNLOCKED'>('ACTIVE');
  const [pulseCount, setPulseCount] = useState<number>(14);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  useEffect(() => {
    if (daysRemaining > 7) {
      setSimState('ACTIVE');
    } else if (daysRemaining > 0) {
      setSimState('GRACE_PERIOD');
    } else {
      setSimState('UNLOCKED');
    }
  }, [daysRemaining]);

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setDaysRemaining(cadence);
      setPulseCount(prev => prev + 1);
      setIsPinging(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#A855F7', '#C084FC', '#FFFFFF'],
      });
    }, 400);
  };

  const handleFastForward = (daysToAdvance: number) => {
    setDaysRemaining(prev => Math.max(0, prev - daysToAdvance));
  };

  return (
    <div className="hairline-card relative overflow-hidden bg-white dark:bg-night p-6 md:p-8 text-zinc-900 dark:text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-zinc-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
            <span className="label-mono">Interactive Protocol Simulator</span>
          </div>
          <h3 className="mt-1 font-sans text-lg font-bold text-zinc-900 dark:text-white">
            Test the Dead Man&#39;s Switch Invariant
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`border px-3 py-1 font-mono text-xs font-bold ${
              simState === 'ACTIVE'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : simState === 'GRACE_PERIOD'
                ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            STATE: {simState}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-12 md:items-center">
        {/* Left Column: Live Pulse & Metrics */}
        <div className="space-y-4 md:col-span-6">
          <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-4">
            <div className="flex items-center justify-between">
              <span className="label-mono">Time Until Succession Trigger</span>
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{daysRemaining} / {cadence} Days</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden bg-zinc-200 dark:bg-white/10">
              <div
                className={`h-full transition-all duration-300 ${
                  simState === 'ACTIVE' ? 'bg-purple-600 dark:bg-purple-500' : simState === 'GRACE_PERIOD' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(daysRemaining / cadence) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 text-center">
              <span className="text-zinc-500 dark:text-graphite">Total Pings</span>
              <p className="mt-1 text-base font-bold text-zinc-900 dark:text-white">{pulseCount} Verified</p>
            </div>
            <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 text-center">
              <span className="text-zinc-500 dark:text-graphite">STRK Shielded</span>
              <p className="mt-1 text-base font-bold text-purple-600 dark:text-purple-400">10,000 STRK</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Actions */}
        <div className="space-y-3 md:col-span-6">
          <button
            onClick={handlePing}
            disabled={isPinging}
            className="btn-primary w-full py-3.5 text-xs shadow-lg"
          >
            <Heart className={`h-4 w-4 ${isPinging ? 'animate-spin' : 'animate-heartbeat'}`} />
            <span>{isPinging ? 'Broadcasting State...' : 'Simulate Owner Heartbeat Ping (Reset to 90d)'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleFastForward(30)}
              className="btn-ghost py-2 text-[0.7rem]"
            >
              <span>+ Fast Forward 30 Days</span>
            </button>
            <button
              onClick={() => handleFastForward(90)}
              className="btn-ghost py-2 text-[0.7rem] text-yellow-600 dark:text-yellow-400 hover:text-yellow-500"
            >
              <span>+ Force Expiry (90d)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
