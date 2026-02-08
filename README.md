# Project Title

Nexum Finance

---

## Project Description

This protocol is a decentralized credit marketplace that transforms real-world receivables into secure, on-chain collateralized assets.

Businesses can tokenize verified invoices and future cash flows to unlock instant working capital instead of waiting through long payment cycles. These tokenized receivables back structured lending pools that offer lenders fixed, predictable APY derived from borrower interest—delivering stable, real-world yield rather than speculative crypto returns.

Built on the Stellar Development Foundation’s Stellar ecosystem, the platform leverages fast finality, near-zero transaction costs, and native global payment rails. Integrated fiat on/off-ramps enable seamless movement of capital between traditional banking systems and digital assets, making the protocol accessible to both Web3-native users and institutional participants.

Beyond traditional invoices, the protocol supports a broader class of receivables including approved insurance claim settlements, verified merchant payouts, and marketplace earnings from platforms such as Amazon and Shopify.

Risk is managed through a hybrid underwriting framework that combines zero-knowledge (ZK) based verification for data integrity with Web2 credit assessment and cash flow analysis. This ensures that collateral quality is provable without exposing sensitive financial information.

Robust KYC/KYB onboarding, AML screening, and compliance frameworks are embedded by design, enabling verified borrowers and lenders to operate in a secure, transparent, and audit-friendly environment.

The result is a scalable, compliant infrastructure for working-capital financing and private credit—bringing real-world assets and sustainable yield fully on-chain.

---

## Contract Address

### Receivable Token (Shared)

**Address:** `CCNUUFAIOXA4GSY7TWDHDX7TYWVUQ7O6D43WYMKCQOA6XW5PH25U23MG`

---

### Lending Pool 
**Receivable Token:** CC2DRZCX6GB3SKVD6QOKJ4INTCUMOITZAJ4HLVO7JRIFRZDL6LJN3KWK
  **Lending Vault:** CASROYI6HGFXGAEABTMYIYDE3EUK7I7LLC6ZP5NZFB5ZAVY2EQJT5WTS
  **Borrow Contract:** CDYRJVQLCX5TGFATTDJV63NNM4N2OADZ3KTRRRQZG6TJY6ZOT4MFW37X

---

## Problem Statement

### The Problem

Businesses across the globe face significant cash flow constraints due to delayed payments on invoices, insurance claims, merchant settlements, and marketplace payouts. Traditional financing options are:

- Slow and paperwork-heavy
- Geographically limited
- Opaque in pricing and risk
- Inaccessible to smaller businesses or global participants

On the other side, capital providers in crypto are largely limited to volatile, speculative yield opportunities that lack real-world cash flow backing.

### Our Solution

This protocol bridges that gap by:

- Converting verified real-world receivables into on-chain collateral
- Enabling instant liquidity for businesses without selling equity
- Offering lenders predictable, fixed-yield returns backed by real economic activity
- Using ZK proofs and off-chain underwriting to ensure trust, privacy, and compliance
- Leveraging Stellar’s low-cost, fast settlement layer for global scale

---

## Features

- Tokenization of real-world receivables (invoices, claims, payouts)
- Structured lending pools with fixed, predictable APY
- Hybrid underwriting using ZK verification + Web2 credit analysis
- Support for insurance claims, merchant payouts, and marketplace earnings
- Built on Stellar for fast finality and near-zero fees
- Integrated fiat on/off-ramps
- Institutional-grade KYC/KYB and AML compliance
- Privacy-preserving verification of sensitive financial data
- Audit-friendly and regulator-ready architecture

---

## Architecture Overview

High-level architecture components:

- **Borrower Layer**
  - Businesses submit receivables (invoices, claims, payouts)
  - KYB + identity verification
  - Off-chain data ingestion and validation

- **Verification & Underwriting Layer**
  - ZK-based proofs for data integrity
  - Web2 credit scoring and cash flow analysis
  - Risk assessment and pool eligibility checks

- **On-Chain Layer (Stellar)**
  - Tokenized receivable assets
  - Lending pool smart contracts
  - Interest distribution and repayment logic

- **Liquidity & Payments Layer**
  - Fiat on-ramp and off-ramp integrations
  - Cross-border settlement via Stellar Anchors

