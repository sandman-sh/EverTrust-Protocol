'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Activity, Heart, ShieldCheck, AlertTriangle, Zap, Radio, CheckCircle2 } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseCount, setPulseCount] = useState<number>(1);
  const [isSurging, setIsSurging] = useState<boolean>(false);
  const [lastPingDiff, setLastPingDiff] = useState<string>('Just now');

  const prevTimestampRef = useRef<number>(lastHeartbeatTimestamp);
  const surgeIntensityRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const isHealthy = state === 'ACTIVE';
  const isGrace = state === 'GRACE_PERIOD' || state === 'WARNING';
  const isUnlocked = state === 'UNLOCKED_FOR_CLAIM' || state === 'REVOKED';

  // Trigger pulse burst whenever a ping happens or timestamp updates
  useEffect(() => {
    if (lastHeartbeatTimestamp !== prevTimestampRef.current || isPinging) {
      surgeIntensityRef.current = 1.0;
      setIsSurging(true);
      setPulseCount(prev => prev + 1);
      prevTimestampRef.current = lastHeartbeatTimestamp;

      const timer = setTimeout(() => {
        setIsSurging(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [lastHeartbeatTimestamp, isPinging]);

  // Update time elapsed since last ping
  useEffect(() => {
    const updateElapsed = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, now - lastHeartbeatTimestamp);
      if (diff < 5) {
        setLastPingDiff('Just now');
      } else if (diff < 60) {
        setLastPingDiff(`${diff}s ago`);
      } else if (diff < 3600) {
        setLastPingDiff(`${Math.floor(diff / 60)}m ago`);
      } else {
        setLastPingDiff(`${Math.floor(diff / 3600)}h ago`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 2000);
    return () => clearInterval(interval);
  }, [lastHeartbeatTimestamp]);

  // Canvas EKG Waveform Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanX = 0;
    const points: number[] = [];
    const maxPoints = 600;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 140);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 140;
      }
    };

    window.addEventListener('resize', handleResize);

    // Cardiac cycle generator
    let step = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle tactical oscilloscope grid
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Midline center reference
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const centerY = height / 2;

      // 2. Generate current amplitude value based on state and surge
      let currentVal = 0;

      if (isUnlocked) {
        // Flatline mode with minimal noise
        currentVal = (Math.random() - 0.5) * 1.5;
      } else {
        step += 1;
        const cyclePeriod = isHealthy ? 70 : 45; // faster rhythm during grace/warning
        const posInCycle = step % cyclePeriod;

        // Base P-Q-R-S-T Cardiac wave math
        if (posInCycle === 10) currentVal = -8; // P wave
        else if (posInCycle === 15) currentVal = 0;
        else if (posInCycle === 20) currentVal = 10; // Q dip
        else if (posInCycle === 24) currentVal = -55; // R sharp peak
        else if (posInCycle === 28) currentVal = 25; // S rebound
        else if (posInCycle === 35) currentVal = -12; // T wave
        else if (posInCycle === 42) currentVal = 0;
        else {
          currentVal = (Math.random() - 0.5) * 2; // subtle biological micro-jitter
        }

        // Active surge amplification when user pings!
        if (surgeIntensityRef.current > 0.02) {
          const surgeFreq = (step * 0.4) % Math.PI;
          const surgeSpike = Math.sin(surgeFreq) * 65 * surgeIntensityRef.current;
          currentVal -= surgeSpike;
          surgeIntensityRef.current *= 0.985; // smooth exponential decay
        }
      }

      // Append new sample
      points.push(centerY + currentVal);
      if (points.length > maxPoints) {
        points.shift();
      }

      // 3. Draw live waveform trace
      if (points.length > 1) {
        const primaryColor = isHealthy
          ? surgeIntensityRef.current > 0.2
            ? '#38BDF8'
            : '#A855F7'
          : isGrace
          ? '#F59E0B'
          : '#EF4444';

        // Glow filter
        ctx.shadowBlur = surgeIntensityRef.current > 0.2 ? 18 : 8;
        ctx.shadowColor = primaryColor;

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = surgeIntensityRef.current > 0.2 ? 3.5 : 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const stepX = width / maxPoints;
        for (let i = 0; i < points.length; i++) {
          const px = i * stepX;
          const py = points[i];
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // 4. Draw leading tracer bead / radar pulse head
        const lastIdx = points.length - 1;
        const headX = lastIdx * stepX;
        const headY = points[lastIdx];

        // Pulse beacon ring
        ctx.beginPath();
        ctx.arc(headX, headY, surgeIntensityRef.current > 0.2 ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = surgeIntensityRef.current > 0.2 ? '#67E8F9' : '#C084FC';
        ctx.fill();

        // Expanding shockwave ripple during ping
        if (surgeIntensityRef.current > 0.1) {
          const rippleRadius = (1 - surgeIntensityRef.current) * 45;
          ctx.beginPath();
          ctx.arc(headX, headY, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168, 85, 247, ${surgeIntensityRef.current * 0.8})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHealthy, isGrace, isUnlocked]);

  return (
    <div className="hairline-card relative overflow-hidden bg-white dark:bg-night p-6 md:p-8">
      {/* Background ambient glow that flares dynamically on pulse */}
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl transition-all duration-700 ${
          isSurging
            ? 'scale-125 opacity-40 bg-purple-500'
            : isHealthy
            ? 'opacity-20 bg-purple-600'
            : isGrace
            ? 'opacity-20 bg-yellow-500'
            : 'opacity-15 bg-red-500'
        }`}
      />

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                isSurging
                  ? 'bg-cyan-400 ring-4 ring-cyan-400/40 scale-125'
                  : isHealthy
                  ? 'bg-emerald-500 animate-pulse'
                  : isGrace
                  ? 'bg-yellow-500 animate-ping'
                  : 'bg-red-500'
              }`}
            />
            <span className="label-mono">Starknet Cadence Signal Monitor</span>
            {isSurging && (
              <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 font-mono text-[0.65rem] font-bold animate-pulse border border-purple-500/30">
                <Zap className="h-3 w-3 text-cyan-400" />
                ACTIVE PULSE BURST DETECTED
              </span>
            )}
          </div>

          <h3 className="mt-2 font-sans text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
            {isHealthy && (isSurging ? 'Heartbeat Verified — Vault State Clock Reset' : 'Active Pulse — Secured in STRK20 Shielded Pool')}
            {isGrace && 'Grace Period Warning — Heartbeat Required'}
            {isUnlocked && 'Heartbeat Inactive — Succession Unlocked for Heirs'}
            {state === 'SETTLED' && 'Succession Completed & Settled'}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-600 dark:text-steel">
            <span>Interval: {Math.round(cadenceSeconds / 86400)} Days Cadence</span>
            <span>•</span>
            <span>Last Ping: <strong className="text-purple-600 dark:text-purple-400">{lastPingDiff}</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Radio className={`h-3 w-3 ${isSurging ? 'animate-spin text-cyan-400' : 'animate-pulse'}`} />
              {isUnlocked ? '0 BPM (Flatline)' : isSurging ? '98 BPM (Surge)' : '72 BPM (Synchronized)'}
            </span>
          </div>
        </div>

        {onPing && (state === 'ACTIVE' || state === 'GRACE_PERIOD' || state === 'WARNING') && (
          <button
            onClick={onPing}
            disabled={isPinging}
            className={`btn-primary group relative px-7 py-3 text-xs shadow-lg transition-all ${
              isSurging
                ? 'scale-105 ring-4 ring-purple-500/60 shadow-purple-500/40'
                : isGrace
                ? 'animate-pulse ring-2 ring-yellow-500/50'
                : ''
            }`}
          >
            <Heart
              className={`h-4 w-4 text-white transition-transform ${
                isPinging || isSurging ? 'scale-125 animate-ping text-cyan-300' : 'animate-heartbeat group-hover:scale-125'
              }`}
            />
            <span>
              {isPinging ? 'Broadcasting Ping...' : isGrace ? '⚠ Emergency Ping — Reset Grace!' : 'Send Heartbeat Ping'}
            </span>
          </button>
        )}
      </div>

      {/* Dynamic Animated Canvas EKG Waveform */}
      <div className="relative mt-6 overflow-hidden border border-zinc-200 bg-slate-950 dark:border-white/10 dark:bg-black p-2">
        <canvas ref={canvasRef} className="h-28 w-full block" />

        {/* Live HUD telemetry overlays */}
        <div className="pointer-events-none absolute top-2.5 left-3 flex items-center gap-2 font-mono text-[0.6rem] text-purple-400/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>PROVING CHANNEL: SN_MAIN • ZERO-KNOWLEDGE PULSE</span>
        </div>

        <div className="pointer-events-none absolute bottom-2.5 right-3 flex items-center gap-2 font-mono text-[0.6rem] text-zinc-400 dark:text-graphite">
          <Activity className={`h-3 w-3 ${isSurging ? 'text-cyan-400 animate-bounce' : 'text-purple-500'}`} />
          <span>SIGNAL CYCLES VERIFIED: #{pulseCount}</span>
        </div>
      </div>
    </div>
  );
};
