'use client';

import React from 'react';
import { Shield, Lock, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-black py-12 text-zinc-600 dark:text-steel transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center border border-purple-500 bg-purple-500/10">
                <Shield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-sans text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                Ever<span className="text-purple-600 dark:text-purple-400">Trust</span> Protocol
              </span>
            </div>
            <p className="max-w-sm font-mono text-[0.7rem] text-zinc-500 dark:text-graphite">
              Autonomous, confidential digital wealth succession and dead man&#39;s switch protocol powered by Starknet STRK20 shielded notes.
            </p>
          </div>

          {/* Protocol Links */}
          <div className="flex flex-wrap gap-8 font-mono text-xs text-zinc-600 dark:text-steel">
            <div>
              <p className="label-mono text-zinc-900 dark:text-white mb-2">Contracts</p>
              <ul className="space-y-1.5 text-zinc-500 dark:text-graphite">
                <li><a href="https://starkscan.co" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 dark:hover:text-purple-400">EverTrustVault.cairo</a></li>
                <li><a href="https://starkscan.co" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 dark:hover:text-purple-400">STRK20 Pool Mainnet</a></li>
              </ul>
            </div>

            <div>
              <p className="label-mono text-zinc-900 dark:text-white mb-2">Specifications</p>
              <ul className="space-y-1.5 text-zinc-500 dark:text-graphite">
                <li><span className="hover:text-zinc-900 dark:hover:text-steel cursor-default">Poseidon Note Commitments</span></li>
                <li><span className="hover:text-zinc-900 dark:hover:text-steel cursor-default">Zero-Knowledge Nullifiers</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between border-t border-zinc-200 dark:border-white/5 pt-6 font-mono text-[0.65rem] text-zinc-500 dark:text-graphite sm:flex-row sm:items-center">
          <p>© 2026 EverTrust Protocol. Open source under MIT License.</p>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-700 dark:text-steel">Starknet Mainnet Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
