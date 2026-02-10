# Positions

The `client.positions` module manages share ownership: claiming fills, merging pairs, cancelling orders, and redeeming after resolution.

## Claim Position

After a limit order matches, the filled shares sit in the order's fill log. Call `claimPosition` to move them into your position account.

```ts
await client.positions.claimPosition({
  market: marketPda,
  orderPda: orderResult.orderPda,
  orderSide: "yes",
  // index: 0,  // leg index, defaults to 0
});
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `market` | `PublicKey` | Yes | Market address |
| `orderPda` | `PublicKey` | Yes | The order to claim fills from |
| `orderSide` | `"yes" \| "no"` | Yes | Side of the order |
| `index` | `number` | No | Leg index, defaults to `0` |

Throws `NoFillsToClaim` (6022) if the order has no unclaimed fills.

## Merge Shares

If you hold both YES and NO shares, merge equal amounts back into USDC at $1.00 per pair.

```ts
await client.positions.mergeShares({
  market: marketPda,
  amount: new BN(10),  // merge 10 YES + 10 NO → receive 10 USDC
  // index: 0,
});
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `market` | `PublicKey` | Yes | Market address |
| `amount` | `BN` | Yes | Number of pairs to merge |
| `index` | `number` | No | Leg index, defaults to `0` |

Throws `InsufficientShares` (6024) if you don't have enough of either side.

## Cancel Order

Cancel an unfilled resting order. USDC is refunded to your wallet.

```ts
await client.positions.cancelOrder({
  market: marketPda,
  orderPda: orderResult.orderPda,
  // index: 0,
});
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `market` | `PublicKey` | Yes | Market address |
| `orderPda` | `PublicKey` | Yes | The order to cancel |
| `index` | `number` | No | Leg index, defaults to `0` |

Throws `OrderAlreadyFilled` (6030) if the order has been completely filled.

## Redeem Position

After a market resolves, redeem your shares for USDC.

```ts
await client.positions.redeemPosition({
  market: marketPda,
  side: "yes",
  // index: 0,
});
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `market` | `PublicKey` | Yes | Market address |
| `side` | `"yes" \| "no"` | Yes | Side to redeem |
| `index` | `number` | No | Leg index, defaults to `0` |

### Payout Rules

| Market Result | Winning Side | Losing Side | Split |
|--------------|-------------|------------|-------|
| YES wins | $1.00/share | $0.00 | - |
| NO wins | $0.00 | $1.00/share | - |
| Split | $0.50/share | $0.50/share | Both sides |

Throws `MarketNotResolved` (6045) if the market is still active.

## Typical Flow

```ts
// 1. Place order
const order = await client.trading.limitBid({
  market: marketPda, side: "yes", price: 500, usdcAmount: new BN(10_000_000),
});

// 2. After it matches, claim the shares
await client.positions.claimPosition({
  market: marketPda, orderPda: order.orderPda, orderSide: "yes",
});

// 3. Check your position
const pos = await client.accounts.getPosition(marketPda, 0, walletPubkey, "yes");
console.log(`Shares: ${pos.amount.toString()}`);

// 4. After resolution, redeem
await client.positions.redeemPosition({ market: marketPda, side: "yes" });
```
