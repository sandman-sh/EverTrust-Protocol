'use client';

import React, { useRef } from 'react';
import { Shield, Printer, X, Key, Lock, CheckCircle2, QrCode } from 'lucide-react';
import { TrustVault, Beneficiary } from '@/lib/strk20';

interface PrintableHeritageCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: TrustVault;
  beneficiary: Beneficiary;
}

export const PrintableHeritageCardModal: React.FC<PrintableHeritageCardModalProps> = ({
  isOpen,
  onClose,
  vault,
  beneficiary,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareAmount = (
    (parseFloat(vault.totalShieldedAmount) * beneficiary.percentage) /
    100
  ).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  // Generate deterministic visual QR matrix pattern using hash
  const generateQrMatrix = (seed: string) => {
    const size = 15;
    const matrix: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Corner alignment squares
        if (
          (r < 4 && c < 4) ||
          (r < 4 && c >= size - 4) ||
          (r >= size - 4 && c < 4)
        ) {
          row.push((r === 0 || r === 3 || c === 0 || c === 3) || (r >= size - 4 && (r === size - 1 || r === size - 4 || c === 0 || c === 3)) || (c >= size - 4 && (r === 0 || r === 3 || c === size - 1 || c === size - 4)));
        } else {
          const val = Math.abs((hash * (r * size + c + 1) * 31) % 100);
          row.push(val > 45);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  const qrMatrix = generateQrMatrix(beneficiary.claimKey || beneficiary.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md print:p-0 print:bg-white print:static">
      <div className="w-full max-w-2xl bg-white dark:bg-night print:bg-white p-6 sm:p-8 shadow-2xl text-zinc-900 dark:text-white print:text-black border border-purple-500/40 print:border-black">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-white">
              Printable Heritage Emergency Card
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-900 dark:text-graphite dark:hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Physical Certificate Body */}
        <div ref={cardRef} className="mt-4 border-2 border-dashed border-purple-500/50 print:border-black p-6 space-y-5 bg-white dark:bg-black/40 print:bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/10 print:border-black pb-4">
            <div>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 print:text-black font-bold">
                CONFIDENTIAL CRYPTO SUCCESSION CERTIFICATE
              </span>
              <h2 className="font-sans text-xl font-extrabold text-zinc-900 dark:text-white print:text-black mt-1">
                EverTrust Protocol
              </h2>
              <p className="font-mono text-[0.65rem] text-zinc-500 print:text-zinc-700">
                Starknet STRK20 Shielded Inheritance Rail
              </p>
            </div>
            <div className="text-right">
              <div className="border border-purple-500/40 print:border-black px-2.5 py-1 bg-purple-500/10 print:bg-transparent inline-block">
                <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-300 print:text-black">
                  {beneficiary.percentage}% ALLOCATION
                </span>
              </div>
              <p className="font-mono text-xs font-bold text-zinc-800 dark:text-white print:text-black mt-1">
                {shareAmount} STRK
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="border border-zinc-200 dark:border-white/10 print:border-black p-2.5">
              <span className="text-[0.65rem] text-zinc-500 print:text-zinc-700 block">Trust Vault Name:</span>
              <span className="font-bold text-zinc-900 dark:text-white print:text-black">{vault.name}</span>
            </div>
            <div className="border border-zinc-200 dark:border-white/10 print:border-black p-2.5">
              <span className="text-[0.65rem] text-zinc-500 print:text-zinc-700 block">Designated Heir:</span>
              <span className="font-bold text-zinc-900 dark:text-white print:text-black">{beneficiary.name}</span>
            </div>
          </div>

          {/* Secret Heir Claim Key Shard */}
          <div className="border border-purple-500/40 print:border-black bg-zinc-50 dark:bg-night print:bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.65rem] font-bold text-purple-600 dark:text-purple-400 print:text-black flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                <span>EPHEMERAL HEIR CLAIM SECRET (KEEP CONFIDENTIAL)</span>
              </span>
              <Lock className="h-3 w-3 text-zinc-400" />
            </div>
            <div className="border border-zinc-300 dark:border-white/15 print:border-black bg-white dark:bg-black p-2.5 font-mono text-xs font-bold text-zinc-900 dark:text-white print:text-black break-all select-all">
              {beneficiary.claimKey}
            </div>
          </div>

          {/* QR Code & Redemption Instructions */}
          <div className="flex items-center gap-5 border border-zinc-200 dark:border-white/10 print:border-black p-4">
            {/* Visual SVG QR Code Matrix */}
            <div className="flex-none p-1.5 border border-zinc-300 dark:border-white/20 print:border-black bg-white">
              <svg width="84" height="84" viewBox="0 0 15 15" className="fill-black">
                {qrMatrix.map((row, r) =>
                  row.map((active, c) =>
                    active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" /> : null
                  )
                )}
              </svg>
            </div>

            {/* Redemption Instructions */}
            <div className="font-mono text-[0.65rem] text-zinc-600 dark:text-steel print:text-zinc-800 space-y-1.5 leading-relaxed">
              <p className="font-bold text-zinc-900 dark:text-white print:text-black">
                Redemption Instructions for Heir / Estate Attorney:
              </p>
              <p>
                1. Navigate to the EverTrust Claim Portal at <strong>evertrust-protocol.vercel.app</strong>.
              </p>
              <p>
                2. Paste this secret claim shard and provide a fresh, unlinked Starknet wallet address.
              </p>
              <p>
                3. The smart contract will verify the dead man&#39;s switch expiration and unshield your funds with zero public identity link.
              </p>
            </div>
          </div>

          {/* Footer Warning */}
          <div className="text-center font-mono text-[0.6rem] text-zinc-400 print:text-zinc-600 border-t border-zinc-200 dark:border-white/10 print:border-black pt-2">
            Physical Document Notice: Store inside a fireproof safe, bank deposit box, or with legal counsel.
          </div>
        </div>
      </div>
    </div>
  );
};
