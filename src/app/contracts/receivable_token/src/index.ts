import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CC2DRZCX6GB3SKVD6QOKJ4INTCUMOITZAJ4HLVO7JRIFRZDL6LJN3KWK",
  }
} as const

export const Errors = {
  1: {message:"NotAuthorized"},
  2: {message:"NotVerifier"},
  3: {message:"ReceivableNotFound"},
  4: {message:"InvalidStatus"},
  5: {message:"InvalidMaturityDate"},
  6: {message:"InvalidFaceValue"},
  7: {message:"AlreadyInitialized"},
  8: {message:"ContractPaused"},
  9: {message:"NotOwner"},
  10: {message:"NotBorrowContract"},
  11: {message:"TransferNotAllowed"}
}

export type DataKey = {tag: "Admin", values: void} | {tag: "Verifier", values: void} | {tag: "BorrowContract", values: void} | {tag: "NextId", values: void} | {tag: "Receivable", values: readonly [u64]} | {tag: "OwnerReceivables", values: readonly [string]} | {tag: "TotalMinted", values: void} | {tag: "TotalActive", values: void} | {tag: "Paused", values: void};


export interface Receivable {
  currency: string;
  debtor_hash: Buffer;
  face_value: i128;
  id: u64;
  issuance_date: u64;
  maturity_date: u64;
  metadata_uri: string;
  original_creditor: string;
  owner: string;
  risk_score: u32;
  status: ReceivableStatus;
  zk_proof_hash: Buffer;
}

export type ReceivableStatus = {tag: "Active", values: void} | {tag: "Collateralized", values: void} | {tag: "Matured", values: void} | {tag: "Settled", values: void} | {tag: "Defaulted", values: void};

export interface Client {
  /**
   * Construct and simulate a lock transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Lock receivable as collateral — only borrow contract
   */
  lock: ({receivable_id}: {receivable_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mint a tokenized receivable — only callable by the ZK verifier authority
   */
  mint: ({creditor, debtor_hash, face_value, currency, maturity_date, zk_proof_hash, risk_score, metadata_uri}: {creditor: string, debtor_hash: Buffer, face_value: i128, currency: string, maturity_date: u64, zk_proof_hash: Buffer, risk_score: u32, metadata_uri: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a settle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  settle: ({receivable_id}: {receivable_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a unlock transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Unlock receivable from collateral — only borrow contract
   */
  unlock: ({receivable_id}: {receivable_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unpause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_recv transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_recv: ({receivable_id}: {receivable_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Receivable>>>

  /**
   * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer receivable ownership (only Active ones)
   */
  transfer: ({receivable_id, from, to}: {receivable_id: u64, from: string, to: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_owner: ({owner}: {owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<u64>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, verifier}: {admin: string, verifier: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_borrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_borrow: ({borrow_contract}: {borrow_contract: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a mark_default transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  mark_default: ({receivable_id}: {receivable_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a total_active transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  total_active: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a total_minted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  total_minted: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "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" ]),
      options
    )
  }
  public readonly fromJSON = {
    lock: this.txFromJSON<Result<void>>,
        mint: this.txFromJSON<Result<u64>>,
        pause: this.txFromJSON<Result<void>>,
        settle: this.txFromJSON<Result<void>>,
        unlock: this.txFromJSON<Result<void>>,
        unpause: this.txFromJSON<Result<void>>,
        get_recv: this.txFromJSON<Result<Receivable>>,
        transfer: this.txFromJSON<Result<void>>,
        get_owner: this.txFromJSON<Array<u64>>,
        initialize: this.txFromJSON<Result<void>>,
        set_borrow: this.txFromJSON<Result<void>>,
        mark_default: this.txFromJSON<Result<void>>,
        total_active: this.txFromJSON<u64>,
        total_minted: this.txFromJSON<u64>
  }
}