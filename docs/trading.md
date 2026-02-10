# Trading

The `client.trading` module handles all order placement and execution.

## Price System

Prices are expressed as **ticks** from 1 to 999. Each tick = $0.001 per share. YES + NO always equals 1000 ticks ($1.00).

| Tick | Dollar | Cost per share (USDC base units) |
|------|--------|----------------------------------|
| 100  | $0.10  | 100,000                          |
| 500  | $0.50  | 500,000                          |
| 900  | $0.90  | 900,000                          |

A YES share at tick 400 ($0.40) implies the NO side is at tick 600 ($0.60).

## Limit Bid

Place a resting buy order backed by USDC.

```ts
const result = await client.trading.limitBid({
  market: marketPda,
  side: "yes",                       // "yes" or "no"
  price: 400,                        // ticks (1-999)
  usdcAmount: new BN(20_000_000),    // 20 USDC
});
// result: { orderPda: PublicKey, signature: string }
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `market` | `PublicKey` | Yes | Market address |
| `side` | `"yes" \| "no"` | Yes | Side to buy |
| `price` | `number` | Yes | Price in ticks (1-999) |
| `usdcAmount` | `BN` | Yes | USDC to spend (6 decimals) |
| `index` | `number` | No | Leg index, defaults to `0` |
| `seed` | `number` | No | Order uniqueness seed, auto-generated if omitted |
| `matchExisting` | `boolean` | No | Try to fill against resting orders. Default: `true` |
| `referralAccount` | `PublicKey` | No | Referral USDC account for fee sharing |

## Limit Ask

Sell shares you already own at a specific price.

```ts
const result = await client.trading.limitAsk({
  market: marketPda,
  side: "yes",
  price: 600,              // price you want per share
  shares: new BN(20),      // number of shares to sell
});
```

Parameters are the same as `limitBid` except `shares: BN` replaces `usdcAmount`.

## Covered Bid

Place a bid backed by either USDC or existing shares on the opposite side.

```ts
// USDC-covered
const result = await client.trading.coveredBid({
  market: marketPda,
  side: "yes",
  price: 500,
  shares: new BN(10),
  coveredBy: "usdc",
});

// Shares-covered (uses opposite-side position as collateral)
const result = await client.trading.coveredBid({
  market: marketPda,
  side: "yes",
  price: 500,
  shares: new BN(10),
  coveredBy: "shares",
});
```

## Market Buy

Execute immediately against resting orders on the opposite side. Includes slippage protection.

```ts
const sig = await client.trading.marketBuy({
  market: marketPda,
  side: "yes",
  maxUsdc: new BN(10_000_000),   // max USDC to spend
  minShares: new BN(15),          // fail if can't get at least this many
});
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `market` | `PublicKey` | Yes | Market address |
| `side` | `"yes" \| "no"` | Yes | Side to buy |
| `maxUsdc` | `BN` | Yes | Maximum USDC to spend |
| `minShares` | `BN` | Yes | Minimum shares to receive (slippage protection) |
| `index` | `number` | No | Leg index, defaults to `0` |
| `referralAccount` | `PublicKey` | No | Referral USDC account |

Throws `SlippageExceeded` (6019) if `minShares` can't be met. Throws `NoLiquidity` (6020) if the order book is empty.

## Market Sell

Sell shares immediately against resting bids.

```ts
const sig = await client.trading.marketSell({
  market: marketPda,
  side: "yes",
  shares: new BN(20),             // shares to sell
  minUsdc: new BN(8_000_000),     // fail if can't get at least this much USDC
});
```

Throws `InsufficientShares` (6024) if you don't have enough shares.

## Matching Behavior

When `matchExisting` is `true` (the default), limit orders will immediately fill against any compatible resting orders before placing the remainder on the book.

Set `matchExisting: false` to place a purely resting order that won't fill immediately.

```ts
// Resting-only order
await client.trading.limitBid({
  market: marketPda,
  side: "yes",
  price: 400,
  usdcAmount: new BN(10_000_000),
  matchExisting: false,
});
```

## Fees

The protocol charges fees on trades:
- **Creator fee**: 50 bps (0.50%)
- **Protocol fee**: 75 bps (0.75%)
- **Referral fee**: 25 bps (0.25%) — only if a `referralAccount` is provided

Fees are deducted automatically. No action needed from the trader.
