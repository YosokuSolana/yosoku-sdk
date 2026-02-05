import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Side, CoveredByType } from "../types";

export interface TradeEvent {
  market: PublicKey;
  user: PublicKey;
  index: number;
  side: Side;
  isBuy: boolean;
  shares: BN;
  usdcAmount: BN;
  avgPrice: number;
  fillsCount: number;
  timestamp: Date;
}

export interface OrderPlacedEvent {
  market: PublicKey;
  user: PublicKey;
  order: PublicKey;
  side: Side;
  price: number;
  amount: BN;
  orderId: number;
  coveredBy: CoveredByType;
  timestamp: Date;
}

export interface OrderCancelledEvent {
  market: PublicKey;
  user: PublicKey;
  order: PublicKey;
  side: Side;
  price: number;
  amount: BN;
  orderId: number;
  refundAmount: BN;
  coveredBy: CoveredByType;
  timestamp: Date;
}

export interface PositionClaimedEvent {
  market: PublicKey;
  user: PublicKey;
  order: PublicKey;
  side: Side;
  price: number;
  claimedAmount: BN;
  orderClosed: boolean;
  coveredBy: CoveredByType;
  timestamp: Date;
}

export interface PositionUpdatedEvent {
  market: PublicKey;
  user: PublicKey;
  side: Side;
  oldAmount: BN;
  newAmount: BN;
  delta: BN;
  timestamp: Date;
}

export interface SharesMergedEvent {
  market: PublicKey;
  user: PublicKey;
  amount: BN;
  usdcReceived: BN;
  timestamp: Date;
}

export type PredMarketEvent =
  | { type: "trade"; data: TradeEvent }
  | { type: "orderPlaced"; data: OrderPlacedEvent }
  | { type: "orderCancelled"; data: OrderCancelledEvent }
  | { type: "positionClaimed"; data: PositionClaimedEvent }
  | { type: "positionUpdated"; data: PositionUpdatedEvent }
  | { type: "sharesMerged"; data: SharesMergedEvent };
