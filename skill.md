# Yosoku SDK

TypeScript SDK for the Yosoku prediction market protocol on Solana.

**npm**: `yosoku` (v0.1.0)
**Program ID**: `8p6MKtMGGugZMy2HGXtL3uBb11y7xuzXmbMbQgNmWVUQ`
**Network**: Devnet (USDC mint: `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr`)

## Install

```bash
npm install yosoku
```

Peer dependencies: `@coral-xyz/anchor@^0.31.1`, `@solana/web3.js@~1.95.8`, `@solana/spl-token@^0.4.14`

---

## Quick Start

```ts
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PredMarketClient } from "yosoku";

// With a wallet (read + write)
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
const client = PredMarketClient.fromProvider(provider);

// Read-only (no signing)
const client = PredMarketClient.readOnly(connection);
```

The client exposes 9 modules:

```ts
client.markets         // Create markets
client.marketInfo      // Market metadata CRUD
client.trading         // Place and execute orders
client.positions       // Claim, merge, cancel, redeem
client.resolution      // UMA-style resolution
client.voteResolution  // Wallet vote resolution
client.admin           // Verify, close, fees
client.accounts        // Fetch all account types
client.events          // WebSocket event subscriptions
```

---

## Price System

Prices are **ticks** from 1 to 999. YES price + NO price = 1000 ticks = $1.00. USDC uses 6 decimals.

| Tick | Dollar | USDC base units per share |
|------|--------|--------------------------|
| 100  | $0.10  | 100,000                  |
| 500  | $0.50  | 500,000                  |
| 900  | $0.90  | 900,000                  |

```ts
import { costPerShare, usdcToShares, sharesToUsdc, complementPrice,
         tickToPrice, priceToTick, isValidPrice, formatUsdc, parseUsdc } from "yosoku";

costPerShare(500)                    // 500_000n (base units per share)
usdcToShares(100_000_000n, 500)      // 200n (100 USDC / $0.50)
sharesToUsdc(200n, 500)              // 100_000_000n
complementPrice(300)                 // 700
tickToPrice(500)                     // 0.5
priceToTick(0.5)                     // 500
isValidPrice(500)                    // true (1-999 only)
formatUsdc(1_500_000n)               // "$1.50"
parseUsdc("$1.50")                   // 1_500_000n
```

---

## Creating Markets

### Regular Market (single yes/no outcome)

```ts
import { BN } from "@coral-xyz/anchor";

const result = await client.markets.createRegularMarket({
  name: "Will ETH hit $5000?",
  category: "crypto",
  eventDeadline: new Date("2025-12-31"),  // or unix timestamp number
  marketQuestion: "Will ETH hit $5000 by end of 2025?",
  description: "Resolves YES if...",       // optional
  rules: "Standard resolution rules",     // optional
  imageUri: "https://...",                 // optional
  minOrderSize: new BN(1_000_000),         // 1 USDC minimum (optional, defaults to 1 USDC)
  resolverType: { type: "uma" },           // optional, defaults to UMA
});

// result: { marketId, marketPda, vault, creatorVault, yesOrderBook, noOrderBook,
//           yesFillLog, noFillLog, marketInfo, signatures }
```

### Multi-Leg Market (multiple outcomes)

```ts
const result = await client.markets.createMultiLegMarket({
  category: "politics",
  eventDeadline: new Date("2025-11-05"),
  marketQuestion: "Who will win ___?",  // must contain "___" placeholder
  description: "Presidential election winner",
});

// Add outcome legs
const leg1 = await client.markets.addLeg({ marketPda: result.marketPda, legName: "Candidate A" });
const leg2 = await client.markets.addLeg({ marketPda: result.marketPda, legName: "Candidate B" });
// leg: { index, name, vault, yesOrderBook, noOrderBook, yesFillLog, noFillLog, signature }
```

### Wallet Vote Resolution

```ts
const result = await client.markets.createRegularMarket({
  name: "Team vote market",
  category: "internal",
  eventDeadline: new Date("2025-06-01"),
  marketQuestion: "Will X happen?",
  resolverType: {
    type: "walletVote",
    voters: [voter1Pubkey, voter2Pubkey, voter3Pubkey],  // max 10
  },
});
```

---

## Trading

All trading methods auto-derive PDAs and fetch required accounts. You only provide the market address and your intent.

