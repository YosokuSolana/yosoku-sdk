# Accounts

The `client.accounts` module fetches and deserializes all on-chain account types. All methods return `null` for non-existent accounts.

## Markets

```ts
// By address
const market = await client.accounts.getMarket(marketPda);

// By numeric ID
const market = await client.accounts.getMarketById(123n);

// All markets (with optional filters)
const all = await client.accounts.getMarkets();
const filtered = await client.accounts.getMarkets({
  creator: walletPubkey,
  verified: true,
});
```

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
  legs: MarketLeg[];
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

**Important**: `status`, `winningSide`, and `resolvingState` live on each leg, not the market itself. Access them via `market.legs[0].status`.

## Orders

```ts
const order = await client.accounts.getOrder(orderPda);
const userOrders = await client.accounts.getUserOrders(marketPda, userPubkey);
```

### OrderAccount

```ts
interface OrderAccount {
  address: PublicKey;
  authority: PublicKey;
  market: PublicKey;
  index: number;
  side: "yes" | "no";
  price: number;
  orderId: number;
  amount: BN;
  seed: number;
  coveredBy: "usdc" | "shares";
}
```

## Positions

```ts
const pos = await client.accounts.getPosition(marketPda, 0, userPubkey, "yes");
const allPositions = await client.accounts.getUserPositions(marketPda, userPubkey);
```

### PositionAccount

```ts
interface PositionAccount {
  address: PublicKey;
  market: PublicKey;
  index: number;
  user: PublicKey;
  side: "yes" | "no";
  amount: BN;       // number of shares held
}
```

## Order Books

Returns aggregated price levels. No internal tree structure is exposed.

```ts
// Single side
const ob = await client.accounts.getOrderBook(orderbookPubkey);

// Both sides for a market leg
const { yes, no } = await client.accounts.getOrderBooks(marketPda);
// or specific leg:
const { yes, no } = await client.accounts.getOrderBooks(marketPda, 1);
```

### OrderBookView

```ts
interface OrderBookView {
  side: "yes" | "no";
  levels: OrderBookLevel[];
}

interface OrderBookLevel {
  price: number;         // tick (1-999)
  totalQuantity: BN;     // total shares at this price
  orderCount: number;    // number of individual orders
}
```

## Market Info

```ts
const info = await client.accounts.getMarketInfo(marketInfoPubkey);
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

## Resolution Proposal

```ts
const proposal = await client.accounts.getResolutionProposal(marketPda);
// or specific leg:
const proposal = await client.accounts.getResolutionProposal(marketPda, 1);
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

## Vote State

```ts
const voteState = await client.accounts.getVoteState(marketPda);
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

## Fill Log

```ts
const fillLog = await client.accounts.getFillLog(fillLogPubkey);
```

Returns an opaque `FillLogView` with `market`, `index`, and `side`. Internal settlement data is not exposed.
