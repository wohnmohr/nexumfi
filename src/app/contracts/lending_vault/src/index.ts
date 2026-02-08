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
    contractId: "CASROYI6HGFXGAEABTMYIYDE3EUK7I7LLC6ZP5NZFB5ZAVY2EQJT5WTS",
  }
} as const

export const Errors = {
  1: {message:"NotAuthorized"},
  2: {message:"AlreadyInitialized"},
  3: {message:"InsufficientDeposit"},
  4: {message:"InsufficientShares"},
  5: {message:"InsufficientLiquidity"},
  6: {message:"MaxUtilizationExceeded"},
  7: {message:"ContractPaused"},
  8: {message:"ZeroAmount"},
  9: {message:"NotBorrowContract"},
  10: {message:"Overflow"}
}

export type DataKey = {tag: "Admin", values: void} | {tag: "BaseAsset", values: void} | {tag: "BorrowContract", values: void} | {tag: "VaultState", values: void} | {tag: "LPPosition", values: readonly [string]} | {tag: "MinDeposit", values: void} | {tag: "MaxUtilization", values: void} | {tag: "Paused", values: void};


export interface LPPosition {
  deposit_timestamp: u64;
  shares: i128;
}


export interface VaultState {
  protocol_reserves: i128;
  reserve_factor: i128;
  total_borrowed: i128;
  total_deposits: i128;
  total_interest_earned: i128;
  total_shares: i128;
}

