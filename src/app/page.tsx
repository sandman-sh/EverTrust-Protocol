'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroLanding } from '@/components/HeroLanding';
import { VaultDashboard } from '@/components/VaultDashboard';
import { CreateVaultModal } from '@/components/CreateVaultModal';
import { BeneficiaryManager } from '@/components/BeneficiaryManager';
import { ClaimPortal } from '@/components/ClaimPortal';
import { SelectiveDisclosure } from '@/components/SelectiveDisclosure';
import { MainnetLedger } from '@/components/MainnetLedger';
import { ShamirShardCombiner } from '@/components/ShamirShardCombiner';
import { WalletGate } from '@/components/WalletGate';
import { useStarknetWallet } from '@/context/StarknetWalletContext';

export type AppTab = 'landing' | 'dashboard' | 'create' | 'beneficiaries' | 'claim' | 'audit' | 'ledger' | 'shards';

// Tabs that require wallet connection
const GATED_TABS: AppTab[] = ['dashboard', 'beneficiaries', 'claim', 'audit', 'ledger', 'shards'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const { isConnected } = useStarknetWallet();

  // Gated navigation: if wallet is not connected, block access to app tabs
  const navigateTo = (tab: AppTab) => {
    if (GATED_TABS.includes(tab) && !isConnected) {
      setShowWalletPrompt(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleLaunchApp = () => {
    navigateTo('dashboard');
  };

  const handleOpenClaim = () => {
    navigateTo('claim');
  };

  const handleOpenCreateModal = () => {
    if (!isConnected) {
      setShowWalletPrompt(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-black dark:text-white selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={navigateTo}
        openCreateModal={handleOpenCreateModal}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <HeroLanding
            onLaunchApp={handleLaunchApp}
            onOpenClaim={handleOpenClaim}
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="pt-20">
            <VaultDashboard
              onOpenCreate={handleOpenCreateModal}
              onOpenClaim={handleOpenClaim}
              onOpenBeneficiaries={() => navigateTo('beneficiaries')}
              onOpenAudit={() => navigateTo('audit')}
            />
          </div>
        )}

        {activeTab === 'beneficiaries' && (
          <div className="pt-20">
            <BeneficiaryManager />
          </div>
        )}

        {activeTab === 'claim' && (
          <div className="pt-20">
            <ClaimPortal />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="pt-20">
            <SelectiveDisclosure />
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="pt-20">
            <MainnetLedger />
          </div>
        )}

        {activeTab === 'shards' && (
          <div className="pt-20">
            <ShamirShardCombiner onNavigateToClaim={claimKey => navigateTo('claim')} />
          </div>
        )}
      </main>

      {/* Create Vault Modal */}
      <CreateVaultModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setActiveTab('dashboard');
        }}
      />

      {/* Wallet Connection Gate Modal */}
      <WalletGate
        isOpen={showWalletPrompt}
        onClose={() => setShowWalletPrompt(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