- **Compliance Layer**
  - KYC/KYB
  - AML screening
  - Audit and reporting hooks


## 1) HLD Diagram (Markdown + Mermaid)

```mermaid
flowchart LR
    Client --> NexumFrontend
    NexumFrontend --> Supabase
    NexumFrontend --> NexumBackend

    NexumBackend --> KYCAML
    NexumBackend --> ZKProofs
    NexumBackend --> RWATokenization

    NexumFrontend --> MPC-Wallet/HSM-Wallet
    MPC-Wallet/HSM-Wallet --> Stellar/Sorbon
    RWATokenization --> MPC-Wallet/HSM-Wallet

    Stellar/Sorbon --> LiquidityPool
    LiquidityPool --> Stellar/Sorbon
    LiquidityPool --> MPC-Wallet/HSM-Wallet
    Anchor --> AutoRepaymentSystem
    
    NexumBackend --> Anchor
    Anchor --> LiquidityPool
    Anchor --> Stellar/Sorbon
    

    Stellar/Sorbon --> Indexer
    Indexer --> NexumBackend

    NexumBackend --> MongoDB

```

---

## 2) Flow 1 — Onboarding + Compliance

```mermaid
sequenceDiagram
  autonumber
  actor Client
  participant FE as Nexum Frontend
  participant SB as Supabase
  participant BE as Nexum Backend
  participant KYC as KYC/KYB/AML APIs
  participant W as Wallet

  Client->>FE: Sign up / Login
  FE->>SB: Authenticate
  SB-->>FE: Session/JWT

  FE->>BE: Create/Upsert client profile
  BE->>KYC: Start KYB + AML screening
  KYC-->>BE: Verification status (PENDING/APPROVED/REJECTED)

  FE->>W: Connect wallet
  W-->>FE: Wallet address
  FE->>BE: Register wallet address
  BE-->>FE: Client status + next steps
```

---

## 3) Flow 2 — Receivable Submission + Proof (ZK)

```mermaid
sequenceDiagram
  autonumber
  actor Client
  participant FE as Nexum Frontend
  participant BE as Nexum Backend
  participant ZK as Reclaim/ZK Proofs
  participant DB as MongoDB

  Client->>FE: Upload invoice + docs + debtor info
  FE->>BE: Submit receivable package
  BE->>BE: Validate schema + risk heuristics (basic)
  BE->>ZK: Request proof generation (invoice existence, linkage, etc.)
  ZK-->>BE: Proof reference + verification result
  BE->>DB: Store receivable record + doc hashes + proof refs
  BE-->>FE: Receivable VERIFIED/REJECTED + reason
```

---

## 4) Flow 3 — RWA Tokenization (Mint)

```mermaid
sequenceDiagram
  autonumber
  participant BE as Nexum Backend
  participant RWA as Tokenization Provider
  participant SC as Stellar
  participant IDX as Indexer
  participant DB as MongoDB
  participant W as Client Wallet

  BE->>RWA: Create tokenization request (receivableId, metadata, proofs)
  RWA->>SC: Mint RWA token (NFT/SFT) to Client Wallet
  SC-->>RWA: Mint tx hash + tokenId
  RWA-->>BE: tokenId + mint tx hash
  SC-->>IDX: Emit events (Minted)
  IDX->>DB: Persist on-chain event (idempotent)
  IDX->>BE: Notify/sync token state
  BE->>DB: Update receivable.tokenId + status=TOKENIZED
```

---

## 5) Flow 4 — Collateral Lock (Escrow)

```mermaid
sequenceDiagram
  autonumber
  actor Client
  participant FE as Nexum Frontend
  participant W as Wallet
  participant SC as Stellar Contract
  participant IDX as Indexer
  participant DB as MongoDB
  participant BE as Backend

  Client->>FE: Lock RWA as collateral
  FE->>W: Build lock tx (tokenId, creditContract)
  W->>SC: Sign + submit tx (lock collateral)
  SC-->>IDX: Event CollateralLocked(tokenId, creditLineId)
  IDX->>DB: Store event + update collateral state
  IDX->>BE: Sync collateral_locked=true
  BE-->>FE: Collateral locked confirmed
```

