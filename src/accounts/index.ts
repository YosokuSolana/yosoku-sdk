import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import {
  MarketAccount,
  OrderAccount,
  PositionAccount,
  OrderBookView,
  FillLogView,
  MarketInfoAccount,
  ResolutionProposalAccount,
  VoteStateAccount,
  Side,
} from "../types";
import { getMarketPda } from "../pda";
import { fetchMarket, fetchAllMarkets } from "./market";
import { fetchOrder, fetchUserOrders } from "./order";
import { fetchPosition, fetchUserPositions } from "./position";
import { fetchOrderBook } from "./orderbook";
import { fetchFillLog } from "./filllog";
import { fetchMarketInfo } from "./marketinfo";
import { fetchResolutionProposal, fetchVoteState } from "./resolution";

export class AccountModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** Fetch and deserialize a Market account */
  async getMarket(address: PublicKey): Promise<MarketAccount | null> {
    return fetchMarket(this.program, address);
  }

  /** Fetch a Market by its numeric ID */
  async getMarketById(marketId: bigint): Promise<MarketAccount | null> {
    const [pda] = getMarketPda(this.program.programId, marketId);
    return fetchMarket(this.program, pda);
  }

  /** Fetch all markets, with optional filters */
  async getMarkets(filters?: {
    creator?: PublicKey;
    verified?: boolean;
  }): Promise<MarketAccount[]> {
    return fetchAllMarkets(this.program, filters);
  }

  /** Fetch and deserialize an Order account */
  async getOrder(address: PublicKey): Promise<OrderAccount | null> {
    return fetchOrder(this.program, address);
  }

  /** Fetch all orders for a user in a specific market */
  async getUserOrders(
    market: PublicKey,
    user: PublicKey
  ): Promise<OrderAccount[]> {
    return fetchUserOrders(this.program, market, user);
  }

  /** Fetch a Position account for a specific user/side */
  async getPosition(
    market: PublicKey,
    index: number,
    user: PublicKey,
    side: Side
  ): Promise<PositionAccount | null> {
    return fetchPosition(this.program, market, index, user, side);
  }

  /** Fetch all positions for a user in a specific market */
  async getUserPositions(
    market: PublicKey,
    user: PublicKey
  ): Promise<PositionAccount[]> {
    return fetchUserPositions(this.program, market, user);
  }

  /** Fetch an OrderBook as aggregated price levels */
  async getOrderBook(address: PublicKey): Promise<OrderBookView | null> {
    return fetchOrderBook(this.program.provider.connection, address);
  }

  /** Fetch both YES and NO order books for a market leg */
  async getOrderBooks(
    market: PublicKey,
    index: number = 0
  ): Promise<{ yes: OrderBookView | null; no: OrderBookView | null }> {
    const marketAccount = await this.getMarket(market);
    if (!marketAccount || !marketAccount.legs[index]) {
      return { yes: null, no: null };
    }
    const leg = marketAccount.legs[index];
    const [yes, no] = await Promise.all([
      this.getOrderBook(leg.yesOrderBook),
      this.getOrderBook(leg.noOrderBook),
    ]);
    return { yes, no };
  }

  /** Fetch a FillLog */
  async getFillLog(address: PublicKey): Promise<FillLogView | null> {
    return fetchFillLog(this.program.provider.connection, address);
  }

  /** Fetch a MarketInfo account */
  async getMarketInfo(address: PublicKey): Promise<MarketInfoAccount | null> {
    return fetchMarketInfo(this.program, address);
  }

  /** Fetch a ResolutionProposal for a market leg */
  async getResolutionProposal(
    market: PublicKey,
    index: number = 0
  ): Promise<ResolutionProposalAccount | null> {
    return fetchResolutionProposal(this.program, market, index);
  }

  /** Fetch a VoteState for a market leg */
  async getVoteState(
    market: PublicKey,
    index: number = 0
  ): Promise<VoteStateAccount | null> {
    return fetchVoteState(this.program, market, index);
  }
}
