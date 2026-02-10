# Yosoku SDK

TypeScript SDK for the [Yosoku](https://yosoku.fun) prediction market protocol on Solana.

Create markets, trade outcome shares, resolve events, and read on-chain state — all with a single typed client.

## Install

```bash
npm install yosoku @coral-xyz/anchor @solana/web3.js
```

## Quick Start

```ts
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PredMarketClient } from "yosoku";

// With a wallet (read + write)
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
const client = PredMarketClient.fromProvider(provider);

// Read-only
const readClient = PredMarketClient.readOnly(connection);
```

## Create a Market

```ts
import { BN } from "@coral-xyz/anchor";

const market = await client.markets.createRegularMarket({
  name: "Will ETH hit $5000?",
  category: "crypto",
  eventDeadline: new Date("2025-12-31"),
  marketQuestion: "Will ETH reach $5000 by end of 2025?",
  description: "Resolves YES if ETH trades at or above $5000 on any major exchange.",
  rules: "Price must be sustained for at least 1 minute.",
  minOrderSize: new BN(1_000_000), // 1 USDC
});
```

## Place Orders

```ts
// Limit buy: 20 USDC of YES shares at $0.40 each
const order = await client.trading.limitBid({
  market: market.marketPda,
  side: "yes",
  price: 400,                       // ticks (1-999), 400 = $0.40
  usdcAmount: new BN(20_000_000),   // 20 USDC
});

// Market buy: up to 10 USDC, want at least 15 shares
await client.trading.marketBuy({
  market: market.marketPda,
  side: "yes",
  maxUsdc: new BN(10_000_000),
  minShares: new BN(15),
});
```

## Read State

```ts
const marketData = await client.accounts.getMarket(market.marketPda);
const position = await client.accounts.getPosition(market.marketPda, 0, walletPubkey, "yes");
const { yes, no } = await client.accounts.getOrderBooks(market.marketPda);
```

## Resolve & Redeem

```ts
// Propose resolution (deposits 100 USDC bond)
await client.resolution.proposeResolution({
  market: market.marketPda,
  proposedOutcome: "yes",
});

// Finalize after 24h dispute window
await client.resolution.finalizeResolution(market.marketPda);

// Redeem winning shares at $1.00 each
await client.positions.redeemPosition({
  market: market.marketPda,
  side: "yes",
});
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Trading](docs/trading.md) | Limit orders, market orders, covered bids |
| [Markets](docs/markets.md) | Creating and managing markets |
| [Positions](docs/positions.md) | Claiming, merging, cancelling, redeeming |
| [Resolution](docs/resolution.md) | UMA and wallet vote resolution flows |
| [Accounts](docs/accounts.md) | Reading all on-chain account types |
| [Events](docs/events.md) | Real-time WebSocket subscriptions |
| [Errors](docs/errors.md) | Error codes and handling |
| [Price System](docs/price.md) | Tick math, USDC conversions |

## API Overview

```ts
client.markets         // Create regular and multi-leg markets
client.marketInfo      // Market metadata CRUD (question, description, rules)
client.trading         // limitBid, limitAsk, coveredBid, marketBuy, marketSell
client.positions       // claimPosition, mergeShares, cancelOrder, redeemPosition
client.resolution      // proposeResolution, finalizeResolution, resolveExpiredMarket
client.voteResolution  // voteResolution, finalizeVoteResolution
client.admin           // verifyMarket, closeOrderbook, closeMarket, claimCreatorFees
client.accounts        // getMarket, getOrder, getPosition, getOrderBooks, ...
client.events          // onTrade, onOrderPlaced, onOrderCancelled, ...
```

## Network

Currently deployed on **Solana Devnet**.

| Constant | Address |
|----------|---------|
| Program ID | `8p6MKtMGGugZMy2HGXtL3uBb11y7xuzXmbMbQgNmWVUQ` |
| USDC Mint | `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr` |

## License

ISC
