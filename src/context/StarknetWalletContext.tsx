'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STARKNET_CONFIG, TrustVault, Beneficiary } from '@/lib/strk20';
import { computeNoteCommitment, computeNullifier, generateSalt, deriveAuditorViewingKey, encryptPayloadForHeir, decryptPayloadWithHeirKey } from '@/lib/crypto';
import confetti from 'canvas-confetti';

export type WalletType = 'argentX' | 'braavos' | 'ready' | 'cartridge' | 'test';

interface StarknetWalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  walletType: WalletType | null;
  strkBalance: string;
  vaults: TrustVault[];
  activeVault: TrustVault | null;
  connectWallet: (type: WalletType) => Promise<boolean>;
  disconnectWallet: () => void;
  createVault: (
    name: string,
    amountStrk: string,
    cadenceSeconds: number,
    beneficiaries: { name: string; addressOrPubKey: string; percentage: number; message?: string }[]
  ) => Promise<{ success: boolean; vaultId?: string; error?: string }>;
  pingHeartbeat: (vaultId: string) => Promise<boolean>;
  claimInheritance: (
    vaultId: string,
    claimKey: string,
    beneficiaryIndex: number,
    recipientAddress: string
  ) => Promise<{ success: boolean; amount?: string; decryptedMessage?: string; error?: string }>;
  revokeVault: (vaultId: string) => Promise<boolean>;
  setActiveVaultId: (vaultId: string) => void;
  generateAuditorKey: (vaultId: string) => string;
  toggleGuardianAttestation: (vaultId: string, guardianId: string) => Promise<boolean>;
}

const StarknetWalletContext = createContext<StarknetWalletContextType | undefined>(undefined);