### Limit Orders

```ts
// Buy YES shares at $0.50 each, spending 10 USDC
const result = await client.trading.limitBid({
  market: marketPda,
  side: "yes",
  price: 500,                        // ticks (1-999)
  usdcAmount: new BN(10_000_000),    // 10 USDC
  // index: 0,                       // leg index, defaults to 0
  // matchExisting: true,            // try to fill against resting orders (default: true)
  // seed: 12345,                    // order uniqueness seed (auto-generated if omitted)
  // referralAccount: pubkey,        // referral USDC account for fee sharing
});
// result: { orderPda, signature }

// Sell YES shares at $0.60 each
const result = await client.trading.limitAsk({
  market: marketPda,
  side: "yes",
  price: 600,
  shares: new BN(20),
});

// Covered bid (backed by USDC or existing shares)
const result = await client.trading.coveredBid({
  market: marketPda,
  side: "yes",
  price: 500,
  shares: new BN(10),
  coveredBy: "usdc",    // or "shares"
});
```

### Market Orders (immediate execution)

```ts
// Buy YES shares at market price, spending up to 10 USDC, want at least 15 shares
const sig = await client.trading.marketBuy({
  market: marketPda,
  side: "yes",
  maxUsdc: new BN(10_000_000),
  minShares: new BN(15),       // slippage protection
});

// Sell 20 YES shares at market price, want at least 8 USDC back
const sig = await client.trading.marketSell({
  market: marketPda,
  side: "yes",
  shares: new BN(20),
  minUsdc: new BN(8_000_000),  // slippage protection
});
```

---

## Positions

```ts
// Claim filled shares from a matched limit order
await client.positions.claimPosition({
  market: marketPda,
  orderPda: orderResult.orderPda,
  orderSide: "yes",
});

// Merge equal YES + NO shares back into USDC ($1.00 per pair)
await client.positions.mergeShares({
  market: marketPda,
  amount: new BN(10),  // merge 10 pairs
});

// Cancel an unfilled resting order (refunds USDC)
await client.positions.cancelOrder({
  market: marketPda,
  orderPda: orderResult.orderPda,
});

// Redeem position after market resolves
await client.positions.redeemPosition({
  market: marketPda,
  side: "yes",   // winning side gets $1.00/share, split gets $0.50, losing gets $0
});
```

---

## Resolution

### UMA Resolution (default)

```ts
// Propose outcome (deposits 100 USDC bond)
await client.resolution.proposeResolution({
  market: marketPda,
  proposedOutcome: "yes",   // "yes" or "no"
});

// Finalize after 24h dispute window (anyone can call)
await client.resolution.finalizeResolution(marketPda);

// Claim dispute bond winnings
await client.resolution.claimDisputeWinnings(marketPda);

// Resolve expired market to 50/50 split (no proposal needed, deadline must have passed)
await client.resolution.resolveExpiredMarket(marketPda);
```

### Wallet Vote Resolution

```ts
// Cast vote (must be an authorized voter)
await voterClient.voteResolution.voteResolution({
  market: marketPda,
  vote: "yes",   // "yes" or "no"
});
// Auto-finalizes when majority reached (e.g., 2 of 3 voters)

// Finalize after voting deadline if no majority
await client.voteResolution.finalizeVoteResolution(marketPda);
// Resolves to "split" if no majority
```

---

## Reading Accounts

```ts
// Markets
const market = await client.accounts.getMarket(marketPda);
const market = await client.accounts.getMarketById(123n);
const markets = await client.accounts.getMarkets({ creator: pubkey, verified: true });

// Orders
const order = await client.accounts.getOrder(orderPda);
const orders = await client.accounts.getUserOrders(marketPda, userPubkey);

// Positions
const pos = await client.accounts.getPosition(marketPda, 0, userPubkey, "yes");
const positions = await client.accounts.getUserPositions(marketPda, userPubkey);

// Order books (aggregated price levels, no internal tree details)
const ob = await client.accounts.getOrderBook(orderbookPubkey);
const { yes, no } = await client.accounts.getOrderBooks(marketPda);

// Metadata
const info = await client.accounts.getMarketInfo(marketInfoPubkey);

// Resolution state
const proposal = await client.accounts.getResolutionProposal(marketPda);
const voteState = await client.accounts.getVoteState(marketPda);
```

All fetchers return `null` for non-existent accounts.

