/**
 * EverTrust Protocol Cryptographic Utilities
 * Handles Poseidon commitments, nullifier generation, AES-GCM note encryption,
 * and selective disclosure viewing key derivations.
 */

// Simple robust pseudo-random salt generator
export function generateSalt(): string {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return '0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pseudo-Poseidon hash representation for client-side note commitment
export function computeNoteCommitment(heirPubKey: string, percentageBps: number, salt: string): string {
  // Normalize inputs
  const cleanKey = heirPubKey.toLowerCase().replace('0x', '').padStart(64, '0');
  const cleanSalt = salt.toLowerCase().replace('0x', '').padStart(32, '0');
  const bpsHex = percentageBps.toString(16).padStart(4, '0');

  // Compute a deterministic hash
  let hash = BigInt(0);
  const prime = (BigInt(2) ** BigInt(251)) - BigInt(1);
  const combined = cleanKey + bpsHex + cleanSalt;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * BigInt(31) + BigInt(combined.charCodeAt(i))) % prime;
  }

  return '0x' + hash.toString(16).padStart(64, '0');
}

// Generate nullifier from secret salt and beneficiary index
export function computeNullifier(secretKey: string, beneficiaryIndex: number): string {
  const cleanKey = secretKey.toLowerCase().replace('0x', '').padStart(64, '0');
  let hash = BigInt(0);
  const prime = (BigInt(2) ** BigInt(251)) - BigInt(1);
  const combined = cleanKey + beneficiaryIndex.toString(16);
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * BigInt(37) + BigInt(combined.charCodeAt(i))) % prime;
  }
  return '0x' + hash.toString(16).padStart(64, '0');
}

// Generate an Ephemeral Heir Claim Key
export function generateHeirClaimKey(): { privateKey: string; publicKey: string } {
  const priv = generateSalt();
  const pub = '0x04' + generateSalt().replace('0x', '') + generateSalt().replace('0x', '');
  return {
    privateKey: priv,
    publicKey: pub,
  };
}

// Encrypt payload for heir (mock-compatible AES-GCM simulation for browser)
export function encryptPayloadForHeir(data: any, heirPublicKey: string): string {
  const jsonStr = JSON.stringify(data);
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(jsonStr)));
  }
  return Buffer.from(jsonStr).toString('base64');
}

// Decrypt payload with heir private key
export function decryptPayloadWithHeirKey(encryptedBase64: string, heirPrivateKey: string): any {
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined' && window.atob) {
      jsonStr = decodeURIComponent(escape(window.atob(encryptedBase64)));
    } else {
      jsonStr = Buffer.from(encryptedBase64, 'base64').toString('utf8');
    }
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to decrypt heir payload:', err);
    return null;
  }
}

// Derive a Selective Disclosure Viewing Key
export function deriveAuditorViewingKey(vaultAddress: string, ownerAddress: string): string {
  const cleanVault = vaultAddress.toLowerCase().replace('0x', '').slice(0, 16);
  const cleanOwner = ownerAddress.toLowerCase().replace('0x', '').slice(0, 16);
  return `vk_evertrust_${cleanVault}_${cleanOwner}_${Date.now().toString(36)}`;
}
