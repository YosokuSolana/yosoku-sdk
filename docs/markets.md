# Markets

The `client.markets` module handles market creation and the `client.marketInfo` module handles metadata.

## Regular Market

A standard binary outcome market (YES/NO).

```ts
import { BN } from "@coral-xyz/anchor";

const result = await client.markets.createRegularMarket({
  name: "Will ETH hit $5000?",
  category: "crypto",
  eventDeadline: new Date("2025-12-31"),
  marketQuestion: "Will ETH reach $5000 by end of 2025?",
  description: "Resolves YES if ETH trades at or above $5000.",
  rules: "Price must be sustained for at least 1 minute on a major CEX.",
  minOrderSize: new BN(1_000_000),    // 1 USDC (optional, default: 1 USDC)
  imageUri: "https://example.com/eth.png",  // optional
  resolverType: { type: "uma" },       // optional, default: UMA
});
```

### Return Value

```ts
interface RegularMarketResult {
  marketId: bigint;
  marketPda: PublicKey;
  vault: PublicKey;
  creatorVault: PublicKey;
  yesOrderBook: PublicKey;
  noOrderBook: PublicKey;
  yesFillLog: PublicKey;
  noFillLog: PublicKey;
  marketInfo: PublicKey;
  signatures: string[];
}
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Market name (max 64 chars) |
| `category` | `string` | Yes | Category label (max 32 chars) |
| `eventDeadline` | `Date \| number` | Yes | When the event expires (Date or unix timestamp) |
| `marketQuestion` | `string` | Yes | The question being asked |
| `description` | `string` | No | Detailed description |
| `rules` | `string` | No | Resolution rules |
| `imageUri` | `string` | No | Image URL (max 128 chars) |
| `minOrderSize` | `BN` | No | Minimum order in USDC base units. Default: `1_000_000` (1 USDC) |
| `resolverType` | `ResolverTypeInput` | No | Resolution method. Default: `{ type: "uma" }` |
| `marketId` | `bigint` | No | Custom ID. Auto-generated if omitted |
| `marketInfo` | `PublicKey` | No | Pre-created MarketInfo. Auto-created if omitted |

### What happens under the hood

`createRegularMarket` executes multiple transactions:

1. Creates a `MarketInfo` account with the question/description/rules
2. Pre-creates the 4 large accounts (2 order books + 2 fill logs) via `SystemProgram.createAccount`
3. Calls `createRegularMarket` on the program

All signatures are returned in the `signatures` array.

## Multi-Leg Market

A market with multiple named outcomes (e.g., "Who will win the election?").

```ts
const result = await client.markets.createMultiLegMarket({
  category: "politics",
  eventDeadline: new Date("2025-11-05"),
  marketQuestion: "Who will win ___?",  // must contain "___"
  description: "Presidential election winner",
});

// Add outcome legs
const leg1 = await client.markets.addLeg({
  marketPda: result.marketPda,
  legName: "Candidate A",
});
const leg2 = await client.markets.addLeg({
  marketPda: result.marketPda,
  legName: "Candidate B",
});
```

The market question **must** contain exactly one `___` placeholder. Each leg replaces the placeholder with its name.

### Leg Return Value

```ts
interface LegResult {
  index: number;
  name: string;
  vault: PublicKey;
  yesOrderBook: PublicKey;
  noOrderBook: PublicKey;
  yesFillLog: PublicKey;
  noFillLog: PublicKey;
  signature: string;
}
```

When trading on a multi-leg market, pass the `index` parameter to target a specific leg.

## Resolver Types

### UMA (default)

Anyone can propose an outcome after the deadline. If disputed, the dispute mechanism kicks in. If no proposal is made, the market resolves to a 50/50 split.

```ts
resolverType: { type: "uma" }
```

### Wallet Vote

A set of up to 10 authorized wallets vote on the outcome. Majority wins. If no majority by deadline, resolves to split.

```ts
resolverType: {
  type: "walletVote",
  voters: [voter1Pubkey, voter2Pubkey, voter3Pubkey],
}
```

## MarketInfo CRUD

MarketInfo accounts hold text metadata and **lock after being attached to a market**. Modify them before creating the market, or use `createRegularMarket` which handles everything automatically.

```ts
// Create and populate in one call
const info = await client.marketInfo.createPopulatedMarketInfo({
  marketType: "regular",
  resolverType: { type: "uma" },
  marketQuestion: "Will X happen?",
  description: "Details...",
  rules: "Rules...",
});

// Or modify individually
await client.marketInfo.setMarketQuestion(info.marketInfoPda, "New question?");
await client.marketInfo.appendMarketQuestion(info.marketInfoPda, " More text.");
await client.marketInfo.setDescription(info.marketInfoPda, "New description");
await client.marketInfo.appendDescription(info.marketInfoPda, " More.");
await client.marketInfo.setRules(info.marketInfoPda, "New rules");
await client.marketInfo.appendRules(info.marketInfoPda, " More.");
await client.marketInfo.setMarketType(info.marketInfoPda, "multiLeg");
await client.marketInfo.setResolverType(info.marketInfoPda, { type: "uma" });
```

Attempting to modify a locked MarketInfo throws `MarketInfoLocked` (6061).