---

## Events

Subscribe to real-time WebSocket events. Each method returns an unsubscribe function.

```ts
const unsub = client.events.onTrade((event) => {
  console.log(event.side, event.shares, event.usdcAmount, event.isBuy);
});

client.events.onOrderPlaced((event) => { /* event.price, event.amount, event.side */ });
client.events.onOrderCancelled((event) => { /* event.refundAmount */ });
client.events.onPositionClaimed((event) => { /* event.claimedAmount */ });
client.events.onPositionUpdated((event) => { /* event.oldAmount, event.newAmount, event.delta */ });
client.events.onSharesMerged((event) => { /* event.amount, event.usdcReceived */ });

// Stop listening
unsub();
```

---

## Admin

```ts
// Verify a market (requires VERIFIER_PUBKEY signer)
await client.admin.verifyMarket(marketPda);

// Close orderbook after resolution (reclaims rent)
await client.admin.closeOrderbook(marketPda, 0, "yes");
await client.admin.closeOrderbook(marketPda, 0, "no");

// Close market after both orderbooks closed
await client.admin.closeMarket(marketPda);

// Close any program account (admin only)
await client.admin.adminCloseAccount(accountPubkey);

// Claim creator fees from the creator vault
await client.admin.claimCreatorFees(marketPda);
```

---

## MarketInfo CRUD

MarketInfo accounts hold the text metadata (question, description, rules). They lock after being attached to a market.

```ts
// Create with all fields at once
const result = await client.marketInfo.createPopulatedMarketInfo({
  marketType: "regular",
  resolverType: { type: "uma" },
  marketQuestion: "Will ETH hit $5000?",
  description: "Resolves YES if...",
  rules: "Standard rules",
});
// result: { marketInfoPda, keypair, signature }

// Or create empty then set fields individually
const result = await client.marketInfo.createMarketInfo({
  marketType: "regular",
  resolverType: { type: "uma" },
});
await client.marketInfo.setMarketQuestion(result.marketInfoPda, "Will ETH hit $5000?");
await client.marketInfo.setDescription(result.marketInfoPda, "Resolves YES if...");
await client.marketInfo.setRules(result.marketInfoPda, "Standard rules");

// Append text (for long content)
await client.marketInfo.appendMarketQuestion(result.marketInfoPda, " Additional text.");
await client.marketInfo.appendDescription(result.marketInfoPda, " More details.");
await client.marketInfo.appendRules(result.marketInfoPda, " Extra rules.");

// Change type or resolver
await client.marketInfo.setMarketType(result.marketInfoPda, "multiLeg");
await client.marketInfo.setResolverType(result.marketInfoPda, { type: "walletVote", voters: [...] });
```

---

## Error Handling

```ts
import { parsePredMarketError, PredMarketErrorCode } from "yosoku";

try {
  await client.trading.limitBid({ ... });
} catch (err) {
  const parsed = parsePredMarketError(err);
  if (parsed) {
    console.log(parsed.code);       // e.g., 6019
    console.log(parsed.errorName);  // e.g., "SlippageExceeded"
    console.log(parsed.message);    // e.g., "Slippage exceeded - received fewer shares than minimum"
  }
}
```

Common error codes:

| Code | Name | Meaning |
|------|------|---------|
| 6000 | InvalidPrice | Price must be 1-999 |
| 6001 | InvalidAmount | Amount must be > 0 |
| 6019 | SlippageExceeded | Market order slippage protection triggered |
| 6020 | NoLiquidity | No resting orders to fill |
| 6021 | MarketNotActive | Market is paused or resolved |
| 6022 | NoFillsToClaim | Order has no fills to claim |
| 6023 | Unauthorized | Wrong signer for this operation |
| 6024 | InsufficientShares | Not enough shares in position |
| 6025 | BelowMinOrderSize | Order too small for this market |
| 6030 | OrderAlreadyFilled | Can't cancel a filled order |
| 6045 | MarketNotResolved | Redeem requires resolved market |
| 6053 | InvalidResolverType | Wrong resolution method for this market |
| 6054 | UnauthorizedVoter | Voter not in authorized list |
| 6061 | MarketInfoLocked | Can't modify MarketInfo after market creation |
| 6064 | EventDeadlineInPast | Deadline must be in the future |
| 6070 | NoFeesToClaim | Creator vault is empty |