---

## 6) Flow 5 — Credit Line Creation (Underwriting + Allocation)

```mermaid
sequenceDiagram
  autonumber
  participant FE as Frontend
  participant BE as Backend
  participant DB as MongoDB
  participant LP as Liquidity Pool
  participant SC as Stellar Contract
  participant IDX as Indexer

  FE->>BE: Request credit line creation (receivableId)
  BE->>DB: Fetch receivable + risk snapshot
  BE->>BE: Compute terms (LTV, APR, limit, tenure)
  BE->>LP: Check liquidity + reserve capacity
  LP-->>BE: Allocation approved + pool params

  BE->>SC: Create/Initialize credit line contract (terms + collateral ref)
  SC-->>IDX: Event CreditLineCreated(creditLineId, limit, apr)
  IDX->>DB: Store event + creditLine record
  IDX->>BE: Sync creditLine ACTIVE
  BE-->>FE: creditLineId + available_limit
```

---

## 7) Flow 6 — Drawdown (Borrow)

```mermaid
sequenceDiagram
  autonumber
  actor Client
  participant FE as Frontend
  participant BE as Backend
  participant W as Wallet
  participant SC as Stellar Contract
  participant LP as Liquidity Pool
  participant IDX as Indexer
  participant DB as MongoDB

  Client->>FE: Request drawdown(amount)
  FE->>BE: Create drawdown intent
  BE->>BE: Validate: status ACTIVE, amount <= available_limit
  FE->>W: Build drawdown tx
  W->>SC: Sign + submit drawdown tx
  SC->>LP: Transfer USDC from pool to wallet
  SC-->>IDX: Event Drawdown(creditLineId, amount)
  IDX->>DB: Update drawn + utilization + interest start time
  IDX->>BE: Sync new balances
  BE-->>FE: Drawdown success + updated dashboard values
```

---

## 8) Flow 7 — Repayment / Recoup (Anchor-driven)

### 7A: Auto Recoup (Debtor Pays Fiat → Anchor → USDC → Contract)

```mermaid
sequenceDiagram
  autonumber
  actor Debtor
  participant AN as Anchor/Payment SDK
  participant SC as Stellar Contract
  participant LP as Liquidity Pool
  participant IDX as Indexer
  participant DB as MongoDB
  participant BE as Backend

  Debtor->>AN: Pay invoice (fiat rail)
  AN->>AN: Convert fiat→USDC + fees
  AN->>SC: Submit repayment tx (principal+interest allocation)
  SC->>LP: Distribute repayment to pool / LP accounting
  SC-->>IDX: Event Repayment(creditLineId, amount, split)
  IDX->>DB: Update outstanding, interest paid, status if settled
  IDX->>BE: Sync repayment status
  BE-->>AN: (Optional) Webhook ACK / reconciliation
```

### 7B: Manual Repayment (Borrower Repays)

```mermaid
sequenceDiagram
  autonumber
  actor Client
  participant W as Wallet
  participant SC as Stellar Contract
  participant IDX as Indexer
  participant DB as MongoDB

  Client->>W: Send USDC repayment
  W->>SC: Sign + submit repayment tx
  SC-->>IDX: Event Repayment(creditLineId, amount)
  IDX->>DB: Update outstanding + interest
```

---

## 9) Flow 8 — Closure + Unlock Collateral

```mermaid
sequenceDiagram
  autonumber
  participant SC as Stellar Contract
  participant IDX as Indexer
  participant DB as MongoDB
  participant BE as Backend
  participant W as Wallet

  SC->>SC: Check outstanding == 0
  SC-->>IDX: Event CreditSettled(creditLineId)
  IDX->>DB: Mark creditLine SETTLED
  IDX->>BE: Notify settled
  SC->>W: Unlock/Return collateral token (or mark released)
  SC-->>IDX: Event CollateralReleased(tokenId)
  IDX->>DB: collateral_locked=false
```

---

## 10) Flow 9 — Default + Liquidation (Minimum Viable Safe Version)

