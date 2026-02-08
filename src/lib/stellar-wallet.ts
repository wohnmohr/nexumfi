/**
 * Stellar wallet integration using @stellar/wallet-sdk
 * Based on the Svelte example: KeyManager, LocalStorageKeyStore, ScryptEncrypter
 */

import {
  KeyManager,
  KeyManagerPlugins,
  KeyType,
} from "@stellar/wallet-sdk";
import { Keypair } from "@stellar/stellar-sdk";

const WALLET_STORE_KEY = "hypermonks:stellarWallet";

export interface StellarWalletStore {
  keyId: string;
  publicKey: string;
}

/** Configure KeyManager with LocalStorageKeyStore and ScryptEncrypter */
function setupKeyManager(): KeyManager {
  const localKeyStore = new KeyManagerPlugins.LocalStorageKeyStore();
  localKeyStore.configure({
    prefix: "hypermonks",
    storage: typeof window !== "undefined" ? localStorage : ({} as Storage),
  });

  const keyManager = new KeyManager({
    keyStore: localKeyStore,
  });

  keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);

  return keyManager;
}

/** Get stored wallet metadata from localStorage */
export function getStellarWallet(): StellarWalletStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WALLET_STORE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StellarWalletStore;
    return data.keyId && data.publicKey ? data : null;
  } catch {
    return null;
  }
}

/**
 * Register a new Stellar wallet by generating a keypair,
 * encrypting it with the pincode, and storing in KeyManager.
 */
export async function registerStellarWallet(pincode: string): Promise<StellarWalletStore> {
  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();

  const keyManager = setupKeyManager();

  const keyMetadata = await keyManager.storeKey({
    key: {
      type: KeyType.plaintextKey,
      publicKey,
      privateKey: secretKey,
    },
    password: pincode,
    encrypterName: KeyManagerPlugins.ScryptEncrypter.name,
  });

  const store: StellarWalletStore = {
    keyId: keyMetadata.id,
    publicKey,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(WALLET_STORE_KEY, JSON.stringify(store));
  }

  return store;
}

/**
 * Verify pincode is correct for the stored wallet.
 * Throws if invalid.
 */
export async function verifyStellarWalletPincode(pincode: string): Promise<boolean> {
  const wallet = getStellarWallet();
  if (!wallet) return false;

  try {
    const keyManager = setupKeyManager();
    await keyManager.loadKey(wallet.keyId, pincode);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load the wallet's keypair by decrypting with the pincode.
 * Returns both publicKey and privateKey (secret) for transaction signing.
 */
export async function loadStellarWalletKey(
  pincode: string
): Promise<{ publicKey: string; privateKey: string } | null> {
  const wallet = getStellarWallet();
  if (!wallet) return null;

  try {
    const keyManager = setupKeyManager();
    const key = await keyManager.loadKey(wallet.keyId, pincode);
    return { publicKey: key.publicKey, privateKey: key.privateKey };
  } catch {
    return null;
  }
}

/** Fund a testnet account via Stellar Friendbot */
export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Remove wallet data from localStorage */
export function clearStellarWallet(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WALLET_STORE_KEY);
}
