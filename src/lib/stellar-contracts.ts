import { Keypair } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import {
  Client as ReceivableClient,
  networks as receivableNetworks,
} from "@/app/contracts/receivable_token/src";
import {
  Client as BorrowClient,
  networks as borrowNetworks,
} from "@/app/contracts/borrow_contract/src";
import {
  Client as VaultClient,
  networks as vaultNetworks,
} from "@/app/contracts/lending_vault/src";

const TESTNET_RPC = "https://soroban-testnet.stellar.org";

export const RECEIVABLE_NETWORK_PASSPHRASE =
  receivableNetworks.testnet.networkPassphrase;

export function createReceivableClient(secretKey: string): ReceivableClient {
  const keypair = Keypair.fromSecret(secretKey);
  const { signTransaction, signAuthEntry } = basicNodeSigner(
    keypair,
    receivableNetworks.testnet.networkPassphrase
  );

  return new ReceivableClient({
    contractId: receivableNetworks.testnet.contractId,
    networkPassphrase: receivableNetworks.testnet.networkPassphrase,
    rpcUrl: TESTNET_RPC,
    publicKey: keypair.publicKey(),
    signTransaction,
    signAuthEntry,
  });
}

export function createBorrowClient(secretKey: string): BorrowClient {
  const keypair = Keypair.fromSecret(secretKey);
  const { signTransaction, signAuthEntry } = basicNodeSigner(
    keypair,
    borrowNetworks.testnet.networkPassphrase
  );

  return new BorrowClient({
    contractId: borrowNetworks.testnet.contractId,
    networkPassphrase: borrowNetworks.testnet.networkPassphrase,
    rpcUrl: TESTNET_RPC,
    publicKey: keypair.publicKey(),
    signTransaction,
    signAuthEntry,
  });
}

export function createVaultClient(secretKey: string): VaultClient {
  const keypair = Keypair.fromSecret(secretKey);
  const { signTransaction, signAuthEntry } = basicNodeSigner(
    keypair,
    vaultNetworks.testnet.networkPassphrase
  );

  return new VaultClient({
    contractId: vaultNetworks.testnet.contractId,
    networkPassphrase: vaultNetworks.testnet.networkPassphrase,
    rpcUrl: TESTNET_RPC,
    publicKey: keypair.publicKey(),
    signTransaction,
    signAuthEntry,
  });
}
