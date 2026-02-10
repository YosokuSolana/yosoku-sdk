import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PredMarket } from "../idl/pred_market";
import {
  Side,
  OrderResult,
  MarketAccount,
  toAnchorSide,
  toSideNumber,
  toAnchorCoveredBy,
  CoveredByType,
} from "../types";
import { getOrderPda, getPositionPda, getCreatorVaultPda } from "../pda";
import { USDC_MINT, PROTOCOL_USDC_ACCOUNT } from "../constants";
import { fetchMarket } from "../accounts/market";

export interface LimitBidParams {
  market: PublicKey;
  index?: number;
  side: Side;
  /** Price in ticks (1-999). E.g., 500 = $0.50 per share. */
  price: number;
  /** USDC amount to spend */
  usdcAmount: BN;
  seed?: number;
  /** Whether to match against existing resting orders (default: true) */
  matchExisting?: boolean;
  referralAccount?: PublicKey;
}

export interface LimitAskParams {
  market: PublicKey;
  index?: number;
  /** The side you are selling */
  side: Side;
  /** The price you want to receive per share (1-999) */
  price: number;
  /** Number of shares to sell */
  shares: BN;
  seed?: number;
  /** Whether to match against existing resting orders (default: true) */
  matchExisting?: boolean;
  referralAccount?: PublicKey;
}

export interface CoveredBidParams {
  market: PublicKey;
  index?: number;
  side: Side;
  price: number;
  shares: BN;
  seed?: number;
  coveredBy: CoveredByType;
  /** Whether to match against existing resting orders (default: true) */
  matchExisting?: boolean;
  referralAccount?: PublicKey;
}

export interface MarketBuyParams {
  market: PublicKey;
  index?: number;
  side: Side;
  /** Maximum USDC to spend */
  maxUsdc: BN;
  /** Minimum shares to receive (slippage protection) */
  minShares: BN;
  referralAccount?: PublicKey;
}

export interface MarketSellParams {
  market: PublicKey;
  index?: number;
  side: Side;
  /** Number of shares to sell */
  shares: BN;
  /** Minimum USDC to receive (slippage protection) */
  minUsdc: BN;
  referralAccount?: PublicKey;
}

/** @internal */
function generateSeed(): number {
  return Math.floor(Math.random() * 2_000_000_000);
}

