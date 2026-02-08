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
    contractId: "CDYRJVQLCX5TGFATTDJV63NNM4N2OADZ3KTRRRQZG6TJY6ZOT4MFW37X",
  }
} as const


export interface Loan {
  accrued_interest: i128;
  borrowed_at: u64;
  borrower: string;
  collateral_value: i128;
  due_date: u64;
  id: u64;
  interest_rate: i128;
  last_interest_update: u64;
  principal: i128;
  receivable_ids: Array<u64>;
  status: LoanStatus;
}

export const Errors = {
  1: {message:"NotAuthorized"},
  2: {message:"AlreadyInitialized"},
  3: {message:"LoanNotFound"},
  4: {message:"InvalidStatus"},
  5: {message:"LTVExceeded"},
  6: {message:"InsufficientCollateral"},
  7: {message:"NotLiquidatable"},
  8: {message:"ZeroAmount"},
  9: {message:"ContractPaused"},
  10: {message:"InvalidDuration"},
  11: {message:"RecvNotOwned"},
  12: {message:"RecvNotActive"},
  13: {message:"Overflow"},
  14: {message:"NotBorrower"}
}

export type DataKey = {tag: "Admin", values: void} | {tag: "RecvContract", values: void} | {tag: "VaultContract", values: void} | {tag: "Config", values: void} | {tag: "NextLoanId", values: void} | {tag: "Loan", values: readonly [u64]} | {tag: "BorrowerLoans", values: readonly [string]} | {tag: "TotalLoans", values: void} | {tag: "TotalBorrowed", values: void} | {tag: "Paused", values: void};

export type LoanStatus = {tag: "Active", values: void} | {tag: "Repaid", values: void} | {tag: "Liquidated", values: void};


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


export interface BorrowConfig {
  base_interest_rate: i128;
  liquidation_penalty: i128;
  liquidation_threshold: i128;
  max_loan_duration: u64;
  max_ltv: i128;
  risk_discount_factor: i128;
}

export type ReceivableStatus = {tag: "Active", values: void} | {tag: "Collateralized", values: void} | {tag: "Matured", values: void} | {tag: "Settled", values: void} | {tag: "Defaulted", values: void};