```mermaid
sequenceDiagram
  autonumber
  participant BE as Backend
  participant SC as Stellar Contract
  participant IDX as Indexer
  participant DB as MongoDB
  participant LP as Liquidity Pool
  participant AN as Anchor/OTC Desk

  BE->>BE: Detect delinquency (due date breached or covenant fail)
  BE->>SC: Trigger default flag / penalty APR (admin/automation)
  SC-->>IDX: Event Defaulted(creditLineId)
  IDX->>DB: status=DEFAULTED + penalty terms

  BE->>AN: Initiate liquidation route (OTC / marketplace / settlement)
  AN->>SC: Submit liquidation proceeds repayment
  SC->>LP: Repay LPs first
  SC-->>IDX: Event LiquidationApplied(creditLineId, amount)
  IDX->>DB: Update recovery + remaining loss (if any)
```

---

## 11) Flow 10 — Indexer Sync (Idempotent, Replay-safe)

```mermaid
flowchart TD
    StellarEvents --> Indexer
    Indexer --> ProcessCheck

    ProcessCheck --> YesProcessed
    ProcessCheck --> NoProcessed

    YesProcessed --> SkipEvent
    NoProcessed --> StoreEvent

    StoreEvent --> UpdateMongo
    UpdateMongo --> NotifyBackend
    NotifyBackend --> FrontendRefresh

```

---

## Screenshots of the dApp

>
![Screenshot 2026-02-08 at 11.26.20 AM](https://hackmd.io/_uploads/rys9hjHwWx.png)
![Screenshot 2026-02-08 at 11.44.08 AM](https://hackmd.io/_uploads/Hyi92iSwZe.png)
![Screenshot 2026-02-08 at 11.44.16 AM](https://hackmd.io/_uploads/BJa53iBDZg.png)
![Screenshot 2026-02-08 at 11.44.24 AM](https://hackmd.io/_uploads/Sy0cnoHDbg.png)
![Screenshot 2026-02-08 at 11.44.34 AM](https://hackmd.io/_uploads/B1Rq2srPbg.png)
![Screenshot 2026-02-08 at 11.44.40 AM](https://hackmd.io/_uploads/H1R9hirvZx.png)
![Screenshot 2026-02-08 at 11.44.47 AM](https://hackmd.io/_uploads/rJCqhirDWx.png)
![Screenshot 2026-02-08 at 11.45.04 AM](https://hackmd.io/_uploads/HJT53sBPbg.png)
![Screenshot 2026-02-08 at 11.45.16 AM](https://hackmd.io/_uploads/rJTqnoSwWx.png)
![Screenshot 2026-02-08 at 11.45.21 AM](https://hackmd.io/_uploads/B1p9hjSv-x.png)
![Screenshot 2026-02-08 at 11.45.31 AM](https://hackmd.io/_uploads/S1T9norwbg.png)
![Screenshot 2026-02-08 at 11.45.39 AM](https://hackmd.io/_uploads/SyT92srwbx.png)
![Screenshot 2026-02-08 at 11.45.46 AM](https://hackmd.io/_uploads/H1lTqnsHDWl.png)
![Screenshot 2026-02-08 at 11.46.03 AM](https://hackmd.io/_uploads/rygacnirDbe.png)
![Screenshot 2026-02-08 at 11.46.13 AM](https://hackmd.io/_uploads/Bye6qnoHP-g.png)
![Screenshot 2026-02-08 at 11.46.19 AM](https://hackmd.io/_uploads/rJp93orDWe.png)
![Screenshot 2026-02-08 at 11.55.35 AM](https://hackmd.io/_uploads/Sypc3iSPbe.png)

---

## Deployed Link

https://nexumfi.vercel.app

https://www.loom.com/share/7abd0744df4d4bbc9d7c6f1407d07e71

---

## Future Scope and Plans

- Expansion to additional receivable types (SaaS MRR, payroll receivables and Institutions)
- Dynamic risk-based pricing and pool tranching
- Secondary market for receivable-backed tokens
- DAO-governed risk parameters and pool management
- Integration with more global on/off-ramp partners
- Risk dashboards and reporting tools
- Cross-chain interoperability while retaining Stellar as settlement layer
- Regulatory partnerships and jurisdiction-specific compliance modules

---

## License

MIT