export class TradingModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** @internal */
  private async resolveMarket(address: PublicKey): Promise<MarketAccount> {
    const m = await fetchMarket(this.program, address);
    if (!m) throw new Error(`Market not found: ${address.toBase58()}`);
    return m;
  }

  /** Place a limit bid (USDC-backed buy order) */
  async limitBid(params: LimitBidParams): Promise<OrderResult> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const seed = params.seed ?? generateSeed();
    const market = await this.resolveMarket(params.market);
    const leg = market.legs[index];

    const [orderPda] = getOrderPda(
      this.program.programId, params.market, index, user, params.price, seed
    );
    const [yesPos] = getPositionPda(this.program.programId, params.market, index, user, 0);
    const [noPos] = getPositionPda(this.program.programId, params.market, index, user, 1);
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);
    const [creatorVault] = getCreatorVaultPda(this.program.programId, params.market);

    const sig = await this.program.methods
      .limitBid(
        index,
        toAnchorSide(params.side),
        params.price,
        params.usdcAmount,
        seed,
        params.matchExisting ?? true
      )
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        creatorVault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        yesFillLog: leg.yesFillLog,
        noFillLog: leg.noFillLog,
        userAta,
        protocolTreasury: PROTOCOL_USDC_ACCOUNT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        order: orderPda,
        yesPosition: yesPos,
        noPosition: noPos,
        referralAccount: params.referralAccount ?? SystemProgram.programId,
      })
      .rpc();

    return { orderPda, signature: sig };
  }

  /** Place a limit ask (sell shares at a specific price) */
  async limitAsk(params: LimitAskParams): Promise<OrderResult> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const seed = params.seed ?? generateSeed();
    const market = await this.resolveMarket(params.market);
    const leg = market.legs[index];

    // The program's seeds constraint uses the price arg as-is;
    // complement conversion happens inside the function body.
    const [orderPda] = getOrderPda(
      this.program.programId, params.market, index, user, params.price, seed
    );
    const [yesPos] = getPositionPda(this.program.programId, params.market, index, user, 0);
    const [noPos] = getPositionPda(this.program.programId, params.market, index, user, 1);
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);
    const [creatorVault] = getCreatorVaultPda(this.program.programId, params.market);

    const sig = await this.program.methods
      .limitAsk(
        index,
        toAnchorSide(params.side),
        params.price,
        params.shares,
        seed,
        params.matchExisting ?? true
      )
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        creatorVault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        yesFillLog: leg.yesFillLog,
        noFillLog: leg.noFillLog,
        userAta,
        protocolTreasury: PROTOCOL_USDC_ACCOUNT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        order: orderPda,
        yesPosition: yesPos,
        noPosition: noPos,
        referralAccount: params.referralAccount ?? SystemProgram.programId,
      })
      .rpc();

    return { orderPda, signature: sig };
  }

  /** Place a covered bid (backed by USDC or existing shares) */
  async coveredBid(params: CoveredBidParams): Promise<OrderResult> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const seed = params.seed ?? generateSeed();
    const market = await this.resolveMarket(params.market);
    const leg = market.legs[index];

    const [orderPda] = getOrderPda(
      this.program.programId, params.market, index, user, params.price, seed
    );
    const [yesPos] = getPositionPda(this.program.programId, params.market, index, user, 0);
    const [noPos] = getPositionPda(this.program.programId, params.market, index, user, 1);
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);
    const [creatorVault] = getCreatorVaultPda(this.program.programId, params.market);

    const sig = await this.program.methods
      .coveredBid(
        index,
        toAnchorSide(params.side),
        params.price,
        params.shares,
        seed,
        toAnchorCoveredBy(params.coveredBy),
        params.matchExisting ?? true
      )
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        creatorVault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        yesFillLog: leg.yesFillLog,
        noFillLog: leg.noFillLog,
        userAta,
        protocolTreasury: PROTOCOL_USDC_ACCOUNT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        order: orderPda,
        yesPosition: yesPos,
        noPosition: noPos,
        referralAccount: params.referralAccount ?? SystemProgram.programId,
      })
      .rpc();

    return { orderPda, signature: sig };
  }

  /** Execute a market buy (immediate execution) */
  async marketBuy(params: MarketBuyParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const market = await this.resolveMarket(params.market);
    const leg = market.legs[index];

    const sideNum = toSideNumber(params.side);
    const [userPosition] = getPositionPda(
      this.program.programId, params.market, index, user, sideNum
    );
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);
    const [creatorVault] = getCreatorVaultPda(this.program.programId, params.market);

    return this.program.methods
      .marketBuy(index, toAnchorSide(params.side), params.maxUsdc, params.minShares)
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        yesFillLog: leg.yesFillLog,
        noFillLog: leg.noFillLog,
        userAta,
        creatorVault,
        protocolTreasury: PROTOCOL_USDC_ACCOUNT,
        referralAccount: params.referralAccount ?? SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        userPosition,
      })
      .rpc();
  }

  /** Execute a market sell (immediate execution) */
  async marketSell(params: MarketSellParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const market = await this.resolveMarket(params.market);
    const leg = market.legs[index];

    const sideNum = toSideNumber(params.side);
    const [userPosition] = getPositionPda(
      this.program.programId, params.market, index, user, sideNum
    );
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);
    const [creatorVault] = getCreatorVaultPda(this.program.programId, params.market);

    return this.program.methods
      .marketSell(index, toAnchorSide(params.side), params.shares, params.minUsdc)
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        yesFillLog: leg.yesFillLog,
        noFillLog: leg.noFillLog,
        userAta,
        creatorVault,
        protocolTreasury: PROTOCOL_USDC_ACCOUNT,
        referralAccount: params.referralAccount ?? SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        userPosition,
      })
      .rpc();
  }
}
