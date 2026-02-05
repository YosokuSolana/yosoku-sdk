import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PredMarket } from "../idl/pred_market";
import { Side, toSideNumber } from "../types";
import { getPositionPda } from "../pda";
import { USDC_MINT } from "../constants";
import { fetchMarket } from "../accounts/market";

export interface ClaimPositionParams {
  market: PublicKey;
  index?: number;
  orderPda: PublicKey;
  orderSide: Side;
}

export interface MergeSharesParams {
  market: PublicKey;
  index?: number;
  /** Number of YES+NO pairs to merge (receives $1.00 per pair) */
  amount: BN;
}

export interface CancelOrderParams {
  market: PublicKey;
  index?: number;
  orderPda: PublicKey;
}

export interface RedeemPositionParams {
  market: PublicKey;
  index?: number;
  side: Side;
}

export class PositionModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** @internal */
  private async getLeg(market: PublicKey, index: number) {
    const m = await fetchMarket(this.program, market);
    if (!m) throw new Error(`Market not found: ${market.toBase58()}`);
    return m.legs[index];
  }

  /** Claim filled shares from a limit order */
  async claimPosition(params: ClaimPositionParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const leg = await this.getLeg(params.market, index);
    const sideNum = toSideNumber(params.orderSide);

    const [userPosition] = getPositionPda(
      this.program.programId, params.market, index, user, sideNum
    );
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);

    return this.program.methods
      .claimPosition(index)
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        yesFillLog: leg.yesFillLog,
        noFillLog: leg.noFillLog,
        userAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        order: params.orderPda,
        userPosition,
      })
      .rpc();
  }

  /** Merge equal YES + NO shares back into USDC ($1.00 per pair) */
  async mergeShares(params: MergeSharesParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const leg = await this.getLeg(params.market, index);

    const [yesPos] = getPositionPda(this.program.programId, params.market, index, user, 0);
    const [noPos] = getPositionPda(this.program.programId, params.market, index, user, 1);
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);

    return this.program.methods
      .mergeShares(index, params.amount)
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        userAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        yesPosition: yesPos,
        noPosition: noPos,
      })
      .rpc();
  }

  /** Cancel an unfilled limit order */
  async cancelOrder(params: CancelOrderParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const leg = await this.getLeg(params.market, index);

    const [yesPos] = getPositionPda(this.program.programId, params.market, index, user, 0);
    const [noPos] = getPositionPda(this.program.programId, params.market, index, user, 1);
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);

    return this.program.methods
      .cancelOrder(index)
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        yesFillLog: leg.yesFillLog,
        noFillLog: leg.noFillLog,
        userAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        order: params.orderPda,
        yesPosition: yesPos,
        noPosition: noPos,
      })
      .rpc();
  }

  /** Redeem a position after market resolution */
  async redeemPosition(params: RedeemPositionParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const leg = await this.getLeg(params.market, index);
    const sideNum = toSideNumber(params.side);

    const [positionPda] = getPositionPda(
      this.program.programId, params.market, index, user, sideNum
    );
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);

    return this.program.methods
      .redeemPosition(index)
      .accounts({
        user,
        market: params.market,
        vault: leg.vault,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        userAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        position: positionPda,
      })
      .rpc();
  }
}