---

## Account Types

### MarketAccount

```ts
interface MarketAccount {
  address: PublicKey;
  marketId: bigint;
  creator: PublicKey;
  marketInfo: PublicKey;
  category: string;
  imageUri: string;
  createdAt: Date;
  minOrderSize: BN;
  eventDeadline: Date;
  feeBps: number;
  verified: boolean;
  marketType: "regular" | "multiLeg";
  legs: MarketLeg[];    // status/winningSide live per-leg, NOT top-level
}

interface MarketLeg {
  index: number;
  name: string;
  yesOrderBook: PublicKey;
  noOrderBook: PublicKey;
  yesFillLog: PublicKey;
  noFillLog: PublicKey;
  vault: PublicKey;
  status: "active" | "paused" | "resolved";
  winningSide: "yes" | "no" | "none" | "split";
  resolvingState: "notStarted" | "proposed" | "disputed" | "completed";
  sharesOutstanding: BN;
  totalVolume: BN;
}
```

Access status via `market.legs[0].status`, not `market.status`.

### OrderAccount

```ts
interface OrderAccount {
  address: PublicKey;
  authority: PublicKey;
  market: PublicKey;
  index: number;
  side: "yes" | "no";
  price: number;           // ticks (1-999)
  orderId: number;
  amount: BN;
  seed: number;
  coveredBy: "usdc" | "shares";
}
```

### PositionAccount

```ts
interface PositionAccount {
  address: PublicKey;
  market: PublicKey;
  index: number;
  user: PublicKey;
  side: "yes" | "no";
  amount: BN;              // number of shares
}
```

### OrderBookView

```ts
interface OrderBookView {
  side: "yes" | "no";
  levels: OrderBookLevel[];   // aggregated, sorted by price
}

interface OrderBookLevel {
  price: number;            // tick
  totalQuantity: BN;        // total shares at this level
  orderCount: number;       // number of orders at this level
}
```

### MarketInfoAccount

```ts
interface MarketInfoAccount {
  address: PublicKey;
  authority: PublicKey | null;
  isLocked: boolean;
  marketType: "regular" | "multiLeg";
  resolverType: { type: "uma" } | { type: "walletVote"; voters: PublicKey[] };
  marketQuestion: string;
  description: string;
  rules: string;
}
```

### ResolutionProposalAccount

```ts
interface ResolutionProposalAccount {
  address: PublicKey;
  market: PublicKey;
  index: number;
  proposer: PublicKey;
  proposedOutcome: "yes" | "no" | "none";
  proposerBond: BN;
  proposedAt: Date;
  disputer: PublicKey;
  disputerBond: BN;
  disputedAt: Date | null;
  isSettled: boolean;
  bondsClaimed: boolean;
}
```

### VoteStateAccount

```ts
interface VoteStateAccount {
  address: PublicKey;
  market: PublicKey;
  index: number;
  totalVoters: number;
  yesVotes: number;
  noVotes: number;
  votes: VoteRecord[];
  isFinalized: boolean;
}

interface VoteRecord {
  voter: PublicKey;
  vote: "none" | "yes" | "no";
  votedAt: Date | null;
}
```

### Event Types

```ts
interface TradeEvent {
  market: PublicKey; user: PublicKey; index: number; side: "yes" | "no";
  isBuy: boolean; shares: BN; usdcAmount: BN; avgPrice: number;
  fillsCount: number; timestamp: Date;
}

interface OrderPlacedEvent {
  market: PublicKey; user: PublicKey; order: PublicKey; side: "yes" | "no";
  price: number; amount: BN; orderId: number; coveredBy: "usdc" | "shares";
  timestamp: Date;
}

interface OrderCancelledEvent {
  market: PublicKey; user: PublicKey; order: PublicKey; side: "yes" | "no";
  price: number; amount: BN; orderId: number; refundAmount: BN;
  coveredBy: "usdc" | "shares"; timestamp: Date;
}

interface PositionClaimedEvent {
  market: PublicKey; user: PublicKey; order: PublicKey; side: "yes" | "no";
  price: number; claimedAmount: BN; orderClosed: boolean;
  coveredBy: "usdc" | "shares"; timestamp: Date;
}

interface PositionUpdatedEvent {
  market: PublicKey; user: PublicKey; side: "yes" | "no";
  oldAmount: BN; newAmount: BN; delta: BN; timestamp: Date;
}

interface SharesMergedEvent {
  market: PublicKey; user: PublicKey; amount: BN; usdcReceived: BN; timestamp: Date;
}
```

