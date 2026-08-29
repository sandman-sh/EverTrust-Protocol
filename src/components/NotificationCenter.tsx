'use client';

import React, { useState } from 'react';
import { useStarknetWallet } from '@/context/StarknetWalletContext';
import { Bell, Heart, Shield, CheckCircle2, AlertTriangle, Clock, X, Check } from 'lucide-react';
import { AppTab } from '@/app/page';

interface NotificationCenterProps {
  onNavigate: (tab: AppTab) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { activeVault, pingHeartbeat } = useStarknetWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isPinging, setIsPinging] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Heartbeat Cadence Invariant',
      message: activeVault
        ? (() => {
            const now = Math.floor(Date.now() / 1000);
            const expiry = activeVault.lastHeartbeatTimestamp + activeVault.cadenceSeconds;
            const remainingDays = Math.max(0, Math.round((expiry - now) / 86400));
            return `Vault "${activeVault.name}" is ${activeVault.state}. Next heartbeat ping due in ${remainingDays} days.`;
          })()
        : 'No active vault detected. Connect wallet and create a trust vault.',
      type: 'cadence',
      time: '12m ago',
      actionLabel: 'Send Ping Now',
      onAction: async () => {
        if (activeVault) {
          setIsPinging(true);
          await pingHeartbeat(activeVault.id);
          setIsPinging(false);
        }
      },
    },
    {
      id: 'n2',
      title: 'Social Guardian Attestation',
      message: 'Dr. Marcus Vance (Physician) signed an on-chain incapacity attestation for Family Trust.',
      type: 'guardian',
      time: '2h ago',
      actionLabel: 'View Guardians',
      onAction: () => {
        onNavigate('guardians');
        setIsOpen(false);
      },
    },
    {
      id: 'n3',
      title: 'STRK20 Privacy Pool Solvency',
      message: 'Starknet Mainnet Shielded Pool state root verified cryptographically with zero leakage.',
      type: 'pool',
      time: '1d ago',
      actionLabel: 'Inspect Ledger',
      onAction: () => {
        onNavigate('ledger');
        setIsOpen(false);
      },
    },
  ];

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    setReadIds(notifications.map(n => n.id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'cadence':
        return <Heart className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
      case 'guardian':
        return <Shield className="h-3.5 w-3.5 text-emerald-500" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Notification Center"
        className="relative flex h-9 w-9 items-center justify-center border border-zinc-200 bg-zinc-100 text-zinc-700 transition-colors hover:border-purple-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-steel dark:hover:text-purple-400"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[0.6rem] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-none border border-zinc-200 bg-white dark:border-white/10 dark:bg-night shadow-2xl z-50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <h4 className="font-sans text-sm font-bold text-zinc-900 dark:text-white">
                Protocol Cadence Alerts
              </h4>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400 hover:underline font-bold"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
            {notifications.map(n => {
              const isRead = readIds.includes(n.id);

              return (
                <div
                  key={n.id}
                  className={`border p-3 space-y-2 transition-colors ${
                    isRead
                      ? 'border-zinc-200 bg-zinc-50/50 dark:border-white/5 dark:bg-black/30 opacity-70'
                      : 'border-purple-500/30 bg-purple-50/30 dark:border-purple-500/20 dark:bg-purple-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/10 flex-none">
                        {getIcon(n.type)}
                      </div>
                      <p className="font-sans text-xs font-bold text-zinc-900 dark:text-white">
                        {n.title}
                      </p>
                    </div>
                    <span className="font-mono text-[0.6rem] text-zinc-400 flex-none">
                      {n.time}
                    </span>
                  </div>

                  <p className="font-mono text-[0.7rem] text-zinc-600 dark:text-steel leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={n.onAction}
                      disabled={isPinging}
                      className="font-mono text-[0.65rem] text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <span>{isPinging ? 'Pinging on-chain...' : n.actionLabel} →</span>
                    </button>

                    {!isRead && (
                      <button
                        onClick={() => setReadIds(prev => [...prev, n.id])}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
