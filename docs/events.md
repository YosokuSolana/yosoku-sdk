# Events

The `client.events` module provides real-time WebSocket subscriptions for on-chain events. Each method returns an **unsubscribe function**.

## Subscribing

```ts
// Trade executions
const unsub = client.events.onTrade((event) => {
  console.log(`${event.isBuy ? "BUY" : "SELL"} ${event.side}`);
  console.log(`Shares: ${event.shares}, USDC: ${event.usdcAmount}`);
  console.log(`Avg price: ${event.avgPrice}, Fills: ${event.fillsCount}`);
});

// Limit order placed
client.events.onOrderPlaced((event) => {
  console.log(`Order at tick ${event.price}, amount: ${event.amount}`);
});

// Order cancelled
client.events.onOrderCancelled((event) => {
  console.log(`Refunded: ${event.refundAmount}`);
});

// Fills claimed into position
client.events.onPositionClaimed((event) => {
  console.log(`Claimed ${event.claimedAmount} shares`);
});

// Position balance changed
client.events.onPositionUpdated((event) => {
  console.log(`${event.oldAmount} → ${event.newAmount} (delta: ${event.delta})`);
});

// YES + NO shares merged
client.events.onSharesMerged((event) => {
  console.log(`Merged ${event.amount} pairs, received ${event.usdcReceived} USDC`);
});
```

## Unsubscribing

```ts
const unsub = client.events.onTrade((event) => { /* ... */ });

// Later, stop listening:
unsub();
```

## Event Types

### TradeEvent

Fires on `marketBuy` / `marketSell` execution.

```ts
interface TradeEvent {
  market: PublicKey;
  user: PublicKey;
  index: number;
  side: "yes" | "no";
  isBuy: boolean;
  shares: BN;
  usdcAmount: BN;
  avgPrice: number;
  fillsCount: number;
  timestamp: Date;
}
```

### OrderPlacedEvent

Fires on `limitBid` / `limitAsk` / `coveredBid`.

```ts
interface OrderPlacedEvent {
  market: PublicKey;
  user: PublicKey;
  order: PublicKey;
  side: "yes" | "no";
  price: number;
  amount: BN;
  orderId: number;
  coveredBy: "usdc" | "shares";
  timestamp: Date;
}
```

### OrderCancelledEvent

Fires on `cancelOrder`.

```ts
interface OrderCancelledEvent {
  market: PublicKey;
  user: PublicKey;
  order: PublicKey;
  side: "yes" | "no";
  price: number;
  amount: BN;
  orderId: number;
  refundAmount: BN;
  coveredBy: "usdc" | "shares";
  timestamp: Date;
}
```

### PositionClaimedEvent

Fires on `claimPosition`.

```ts
interface PositionClaimedEvent {
  market: PublicKey;
  user: PublicKey;
  order: PublicKey;
  side: "yes" | "no";
  price: number;
  claimedAmount: BN;
  orderClosed: boolean;
  coveredBy: "usdc" | "shares";
  timestamp: Date;
}
```

### PositionUpdatedEvent

Fires when a position's share balance changes.

```ts
interface PositionUpdatedEvent {
  market: PublicKey;
  user: PublicKey;
  side: "yes" | "no";
  oldAmount: BN;
  newAmount: BN;
  delta: BN;
  timestamp: Date;
}
```

### SharesMergedEvent

Fires on `mergeShares`.

```ts
interface SharesMergedEvent {
  market: PublicKey;
  user: PublicKey;
  amount: BN;
  usdcReceived: BN;
  timestamp: Date;
}
```

## Union Type

All events are available as a discriminated union:

```ts
import { PredMarketEvent } from "yosoku";

type PredMarketEvent =
  | { type: "trade"; data: TradeEvent }
  | { type: "orderPlaced"; data: OrderPlacedEvent }
  | { type: "orderCancelled"; data: OrderCancelledEvent }
  | { type: "positionClaimed"; data: PositionClaimedEvent }
  | { type: "positionUpdated"; data: PositionUpdatedEvent }
  | { type: "sharesMerged"; data: SharesMergedEvent };
```
