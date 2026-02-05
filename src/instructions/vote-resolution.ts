import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import { getVoteStatePda } from "../pda";
import { fetchMarket } from "../accounts/market";

export interface VoteResolutionParams {
  market: PublicKey;
  index?: number;
  vote: "yes" | "no";
}

export class VoteResolutionModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** @internal */
  private async getLeg(market: PublicKey, index: number) {
    const m = await fetchMarket(this.program, market);
    if (!m) throw new Error(`Market not found: ${market.toBase58()}`);
    return { market: m, leg: m.legs[index] };
  }

  /** Cast a vote on market resolution (WalletVoteResolver only) */
  async voteResolution(params: VoteResolutionParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const { market, leg } = await this.getLeg(params.market, index);

    const [voteStatePda] = getVoteStatePda(
      this.program.programId, params.market, index
    );

    const vote = params.vote === "yes" ? 1 : 2;

    return this.program.methods
      .voteResolution(index, { vote } as any)
      .accounts({
        voter: user,
        market: params.market,
        marketInfo: market.marketInfo,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        voteState: voteStatePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Finalize vote resolution after deadline (anyone can call) */
  async finalizeVoteResolution(
    market: PublicKey,
    index: number = 0
  ): Promise<string> {
    const { market: mkt, leg } = await this.getLeg(market, index);

    const [voteStatePda] = getVoteStatePda(
      this.program.programId, market, index
    );

    return this.program.methods
      .finalizeVoteResolution(index)
      .accounts({
        payer: this.program.provider.publicKey!,
        market,
        marketInfo: mkt.marketInfo,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        voteState: voteStatePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }
}