---

## PDA Derivation

For advanced use cases, all PDA functions are exported:

```ts
import { getMarketPda, getPositionPda, getOrderPda, getVaultPda,
         getCreatorVaultPda, getResolutionProposalPda, getBondVaultPda,
         getFillLogPda, getVoteStatePda } from "yosoku";

const [marketPda, bump] = getMarketPda(PROGRAM_ID, marketId);           // seeds: ["market", u64le]
const [position]        = getPositionPda(PROGRAM_ID, market, 0, user, 0); // seeds: ["position", market, u8, user, u8(side)]
const [order]           = getOrderPda(PROGRAM_ID, market, 0, user, 500, seed); // seeds: ["order", market, u8, user, u16le(price), u32le(seed)]
const [vault]           = getVaultPda(PROGRAM_ID, market, 0);           // seeds: ["vault", market, u8]
const [creatorVault]    = getCreatorVaultPda(PROGRAM_ID, market);       // seeds: ["creator-vault", market]
const [proposal]        = getResolutionProposalPda(PROGRAM_ID, market, 0); // seeds: ["resolution_proposal", market, u8]
const [bondVault]       = getBondVaultPda(PROGRAM_ID, market, 0);       // seeds: ["bond_vault", market, u8]
const [fillLog]         = getFillLogPda(PROGRAM_ID, market, 0, 0);     // seeds: ["fill_log", market, u8, u8(side)]
const [voteState]       = getVoteStatePda(PROGRAM_ID, market, 0);      // seeds: ["vote_state", market, u8]
```

Side encoding: `0` = yes, `1` = no.

---

## Constants

```ts
import { PROGRAM_ID, USDC_MINT, PROTOCOL_USDC_ACCOUNT, ADMIN_PUBKEY,
         USDC_DECIMALS, PROPOSER_BOND, DISPUTER_BOND,
         DISPUTE_WINDOW_SECONDS, MAX_VOTERS } from "yosoku";
```

| Constant | Value |
|----------|-------|
| `PROGRAM_ID` | `8p6MKtMGGugZMy2HGXtL3uBb11y7xuzXmbMbQgNmWVUQ` |
| `USDC_MINT` | `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr` |
| `USDC_DECIMALS` | `6` |
| `PROPOSER_BOND` | `100_000_000` (100 USDC) |
| `DISPUTER_BOND` | `200_000_000` (200 USDC) |
| `DISPUTE_WINDOW_SECONDS` | `86400` (24 hours) |
| `MAX_VOTERS` | `10` |

---

## Full Lifecycle Example

```ts
import { PredMarketClient, parsePredMarketError, formatUsdc } from "yosoku";
import { BN } from "@coral-xyz/anchor";

// 1. Create market
const market = await client.markets.createRegularMarket({
  name: "ETH $5k",
  category: "crypto",
  eventDeadline: new Date("2025-12-31"),
  marketQuestion: "Will ETH hit $5000?",
});

// 2. Place limit orders
const bid = await client.trading.limitBid({
  market: market.marketPda,
  side: "yes",
  price: 400,
  usdcAmount: new BN(20_000_000),  // 20 USDC
});

// 3. Counterparty takes the other side
const ask = await counterpartyClient.trading.limitBid({
  market: market.marketPda,
  side: "no",
  price: 600,                       // complement of 400
  usdcAmount: new BN(30_000_000),
});

// 4. Claim matched shares
await client.positions.claimPosition({
  market: market.marketPda,
  orderPda: bid.orderPda,
  orderSide: "yes",
});

// 5. Check position
const pos = await client.accounts.getPosition(
  market.marketPda, 0, walletPubkey, "yes"
);
console.log(`Shares: ${pos.amount.toString()}`);

// 6. After deadline, propose resolution
await client.resolution.proposeResolution({
  market: market.marketPda,
  proposedOutcome: "yes",
});

// 7. After 24h dispute window, finalize
await client.resolution.finalizeResolution(market.marketPda);

// 8. Redeem winning position
await client.positions.redeemPosition({
  market: market.marketPda,
  side: "yes",   // $1.00 per share if YES won
});
```