// Initial Demo/Mainnet Vault Seeds with encrypted Digital Will messages & Social Guardians
const DEFAULT_INITIAL_VAULTS: TrustVault[] = [
  {
    id: 'vault_genesis_01',
    address: '0x056a817104ad7544a55873584f3d8fb41a780e5466d152b3e1f12d578e75defb',
    ownerAddress: '0x02a1b92c45e812d578e75defb04ad7544a55873584f3d8fb41a780e5466d152b',
    name: 'Sovereign Family Trust',
    totalShieldedAmount: '25000.00',
    cadenceSeconds: 7776000, // 90 days
    lastHeartbeatTimestamp: Math.floor(Date.now() / 1000) - 3600 * 24 * 12, // 12 days ago
    createdAt: Math.floor(Date.now() / 1000) - 3600 * 24 * 60,
    gracePeriodSeconds: 604800,
    state: 'ACTIVE',
    viewingKey: 'vk_evertrust_056a8171_02a1b92c_k918z',
    assets: [
      { symbol: 'STRK', name: 'Starknet Token', amount: '25,000.00', tokenAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', usdValue: 8750 },
      { symbol: 'ETH', name: 'Ethereum (Starknet L2)', amount: '4.50', tokenAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', usdValue: 12150 },
      { symbol: 'USDC', name: 'USD Coin (Native)', amount: '10,000.00', tokenAddress: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', usdValue: 10000 },
    ],
    guardians: [
      {
        id: 'g1',
        name: 'Dr. Marcus Vance (Physician)',
        address: '0x07a119e42c26d83a11bf74ca966f63bbbd0509844098ff63f5adef2a4a96',
        role: 'Medical Physician',
        hasAttested: true,
        attestationTimestamp: Math.floor(Date.now() / 1000) - 3600 * 48,
      },
      {
        id: 'g2',
        name: 'Elena Rostova (Estate Counsel)',
        address: '0x018f6925422c85da8c9e0c1572adf4316a9821ffabc4b29db37d11c6a0c2844a',
        role: 'Legal Counsel',
        hasAttested: false,
      },
    ],
    beneficiaries: [
      {
        id: 'b1',
        name: 'Sarah (Primary Heir)',
        addressOrPubKey: '0x04ff4f083a4667930efe14963645f9bda00bb10d44e4c13a9ee808e66c076211',
        percentage: 60,
        salt: '0x8f192bc7a',
        commitment: '0x07f18a2bc41904',
        claimKey: 'claim_evertrust_sarah_901827419',
        claimed: false,
        encryptedMessage: encryptPayloadForHeir(
          { willMessage: 'Sarah, I leave you 60% of our family STRK wealth. Use this wisely for your medical studies. The master seed phrase for the cold storage vault is deposited in Zurich safe deposit box #419 under your legal name.' },
          '0x04ff4f083a4667930efe14963645f9bda00bb10d44e4c13a9ee808e66c076211'
        ),
      },
      {
        id: 'b2',
        name: 'Alex (Secondary Heir)',
        addressOrPubKey: '0x03ce58babb9bc3651131657c273aae00cca554ffdccb13dba8b2d06ce60d61d5',
        percentage: 40,
        salt: '0x3a921d7ef',
        commitment: '0x04ca91841a0293',
        claimKey: 'claim_evertrust_alex_441029381',
        claimed: false,
        encryptedMessage: encryptPayloadForHeir(
          { willMessage: 'Alex, I am proud of your entrepreneurial spirit. Here is your 40% trust allocation. Always remember to stay self-sovereign, maintain privacy, and support the family.' },
          '0x03ce58babb9bc3651131657c273aae00cca554ffdccb13dba8b2d06ce60d61d5'
        ),
      },
    ],
  },
];

export const StarknetWalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [strkBalance, setStrkBalance] = useState<string>('50,000.00');
  const [vaults, setVaults] = useState<TrustVault[]>(DEFAULT_INITIAL_VAULTS);
  const [activeVaultId, setActiveVaultIdState] = useState<string>(DEFAULT_INITIAL_VAULTS[0].id);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedVaults = localStorage.getItem('evertrust_vaults');
      if (savedVaults) {
        setVaults(JSON.parse(savedVaults));
      }
      const savedWallet = localStorage.getItem('evertrust_wallet');
      if (savedWallet) {
        const parsed = JSON.parse(savedWallet);
        setIsConnected(true);
        setAddress(parsed.address);
        setWalletType(parsed.walletType);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Save vaults to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('evertrust_vaults', JSON.stringify(vaults));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [vaults]);

  // Periodic heartbeat state refresher
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setVaults(prevVaults =>
        prevVaults.map(vault => {
          if (vault.state === 'REVOKED' || vault.state === 'SETTLED') return vault;
          const expiryTime = vault.lastHeartbeatTimestamp + vault.cadenceSeconds;
          const graceExpiry = expiryTime + vault.gracePeriodSeconds;

          if (now <= expiryTime) {
            return { ...vault, state: 'ACTIVE' };
          } else if (now <= graceExpiry) {
            return { ...vault, state: 'GRACE_PERIOD' };
          } else {
            return { ...vault, state: 'UNLOCKED_FOR_CLAIM' };
          }
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const connectWallet = async (type: WalletType): Promise<boolean> => {
    setIsConnecting(true);
    try {
      let userAddress = '';

      if (typeof window !== 'undefined' && (window as any).starknet && type !== 'test') {
        const starknet = (window as any).starknet;
        try {
          await starknet.enable();
          userAddress = starknet.selectedAddress || '0x02a1b92c45e812d578e75defb04ad7544a55873584f3d8fb41a780e5466d152b';
        } catch (err) {
          userAddress = '0x02a1b92c45e812d578e75defb04ad7544a55873584f3d8fb41a780e5466d152b';
        }
      } else {
        const addresses: Record<WalletType, string> = {
          argentX: '0x02a1b92c45e812d578e75defb04ad7544a55873584f3d8fb41a780e5466d152b',
          braavos: '0x04ff4f083a4667930efe14963645f9bda00bb10d44e4c13a9ee808e66c076211',
          ready: '0x03ce58babb9bc3651131657c273aae00cca554ffdccb13dba8b2d06ce60d61d5',
          cartridge: '0x07a119e42c26d83a11bf74ca966f63bbbd0509844098ff63f5adef2a4a96',
          test: '0x018f6925422c85da8c9e0c1572adf4316a9821ffabc4b29db37d11c6a0c2844a',
        };
        userAddress = addresses[type] || addresses.argentX;
      }

      setAddress(userAddress);
      setWalletType(type);
      setIsConnected(true);
      localStorage.setItem('evertrust_wallet', JSON.stringify({ address: userAddress, walletType: type }));
      return true;
    } catch (err) {
      console.error('Wallet connection failed:', err);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setWalletType(null);
    localStorage.removeItem('evertrust_wallet');
  };

  const createVault = async (
    name: string,
    amountStrk: string,
    cadenceSeconds: number,
    beneficiariesInput: { name: string; addressOrPubKey: string; percentage: number; message?: string }[]
  ): Promise<{ success: boolean; vaultId?: string; error?: string }> => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const vaultId = `vault_${Date.now().toString(36)}`;
      const randomAddress = '0x' + generateSalt().replace('0x', '').padStart(64, '0');

      const processedBeneficiaries: Beneficiary[] = beneficiariesInput.map((b, idx) => {
        const salt = generateSalt();
        const commitment = computeNoteCommitment(b.addressOrPubKey, Math.round(b.percentage * 100), salt);
        const claimKey = `claim_evertrust_${b.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${generateSalt().slice(2, 10)}`;
        
        // Encrypt optional digital will message for this heir
        const encryptedMessage = b.message 
          ? encryptPayloadForHeir({ willMessage: b.message }, b.addressOrPubKey)
          : undefined;

        return {
          id: `b_${idx}_${Date.now()}`,
          name: b.name,
          addressOrPubKey: b.addressOrPubKey,
          percentage: b.percentage,
          salt,
          commitment,
          claimKey,
          claimed: false,
          encryptedMessage,
        };
      });

      const newVault: TrustVault = {
        id: vaultId,
        address: randomAddress,
        ownerAddress: address || '0x02a1b92c45e812d578e75defb04ad7544a55873584f3d8fb41a780e5466d152b',
        name,
        totalShieldedAmount: parseFloat(amountStrk).toFixed(2),
        cadenceSeconds,
        lastHeartbeatTimestamp: now,
        createdAt: now,
        gracePeriodSeconds: STARKNET_CONFIG.gracePeriodSeconds,
        state: 'ACTIVE',
        viewingKey: deriveAuditorViewingKey(randomAddress, address || '0x02a1b92c45e8'),
        beneficiaries: processedBeneficiaries,
      };

      setVaults(prev => [newVault, ...prev]);
      setActiveVaultIdState(vaultId);

      // Trigger purple confetti celebration
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333EA', '#A855F7', '#C084FC', '#FFFFFF'],
      });

      return { success: true, vaultId };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to deploy trust vault' };
    }
  };

  const pingHeartbeat = async (vaultId: string): Promise<boolean> => {
    try {
      const now = Math.floor(Date.now() / 1000);
      setVaults(prev =>
        prev.map(v => {
          if (v.id === vaultId) {
            return {
              ...v,
              lastHeartbeatTimestamp: now,
              state: 'ACTIVE',
            };
          }
          return v;
        })
      );

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#A855F7', '#10B981', '#FFFFFF'],
      });

      return true;
    } catch (err) {
      console.error('Failed to ping heartbeat:', err);
      return false;
    }
  };

  const claimInheritance = async (
    vaultId: string,
    claimKey: string,
    beneficiaryIndex: number,
    recipientAddress: string
  ): Promise<{ success: boolean; amount?: string; decryptedMessage?: string; error?: string }> => {
    try {
      const vault = vaults.find(v => v.id === vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      const targetBeneficiary = vault.beneficiaries[beneficiaryIndex] || vault.beneficiaries.find(b => b.claimKey === claimKey);
      if (!targetBeneficiary) {
        return { success: false, error: 'Invalid beneficiary or claim key' };
      }

      if (targetBeneficiary.claimed) {
        return { success: false, error: 'Inheritance note already claimed' };
      }

      const shareAmount = ((parseFloat(vault.totalShieldedAmount) * targetBeneficiary.percentage) / 100).toFixed(2);

      // Decrypt digital will note payload if present
      let decryptedMsg = '';
      if (targetBeneficiary.encryptedMessage) {
        const payload = decryptPayloadWithHeirKey(targetBeneficiary.encryptedMessage, claimKey);
        if (payload && payload.willMessage) {
          decryptedMsg = payload.willMessage;
        }
      }

      setVaults(prev =>
        prev.map(v => {
          if (v.id === vaultId) {
            const updatedBeneficiaries = v.beneficiaries.map(b =>
              b.id === targetBeneficiary.id ? { ...b, claimed: true, decryptedMessage: decryptedMsg } : b
            );
            const allClaimed = updatedBeneficiaries.every(b => b.claimed);
            return {
              ...v,
              beneficiaries: updatedBeneficiaries,
              state: allClaimed ? 'SETTLED' : v.state,
            };
          }
          return v;
        })
      );

      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#A855F7', '#C084FC', '#10B981', '#FFFFFF'],
      });

      return { success: true, amount: shareAmount, decryptedMessage: decryptedMsg };
    } catch (err: any) {
      return { success: false, error: err.message || 'Claim execution failed' };
    }
  };

  const revokeVault = async (vaultId: string): Promise<boolean> => {
    try {
      setVaults(prev =>
        prev.map(v => (v.id === vaultId ? { ...v, state: 'REVOKED' } : v))
      );
      return true;
    } catch (err) {
      return false;
    }
  };

  const generateAuditorKey = (vaultId: string): string => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return '';
    return vault.viewingKey || deriveAuditorViewingKey(vault.address, vault.ownerAddress);
  };

  const toggleGuardianAttestation = async (vaultId: string, guardianId: string): Promise<boolean> => {
    try {
      const now = Math.floor(Date.now() / 1000);
      setVaults(prev =>
        prev.map(v => {
          if (v.id === vaultId && v.guardians) {
            const updatedGuardians = v.guardians.map(g =>
              g.id === guardianId
                ? { ...g, hasAttested: !g.hasAttested, attestationTimestamp: !g.hasAttested ? now : undefined }
                : g
            );
            return { ...v, guardians: updatedGuardians };
          }
          return v;
        })
      );
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#9333EA', '#A855F7', '#10B981'],
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const activeVault = vaults.find(v => v.id === activeVaultId) || vaults[0] || null;

  return (
    <StarknetWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        walletType,
        strkBalance,
        vaults,
        activeVault,
        connectWallet,
        disconnectWallet,
        createVault,
        pingHeartbeat,
        claimInheritance,
        revokeVault,
        setActiveVaultId: setActiveVaultIdState,
        generateAuditorKey,
        toggleGuardianAttestation,
      }}
    >
      {children}
    </StarknetWalletContext.Provider>
  );
};

export const useStarknetWallet = () => {
  const context = useContext(StarknetWalletContext);
  if (!context) {
    throw new Error('useStarknetWallet must be used within a StarknetWalletProvider');
  }
  return context;
};
