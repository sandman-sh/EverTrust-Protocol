'use client';

import React, { useState } from 'react';
import { splitSecretIntoShards, combineShards, ShamirShard } from '@/lib/crypto';
import { Key, Shield, Layers, Plus, Trash2, Check, Copy, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShamirShardCombinerProps {
  onNavigateToClaim?: (claimKey: string) => void;
}

export const ShamirShardCombiner: React.FC<ShamirShardCombinerProps> = ({ onNavigateToClaim }) => {
  const [activeMode, setActiveMode] = useState<'combine' | 'split'>('combine');

  // Split state
  const [secretToSplit, setSecretToSplit] = useState<string>('claim_evertrust_sarah_901827419');
  const [thresholdK, setThresholdK] = useState<number>(2);
  const [totalShardsN, setTotalShardsN] = useState<number>(3);
  const [generatedShards, setGeneratedShards] = useState<ShamirShard[]>([]);
  const [copiedShardIndex, setCopiedShardIndex] = useState<number | null>(null);

  // Combine state
  const [shardsToCombine, setShardsToCombine] = useState<string[]>([
    'sss_shard_1_of_3_eyJpIjoxLCJ0IjoyLCJuIjozLCJzZWVkIjoiMzJhOTExMmEiLCJyYXciOiJZMnhoYVcxZmRYZmxjblZ6ZEY5ellYSmhhRjhnT1RBNE1qYzBNVGs9In0=',
    'sss_shard_2_of_3_eyJpIjoxLCJ0IjoyLCJuIjozLCJzZWVkIjoiMzJhOTExMmEiLCJyYXciOiJZMnhoYVcxZmRYZmxjblZ6ZEY5ellYSmhhRjhnT1RBNE1qYzBNVGs9In0=',
  ]);
  const [isCombining, setIsCombining] = useState<boolean>(false);
  const [reconstructedSecret, setReconstructedSecret] = useState<string | null>(null);
  const [combineError, setCombineError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);

  const handleGenerateShards = () => {
    if (!secretToSplit) return;
    const shards = splitSecretIntoShards(secretToSplit, totalShardsN, thresholdK);
    setGeneratedShards(shards);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#9333EA', '#A855F7', '#C084FC'],
    });
  };

  const copyShard = (idx: number, data: string) => {
    navigator.clipboard.writeText(data);
    setCopiedShardIndex(idx);
    setTimeout(() => setCopiedShardIndex(null), 2000);
  };

  const handleAddShardInput = () => {
    setShardsToCombine(prev => [...prev, '']);
  };

  const handleRemoveShardInput = (idx: number) => {
    if (shardsToCombine.length <= 2) return;
    setShardsToCombine(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateShardInput = (idx: number, value: string) => {
    setShardsToCombine(prev => prev.map((s, i) => (i === idx ? value : s)));
  };

  const handleExecuteCombine = () => {
    setIsCombining(true);
    setCombineError(null);
    setReconstructedSecret(null);

    setTimeout(() => {
      setIsCombining(false);
      const validShards = shardsToCombine.filter(s => s.trim().length > 0);
      const result = combineShards(validShards);

      if (result.success && result.secret) {
        setReconstructedSecret(result.secret);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#9333EA', '#A855F7', '#10B981', '#FFFFFF'],
        });
      } else {
        setCombineError(result.error || 'Failed to reconstruct secret.');
      }
    }, 600);
  };

  const copyReconstructedSecret = () => {
    if (reconstructedSecret) {
      navigator.clipboard.writeText(reconstructedSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 border border-purple-500/40 bg-purple-500/10 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
          <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Shamir&#39;s Threshold Secret Sharing (SSS)</span>
        </div>
        <h1 className="mt-4 font-sans text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
          Multi-Heir Shard Combiner & Splitter
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-mono text-xs text-zinc-600 dark:text-steel">
          Split confidential claim secrets into polynomial $k$-of-$n$ shards across multiple family trustees, requiring consensus to authorize an inheritance claim.
        </p>

        {/* Mode Switcher */}
        <div className="mt-6 flex justify-center gap-3 font-mono text-xs">
          <button
            onClick={() => setActiveMode('combine')}
            className={`px-5 py-2.5 font-bold transition-colors ${
              activeMode === 'combine'
                ? 'bg-purple-600 text-white'
                : 'border border-zinc-200 bg-white dark:border-white/10 dark:bg-night text-zinc-700 dark:text-steel'
            }`}
          >
            🧩 Combine Shards (Reconstruct)
          </button>
          <button
            onClick={() => setActiveMode('split')}
            className={`px-5 py-2.5 font-bold transition-colors ${
              activeMode === 'split'
                ? 'bg-purple-600 text-white'
                : 'border border-zinc-200 bg-white dark:border-white/10 dark:bg-night text-zinc-700 dark:text-steel'
            }`}
          >
            ✂️ Split Master Key (Generate Shards)
          </button>
        </div>
      </div>

      {/* Mode 1: Combine Shards */}
      {activeMode === 'combine' && (
        <div className="hairline-card mt-8 p-6 sm:p-8 bg-white dark:bg-night space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
            <div>
              <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-white">
                Reconstruct Secret from Heir Shards
              </h3>
              <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
                Provide at least 2 valid polynomial shards to reconstruct the original claim key.
              </p>
            </div>
            <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
              {shardsToCombine.filter(s => s.trim().length > 0).length} Shards Ready
            </span>
          </div>

          {/* Shard Inputs List */}
          <div className="space-y-3">
            {shardsToCombine.map((shard, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
                  <span>Shard #{idx + 1}</span>
                  {shardsToCombine.length > 2 && (
                    <button
                      onClick={() => handleRemoveShardInput(idx)}
                      className="text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={shard}
                  onChange={e => handleUpdateShardInput(idx, e.target.value)}
                  placeholder="Paste SSS shard (e.g. sss_shard_1_of_3_...)"
                  className="w-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAddShardInput}
            className="flex items-center gap-1.5 font-mono text-xs text-purple-600 dark:text-purple-400 hover:underline font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Another Shard Input</span>
          </button>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={handleExecuteCombine}
              disabled={isCombining}
              className="btn-primary w-full py-3.5 text-xs shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isCombining ? 'Computing Lagrange Interpolation...' : 'Execute Shard Interpolation & Reconstruct Key'}</span>
            </button>
          </div>

          {/* Error Notice */}
          {combineError && (
            <div className="border border-red-500/40 bg-red-500/10 p-4 font-mono text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-none" />
              <span>{combineError}</span>
            </div>
          )}

          {/* Reconstructed Secret Result */}
          {reconstructedSecret && (
            <div className="border border-emerald-500/50 bg-emerald-500/10 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <h4 className="font-sans text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Polynomial Threshold Satisfied • Master Secret Reconstructed!
                </h4>
              </div>

              <div className="border border-emerald-500/30 bg-white dark:bg-black p-3.5 font-mono text-xs font-bold text-zinc-900 dark:text-white break-all flex items-center justify-between gap-3">
                <span>{reconstructedSecret}</span>
                <button
                  onClick={copyReconstructedSecret}
                  className="flex items-center gap-1 text-[0.65rem] text-purple-600 dark:text-purple-400 hover:underline font-bold flex-none"
                >
                  {copiedSecret ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {onNavigateToClaim && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => onNavigateToClaim(reconstructedSecret)}
                    className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                  >
                    <span>Proceed to Claim Portal with Key</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Split Secret */}
      {activeMode === 'split' && (
        <div className="hairline-card mt-8 p-6 sm:p-8 bg-white dark:bg-night space-y-6">
          <div>
            <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-white">
              Split Master Key into Polynomial Shards
            </h3>
            <p className="font-mono text-[0.65rem] text-zinc-500 dark:text-graphite">
              Configure a threshold $k$-of-$n$ scheme to distribute shards to different family heirs or safe deposit boxes.
            </p>
          </div>

          <div>
            <label className="label-mono block">Secret to Split (Claim Key or Note Seed)</label>
            <input
              type="text"
              value={secretToSplit}
              onChange={e => setSecretToSplit(e.target.value)}
              placeholder="e.g. claim_evertrust_..."
              className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-mono block">Required Threshold ($k$)</label>
              <select
                value={thresholdK}
                onChange={e => setThresholdK(parseInt(e.target.value))}
                className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
              >
                <option value={2}>2 Shards Required</option>
                <option value={3}>3 Shards Required</option>
                <option value={4}>4 Shards Required</option>
              </select>
            </div>
            <div>
              <label className="label-mono block">Total Shards Issued ($n$)</label>
              <select
                value={totalShardsN}
                onChange={e => setTotalShardsN(parseInt(e.target.value))}
                className="mt-2 w-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black p-3 font-mono text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
              >
                <option value={3}>3 Total Shards</option>
                <option value={4}>4 Total Shards</option>
                <option value={5}>5 Total Shards</option>
              </select>
            </div>
          </div>

          <button onClick={handleGenerateShards} className="btn-primary w-full py-3.5 text-xs shadow-lg">
            <Layers className="h-4 w-4" />
            <span>Generate {totalShardsN} Polynomial Shards ({thresholdK}-of-{totalShardsN} Threshold)</span>
          </button>

          {/* Generated Shards List */}
          {generatedShards.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-white/10 pt-5 space-y-3">
              <h4 className="font-sans text-sm font-bold text-zinc-900 dark:text-white">
                Generated Key Shards (Distribute Individually):
              </h4>
              {generatedShards.map(shard => (
                <div key={shard.index} className="border border-purple-500/30 bg-zinc-50 dark:bg-black p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[0.65rem]">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      Shard #{shard.index} of {totalShardsN}
                    </span>
                    <button
                      onClick={() => copyShard(shard.index, shard.data)}
                      className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-bold"
                    >
                      {copiedShardIndex === shard.index ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedShardIndex === shard.index ? 'Copied' : 'Copy Shard'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-zinc-800 dark:text-steel break-all select-all">
                    {shard.data}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
