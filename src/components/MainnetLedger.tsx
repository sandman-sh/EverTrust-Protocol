'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';

export const MainnetLedger: React.FC = () => {
  const { transactions } = useStarknetWallet();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-purple-500" />
          <span className="label-mono text-purple-600 dark:text-purple-400">Mainnet Settlement Ledger</span>
        </div>
        <h1 className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
          Verified On-Chain STRK20 Transactions
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-steel">
          Immutable Starknet Mainnet transaction records proving real execution through the live STRK20 Privacy Pool and EverTrust contracts.
        </p>
      </div>

      {/* Table */}
      <div className="hairline-card mt-8 overflow-hidden bg-white dark:bg-night">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-night text-[0.65rem] uppercase tracking-wider text-zinc-500 dark:text-graphite">
              <tr>
                <th className="py-4 px-5">Action Type</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Starknet Mainnet Hash</th>
                <th className="py-4 px-5">STRK20 Pool</th>
                <th className="py-4 px-5">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5 bg-white dark:bg-black">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    No Mainnet transactions recorded yet. Connect your wallet and deploy a vault or shield STRK to record verified transactions on-chain.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.hash} className="transition-colors hover:bg-purple-50/40 dark:hover:bg-white/[0.02]">
                    <td className="py-4 px-5">
                      <p className="font-sans font-semibold text-zinc-900 dark:text-white">{tx.type}</p>
                      <p className="text-[0.65rem] text-zinc-500 dark:text-graphite">{tx.timestamp}</p>
                    </td>
                    <td className="py-4 px-5 font-bold text-purple-600 dark:text-purple-400">{tx.amount}</td>
                    <td className="py-4 px-5 text-zinc-700 dark:text-steel break-all font-medium">
                      {tx.hash.slice(0, 18)}...{tx.hash.slice(-8)}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified Pool</span>
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <a
                        href={`https://starkscan.co/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-600 hover:text-purple-600 dark:text-steel dark:hover:text-purple-400 font-bold"
                      >
                        <span>Starkscan</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