export interface Client {
  /**
   * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a repay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Receive repayment — only borrow contract
   */
  repay: ({borrower, principal, interest}: {borrower: string, principal: i128, interest: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_lp transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_lp: ({depositor}: {depositor: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<LPPosition>>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deposit base asset, receive LP shares
   */
  deposit: ({depositor, amount}: {depositor: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unpause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a disburse transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Disburse a loan to borrower — only borrow contract
   */
  disburse: ({borrower, amount}: {borrower: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a liq_recv transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Receive liquidation proceeds — only borrow contract
   */
  liq_recv: ({recovered, shortfall}: {recovered: i128, shortfall: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw by burning shares
   */
  withdraw: ({depositor, shares_to_burn}: {depositor: string, shares_to_burn: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a available transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  available: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_state transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_state: (options?: MethodOptions) => Promise<AssembledTransaction<VaultState>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, base_asset, reserve_factor, max_utilization, min_deposit}: {admin: string, base_asset: string, reserve_factor: i128, max_utilization: i128, min_deposit: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_borrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_borrow: ({borrow_contract}: {borrow_contract: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a utilization transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  utilization: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a shares_value transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  shares_value: ({shares}: {shares: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a total_assets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  total_assets: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a withdraw_reserves transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw_reserves: ({recipient, amount}: {recipient: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

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
      new ContractSpec([ "AAAAAAAAAAAAAAAFcGF1c2UAAAAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAACpSZWNlaXZlIHJlcGF5bWVudCDigJQgb25seSBib3Jyb3cgY29udHJhY3QAAAAAAAVyZXBheQAAAAAAAAMAAAAAAAAACGJvcnJvd2VyAAAAEwAAAAAAAAAJcHJpbmNpcGFsAAAAAAAACwAAAAAAAAAIaW50ZXJlc3QAAAALAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAGZ2V0X2xwAAAAAAABAAAAAAAAAAlkZXBvc2l0b3IAAAAAAAATAAAAAQAAA+gAAAfQAAAACkxQUG9zaXRpb24AAA==",
        "AAAAAAAAACVEZXBvc2l0IGJhc2UgYXNzZXQsIHJlY2VpdmUgTFAgc2hhcmVzAAAAAAAAB2RlcG9zaXQAAAAAAgAAAAAAAAAJZGVwb3NpdG9yAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAALAAAAAw==",
        "AAAAAAAAAAAAAAAHdW5wYXVzZQAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACgAAAAAAAAANTm90QXV0aG9yaXplZAAAAAAAAAEAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAgAAAAAAAAATSW5zdWZmaWNpZW50RGVwb3NpdAAAAAADAAAAAAAAABJJbnN1ZmZpY2llbnRTaGFyZXMAAAAAAAQAAAAAAAAAFUluc3VmZmljaWVudExpcXVpZGl0eQAAAAAAAAUAAAAAAAAAFk1heFV0aWxpemF0aW9uRXhjZWVkZWQAAAAAAAYAAAAAAAAADkNvbnRyYWN0UGF1c2VkAAAAAAAHAAAAAAAAAApaZXJvQW1vdW50AAAAAAAIAAAAAAAAABFOb3RCb3Jyb3dDb250cmFjdAAAAAAAAAkAAAAAAAAACE92ZXJmbG93AAAACg==",
        "AAAAAAAAADREaXNidXJzZSBhIGxvYW4gdG8gYm9ycm93ZXIg4oCUIG9ubHkgYm9ycm93IGNvbnRyYWN0AAAACGRpc2J1cnNlAAAAAgAAAAAAAAAIYm9ycm93ZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAADVSZWNlaXZlIGxpcXVpZGF0aW9uIHByb2NlZWRzIOKAlCBvbmx5IGJvcnJvdyBjb250cmFjdAAAAAAAAAhsaXFfcmVjdgAAAAIAAAAAAAAACXJlY292ZXJlZAAAAAAAAAsAAAAAAAAACXNob3J0ZmFsbAAAAAAAAAsAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAABpXaXRoZHJhdyBieSBidXJuaW5nIHNoYXJlcwAAAAAACHdpdGhkcmF3AAAAAgAAAAAAAAAJZGVwb3NpdG9yAAAAAAAAEwAAAAAAAAAOc2hhcmVzX3RvX2J1cm4AAAAAAAsAAAABAAAD6QAAAAsAAAAD",
        "AAAAAAAAAAAAAAAJYXZhaWxhYmxlAAAAAAAAAAAAAAEAAAAL",
        "AAAAAAAAAAAAAAAJZ2V0X3N0YXRlAAAAAAAAAAAAAAEAAAfQAAAAClZhdWx0U3RhdGUAAA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAJQmFzZUFzc2V0AAAAAAAAAAAAAAAAAAAOQm9ycm93Q29udHJhY3QAAAAAAAAAAAAAAAAAClZhdWx0U3RhdGUAAAAAAAEAAAAAAAAACkxQUG9zaXRpb24AAAAAAAEAAAATAAAAAAAAAAAAAAAKTWluRGVwb3NpdAAAAAAAAAAAAAAAAAAOTWF4VXRpbGl6YXRpb24AAAAAAAAAAAAAAAAABlBhdXNlZAAA",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAApiYXNlX2Fzc2V0AAAAAAATAAAAAAAAAA5yZXNlcnZlX2ZhY3RvcgAAAAAACwAAAAAAAAAPbWF4X3V0aWxpemF0aW9uAAAAAAsAAAAAAAAAC21pbl9kZXBvc2l0AAAAAAsAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAAKc2V0X2JvcnJvdwAAAAAAAQAAAAAAAAAPYm9ycm93X2NvbnRyYWN0AAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAALdXRpbGl6YXRpb24AAAAAAAAAAAEAAAAL",
        "AAAAAAAAAAAAAAAMc2hhcmVzX3ZhbHVlAAAAAQAAAAAAAAAGc2hhcmVzAAAAAAALAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAMdG90YWxfYXNzZXRzAAAAAAAAAAEAAAAL",
        "AAAAAQAAAAAAAAAAAAAACkxQUG9zaXRpb24AAAAAAAIAAAAAAAAAEWRlcG9zaXRfdGltZXN0YW1wAAAAAAAABgAAAAAAAAAGc2hhcmVzAAAAAAAL",
        "AAAAAQAAAAAAAAAAAAAAClZhdWx0U3RhdGUAAAAAAAYAAAAAAAAAEXByb3RvY29sX3Jlc2VydmVzAAAAAAAACwAAAAAAAAAOcmVzZXJ2ZV9mYWN0b3IAAAAAAAsAAAAAAAAADnRvdGFsX2JvcnJvd2VkAAAAAAALAAAAAAAAAA50b3RhbF9kZXBvc2l0cwAAAAAACwAAAAAAAAAVdG90YWxfaW50ZXJlc3RfZWFybmVkAAAAAAAACwAAAAAAAAAMdG90YWxfc2hhcmVzAAAACw==",
        "AAAAAAAAAAAAAAARd2l0aGRyYXdfcmVzZXJ2ZXMAAAAAAAACAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAA+0AAAAAAAAAAw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    pause: this.txFromJSON<Result<void>>,
        repay: this.txFromJSON<Result<void>>,
        get_lp: this.txFromJSON<Option<LPPosition>>,
        deposit: this.txFromJSON<Result<i128>>,
        unpause: this.txFromJSON<Result<void>>,
        disburse: this.txFromJSON<Result<void>>,
        liq_recv: this.txFromJSON<Result<void>>,
        withdraw: this.txFromJSON<Result<i128>>,
        available: this.txFromJSON<i128>,
        get_state: this.txFromJSON<VaultState>,
        initialize: this.txFromJSON<Result<void>>,
        set_borrow: this.txFromJSON<Result<void>>,
        utilization: this.txFromJSON<i128>,
        shares_value: this.txFromJSON<i128>,
        total_assets: this.txFromJSON<i128>,
        withdraw_reserves: this.txFromJSON<Result<void>>
  }
}