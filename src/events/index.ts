import { Program } from "@coral-xyz/anchor";
import { PredMarket } from "../idl/pred_market";
import { parseEvent } from "./parser";
import {
  TradeEvent,
  OrderPlacedEvent,
  OrderCancelledEvent,
  PositionClaimedEvent,
  PositionUpdatedEvent,
  SharesMergedEvent,
  PredMarketEvent,
} from "./types";

export class EventModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** Subscribe to Trade events. Returns an unsubscribe function. */
  onTrade(callback: (event: TradeEvent) => void): () => void {
    const listenerId = this.program.addEventListener(
      "trade" as any,
      (event: any) => {
        const parsed = parseEvent("Trade", event);
        if (parsed && parsed.type === "trade") callback(parsed.data);
      }
    );
    return () => {
      this.program.removeEventListener(listenerId);
    };
  }

  /** Subscribe to OrderPlaced events. Returns an unsubscribe function. */
  onOrderPlaced(callback: (event: OrderPlacedEvent) => void): () => void {
    const listenerId = this.program.addEventListener(
      "orderPlaced" as any,
      (event: any) => {
        const parsed = parseEvent("OrderPlaced", event);
        if (parsed && parsed.type === "orderPlaced") callback(parsed.data);
      }
    );
    return () => {
      this.program.removeEventListener(listenerId);
    };
  }

  /** Subscribe to OrderCancelled events. Returns an unsubscribe function. */
  onOrderCancelled(
    callback: (event: OrderCancelledEvent) => void
  ): () => void {
    const listenerId = this.program.addEventListener(
      "orderCancelled" as any,
      (event: any) => {
        const parsed = parseEvent("OrderCancelled", event);
        if (parsed && parsed.type === "orderCancelled") callback(parsed.data);
      }
    );
    return () => {
      this.program.removeEventListener(listenerId);
    };
  }

  /** Subscribe to PositionClaimed events. Returns an unsubscribe function. */
  onPositionClaimed(
    callback: (event: PositionClaimedEvent) => void
  ): () => void {
    const listenerId = this.program.addEventListener(
      "positionClaimed" as any,
      (event: any) => {
        const parsed = parseEvent("PositionClaimed", event);
        if (parsed && parsed.type === "positionClaimed") callback(parsed.data);
      }
    );
    return () => {
      this.program.removeEventListener(listenerId);
    };
  }

  /** Subscribe to PositionUpdated events. Returns an unsubscribe function. */
  onPositionUpdated(
    callback: (event: PositionUpdatedEvent) => void
  ): () => void {
    const listenerId = this.program.addEventListener(
      "positionUpdated" as any,
      (event: any) => {
        const parsed = parseEvent("PositionUpdated", event);
        if (parsed && parsed.type === "positionUpdated") callback(parsed.data);
      }
    );
    return () => {
      this.program.removeEventListener(listenerId);
    };
  }

  /** Subscribe to SharesMerged events. Returns an unsubscribe function. */
  onSharesMerged(callback: (event: SharesMergedEvent) => void): () => void {
    const listenerId = this.program.addEventListener(
      "sharesMerged" as any,
      (event: any) => {
        const parsed = parseEvent("SharesMerged", event);
        if (parsed && parsed.type === "sharesMerged") callback(parsed.data);
      }
    );
    return () => {
      this.program.removeEventListener(listenerId);
    };
  }
}

export type {
  TradeEvent,
  OrderPlacedEvent,
  OrderCancelledEvent,
  PositionClaimedEvent,
  PositionUpdatedEvent,
  SharesMergedEvent,
  PredMarketEvent,
} from "./types";
