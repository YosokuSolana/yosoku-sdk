import { Program } from "@coral-xyz/anchor";
import { PredMarket } from "../idl/pred_market";
import { fromAnchorSide, fromAnchorCoveredBy } from "../types";
import {
  TradeEvent,
  OrderPlacedEvent,
  OrderCancelledEvent,
  PositionClaimedEvent,
  PositionUpdatedEvent,
  SharesMergedEvent,
  PredMarketEvent,
} from "./types";

/** @internal */
function toDate(ts: any): Date {
  return new Date(Number(ts.toString()) * 1000);
}

/** @internal */
function parseTradeEvent(raw: any): TradeEvent {
  return {
    market: raw.market,
    user: raw.user,
    index: raw.index,
    side: fromAnchorSide(raw.side),
    isBuy: raw.isBuy,
    shares: raw.shares,
    usdcAmount: raw.usdcAmount,
    avgPrice: raw.avgPrice,
    fillsCount: raw.fillsCount,
    timestamp: toDate(raw.timestamp),
  };
}

/** @internal */
function parseOrderPlacedEvent(raw: any): OrderPlacedEvent {
  return {
    market: raw.market,
    user: raw.user,
    order: raw.order,
    side: fromAnchorSide(raw.side),
    price: raw.price,
    amount: raw.amount,
    orderId: raw.orderId,
    coveredBy: fromAnchorCoveredBy(raw.coveredBy),
    timestamp: toDate(raw.timestamp),
  };
}

/** @internal */
function parseOrderCancelledEvent(raw: any): OrderCancelledEvent {
  return {
    market: raw.market,
    user: raw.user,
    order: raw.order,
    side: fromAnchorSide(raw.side),
    price: raw.price,
    amount: raw.amount,
    orderId: raw.orderId,
    refundAmount: raw.refundAmount,
    coveredBy: fromAnchorCoveredBy(raw.coveredBy),
    timestamp: toDate(raw.timestamp),
  };
}

/** @internal */
function parsePositionClaimedEvent(raw: any): PositionClaimedEvent {
  return {
    market: raw.market,
    user: raw.user,
    order: raw.order,
    side: fromAnchorSide(raw.side),
    price: raw.price,
    claimedAmount: raw.claimedAmount,
    orderClosed: raw.orderClosed,
    coveredBy: fromAnchorCoveredBy(raw.coveredBy),
    timestamp: toDate(raw.timestamp),
  };
}

/** @internal */
function parsePositionUpdatedEvent(raw: any): PositionUpdatedEvent {
  return {
    market: raw.market,
    user: raw.user,
    side: fromAnchorSide(raw.side),
    oldAmount: raw.oldAmount,
    newAmount: raw.newAmount,
    delta: raw.delta,
    timestamp: toDate(raw.timestamp),
  };
}

/** @internal */
function parseSharesMergedEvent(raw: any): SharesMergedEvent {
  return {
    market: raw.market,
    user: raw.user,
    amount: raw.amount,
    usdcReceived: raw.usdcReceived,
    timestamp: toDate(raw.timestamp),
  };
}

/** @internal */
const EVENT_PARSERS: Record<string, (raw: any) => PredMarketEvent> = {
  TradeEvent: (raw) => ({ type: "trade", data: parseTradeEvent(raw) }),
  Trade: (raw) => ({ type: "trade", data: parseTradeEvent(raw) }),
  OrderPlacedEvent: (raw) => ({ type: "orderPlaced", data: parseOrderPlacedEvent(raw) }),
  OrderPlaced: (raw) => ({ type: "orderPlaced", data: parseOrderPlacedEvent(raw) }),
  OrderCancelledEvent: (raw) => ({ type: "orderCancelled", data: parseOrderCancelledEvent(raw) }),
  OrderCancelled: (raw) => ({ type: "orderCancelled", data: parseOrderCancelledEvent(raw) }),
  PositionClaimedEvent: (raw) => ({ type: "positionClaimed", data: parsePositionClaimedEvent(raw) }),
  PositionClaimed: (raw) => ({ type: "positionClaimed", data: parsePositionClaimedEvent(raw) }),
  PositionUpdatedEvent: (raw) => ({ type: "positionUpdated", data: parsePositionUpdatedEvent(raw) }),
  PositionUpdated: (raw) => ({ type: "positionUpdated", data: parsePositionUpdatedEvent(raw) }),
  SharesMergedEvent: (raw) => ({ type: "sharesMerged", data: parseSharesMergedEvent(raw) }),
  SharesMerged: (raw) => ({ type: "sharesMerged", data: parseSharesMergedEvent(raw) }),
};

/** Parse a raw Anchor event into a typed SDK event */
export function parseEvent(
  eventName: string,
  data: any
): PredMarketEvent | null {
  const parser = EVENT_PARSERS[eventName];
  if (!parser) return null;
  return parser(data);
}