export interface Client {
  /**
   * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a borrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  borrow: ({borrower, receivable_ids, borrow_amount, duration}: {borrower: string, receivable_ids: Array<u64>, borrow_amount: i128, duration: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a get_ltv transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_ltv: ({loan_id}: {loan_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unpause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_loan transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_loan: ({loan_id}: {loan_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Loan>>>

  /**
   * Construct and simulate a liquidate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  liquidate: ({liquidator, loan_id}: {liquidator: string, loan_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_config: (options?: MethodOptions) => Promise<AssembledTransaction<BorrowConfig>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, recv_contract, vault_contract, config}: {admin: string, recv_contract: string, vault_contract: string, config: BorrowConfig}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a repay_loan transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  repay_loan: ({borrower, loan_id, amount}: {borrower: string, loan_id: u64, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a set_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_config: ({config}: {config: BorrowConfig}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a total_loans transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  total_loans: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a accrue_interest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  accrue_interest: ({loan_id}: {loan_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a is_liquidatable transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_liquidatable: ({loan_id}: {loan_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a get_borrower_loans transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_borrower_loans: ({borrower}: {borrower: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<u64>>>

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
        "AAAAAAAAAAAAAAAGYm9ycm93AAAAAAAEAAAAAAAAAAhib3Jyb3dlcgAAABMAAAAAAAAADnJlY2VpdmFibGVfaWRzAAAAAAPqAAAABgAAAAAAAAANYm9ycm93X2Ftb3VudAAAAAAAAAsAAAAAAAAACGR1cmF0aW9uAAAABgAAAAEAAAPpAAAABgAAAAM=",
        "AAAAAQAAAAAAAAAAAAAABExvYW4AAAALAAAAAAAAABBhY2NydWVkX2ludGVyZXN0AAAACwAAAAAAAAALYm9ycm93ZWRfYXQAAAAABgAAAAAAAAAIYm9ycm93ZXIAAAATAAAAAAAAABBjb2xsYXRlcmFsX3ZhbHVlAAAACwAAAAAAAAAIZHVlX2RhdGUAAAAGAAAAAAAAAAJpZAAAAAAABgAAAAAAAAANaW50ZXJlc3RfcmF0ZQAAAAAAAAsAAAAAAAAAFGxhc3RfaW50ZXJlc3RfdXBkYXRlAAAABgAAAAAAAAAJcHJpbmNpcGFsAAAAAAAACwAAAAAAAAAOcmVjZWl2YWJsZV9pZHMAAAAAA+oAAAAGAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAKTG9hblN0YXR1cwAA",
        "AAAAAAAAAAAAAAAHZ2V0X2x0dgAAAAABAAAAAAAAAAdsb2FuX2lkAAAAAAYAAAABAAAD6QAAAAsAAAAD",
        "AAAAAAAAAAAAAAAHdW5wYXVzZQAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAADgAAAAAAAAANTm90QXV0aG9yaXplZAAAAAAAAAEAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAMTG9hbk5vdEZvdW5kAAAAAwAAAAAAAAANSW52YWxpZFN0YXR1cwAAAAAAAAQAAAAAAAAAC0xUVkV4Y2VlZGVkAAAAAAUAAAAAAAAAFkluc3VmZmljaWVudENvbGxhdGVyYWwAAAAAAAYAAAAAAAAAD05vdExpcXVpZGF0YWJsZQAAAAAHAAAAAAAAAApaZXJvQW1vdW50AAAAAAAIAAAAAAAAAA5Db250cmFjdFBhdXNlZAAAAAAACQAAAAAAAAAPSW52YWxpZER1cmF0aW9uAAAAAAoAAAAAAAAADFJlY3ZOb3RPd25lZAAAAAsAAAAAAAAADVJlY3ZOb3RBY3RpdmUAAAAAAAAMAAAAAAAAAAhPdmVyZmxvdwAAAA0AAAAAAAAAC05vdEJvcnJvd2VyAAAAAA4=",
        "AAAAAAAAAAAAAAAIZ2V0X2xvYW4AAAABAAAAAAAAAAdsb2FuX2lkAAAAAAYAAAABAAAD6QAAB9AAAAAETG9hbgAAAAM=",
        "AAAAAAAAAAAAAAAJbGlxdWlkYXRlAAAAAAAAAgAAAAAAAAAKbGlxdWlkYXRvcgAAAAAAEwAAAAAAAAAHbG9hbl9pZAAAAAAGAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAMUmVjdkNvbnRyYWN0AAAAAAAAAAAAAAANVmF1bHRDb250cmFjdAAAAAAAAAAAAAAAAAAABkNvbmZpZwAAAAAAAAAAAAAAAAAKTmV4dExvYW5JZAAAAAAAAQAAAAAAAAAETG9hbgAAAAEAAAAGAAAAAQAAAAAAAAANQm9ycm93ZXJMb2FucwAAAAAAAAEAAAATAAAAAAAAAAAAAAAKVG90YWxMb2FucwAAAAAAAAAAAAAAAAANVG90YWxCb3Jyb3dlZAAAAAAAAAAAAAAAAAAABlBhdXNlZAAA",
        "AAAAAAAAAAAAAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAfQAAAADEJvcnJvd0NvbmZpZw==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA1yZWN2X2NvbnRyYWN0AAAAAAAAEwAAAAAAAAAOdmF1bHRfY29udHJhY3QAAAAAABMAAAAAAAAABmNvbmZpZwAAAAAH0AAAAAxCb3Jyb3dDb25maWcAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAAKcmVwYXlfbG9hbgAAAAAAAwAAAAAAAAAIYm9ycm93ZXIAAAATAAAAAAAAAAdsb2FuX2lkAAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAAAAAAAAKc2V0X2NvbmZpZwAAAAAAAQAAAAAAAAAGY29uZmlnAAAAAAfQAAAADEJvcnJvd0NvbmZpZwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAALdG90YWxfbG9hbnMAAAAAAAAAAAEAAAAG",
        "AAAAAgAAAAAAAAAAAAAACkxvYW5TdGF0dXMAAAAAAAMAAAAAAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAABlJlcGFpZAAAAAAAAAAAAAAAAAAKTGlxdWlkYXRlZAAA",
        "AAAAAQAAAAAAAAAAAAAAClJlY2VpdmFibGUAAAAAAAwAAAAAAAAACGN1cnJlbmN5AAAAEwAAAAAAAAALZGVidG9yX2hhc2gAAAAD7gAAACAAAAAAAAAACmZhY2VfdmFsdWUAAAAAAAsAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAA1pc3N1YW5jZV9kYXRlAAAAAAAABgAAAAAAAAANbWF0dXJpdHlfZGF0ZQAAAAAAAAYAAAAAAAAADG1ldGFkYXRhX3VyaQAAABAAAAAAAAAAEW9yaWdpbmFsX2NyZWRpdG9yAAAAAAAAEwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApyaXNrX3Njb3JlAAAAAAAEAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAQUmVjZWl2YWJsZVN0YXR1cwAAAAAAAAANemtfcHJvb2ZfaGFzaAAAAAAAA+4AAAAg",
        "AAAAAQAAAAAAAAAAAAAADEJvcnJvd0NvbmZpZwAAAAYAAAAAAAAAEmJhc2VfaW50ZXJlc3RfcmF0ZQAAAAAACwAAAAAAAAATbGlxdWlkYXRpb25fcGVuYWx0eQAAAAALAAAAAAAAABVsaXF1aWRhdGlvbl90aHJlc2hvbGQAAAAAAAALAAAAAAAAABFtYXhfbG9hbl9kdXJhdGlvbgAAAAAAAAYAAAAAAAAAB21heF9sdHYAAAAACwAAAAAAAAAUcmlza19kaXNjb3VudF9mYWN0b3IAAAAL",
        "AAAAAAAAAAAAAAAPYWNjcnVlX2ludGVyZXN0AAAAAAEAAAAAAAAAB2xvYW5faWQAAAAABgAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAAAAAAAAPaXNfbGlxdWlkYXRhYmxlAAAAAAEAAAAAAAAAB2xvYW5faWQAAAAABgAAAAEAAAPpAAAAAQAAAAM=",
        "AAAAAAAAAAAAAAASZ2V0X2JvcnJvd2VyX2xvYW5zAAAAAAABAAAAAAAAAAhib3Jyb3dlcgAAABMAAAABAAAD6gAAAAY=",
        "AAAAAgAAAAAAAAAAAAAAEFJlY2VpdmFibGVTdGF0dXMAAAAFAAAAAAAAAAAAAAAGQWN0aXZlAAAAAAAAAAAAAAAAAA5Db2xsYXRlcmFsaXplZAAAAAAAAAAAAAAAAAAHTWF0dXJlZAAAAAAAAAAAAAAAAAdTZXR0bGVkAAAAAAAAAAAAAAAACURlZmF1bHRlZAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    pause: this.txFromJSON<Result<void>>,
        borrow: this.txFromJSON<Result<u64>>,
        get_ltv: this.txFromJSON<Result<i128>>,
        unpause: this.txFromJSON<Result<void>>,
        get_loan: this.txFromJSON<Result<Loan>>,
        liquidate: this.txFromJSON<Result<void>>,
        get_config: this.txFromJSON<BorrowConfig>,
        initialize: this.txFromJSON<Result<void>>,
        repay_loan: this.txFromJSON<Result<i128>>,
        set_config: this.txFromJSON<Result<void>>,
        total_loans: this.txFromJSON<u64>,
        accrue_interest: this.txFromJSON<Result<i128>>,
        is_liquidatable: this.txFromJSON<Result<boolean>>,
        get_borrower_loans: this.txFromJSON<Array<u64>>
  }
}