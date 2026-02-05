import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PredMarket } from "../idl/pred_market";
import {
  getResolutionProposalPda,
  getBondVaultPda,
} from "../pda";
import { USDC_MINT, PROTOCOL_USDC_ACCOUNT } from "../constants";
import { fetchMarket } from "../accounts/market";

export interface ProposeResolutionParams {
  market: PublicKey;
  index?: number;
  proposedOutcome: "yes" | "no";
}

export interface FinalizeResolutionParams {
  market: PublicKey;
  index?: number;
}

export interface ClaimDisputeWinningsParams {
  market: PublicKey;
  index?: number;
}

export class ResolutionModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** @internal */
  private async getLeg(market: PublicKey, index: number) {
    const m = await fetchMarket(this.program, market);
    if (!m) throw new Error(`Market not found: ${market.toBase58()}`);
    return { market: m, leg: m.legs[index] };
  }

  /** Propose a resolution for a market (deposits bond) */
  async proposeResolution(params: ProposeResolutionParams): Promise<string> {
    const index = params.index ?? 0;
    const user = this.program.provider.publicKey!;
    const { market, leg } = await this.getLeg(params.market, index);

    const [proposalPda] = getResolutionProposalPda(
      this.program.programId, params.market, index
    );
    const [bondVault] = getBondVaultPda(
      this.program.programId, params.market, index
    );
    const userAta = getAssociatedTokenAddressSync(USDC_MINT, user);

    const proposedOutcome = params.proposedOutcome === "yes" ? 1 : 2;

    return this.program.methods
      .proposeResolution(index, { proposedOutcome } as any)
      .accounts({
        proposer: user,
        market: params.market,
        marketInfo: market.marketInfo,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        proposerTokenAccount: userAta,
        bondVault,
        resolutionProposal: proposalPda,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Finalize a resolution after the dispute window expires */
  async finalizeResolution(
    market: PublicKey,
    index: number = 0
  ): Promise<string> {
    const { market: mkt, leg } = await this.getLeg(market, index);
    const [proposalPda] = getResolutionProposalPda(
      this.program.programId, market, index
    );
    const [bondVault] = getBondVaultPda(
      this.program.programId, market, index
    );

    // The proposer's ATA is needed to return the bond
    const proposal = await this.program.account.resolutionProposal.fetch(proposalPda);
    const proposerTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT, (proposal as any).proposer
    );

    return this.program.methods
      .finalizeResolution(index)
      .accounts({
        payer: this.program.provider.publicKey!,
        market,
        marketInfo: mkt.marketInfo,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        resolutionProposal: proposalPda,
        bondVault,
        proposerTokenAccount,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  /** Claim dispute winnings after resolution */
  async claimDisputeWinnings(
    market: PublicKey,
    index: number = 0
  ): Promise<string> {
    const { leg } = await this.getLeg(market, index);
    const [proposalPda] = getResolutionProposalPda(
      this.program.programId, market, index
    );
    const [bondVault] = getBondVaultPda(
      this.program.programId, market, index
    );

    // Fetch proposal to find the winner's token account
    const proposal = await this.program.account.resolutionProposal.fetch(proposalPda);
    const winner = (proposal as any).proposer;
    const winnerTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, winner);

    return this.program.methods
      .claimDisputeWinnings(index)
      .accounts({
        payer: this.program.provider.publicKey!,
        market,
        yesOrderBook: leg.yesOrderBook,
        noOrderBook: leg.noOrderBook,
        resolutionProposal: proposalPda,
        bondVault,
        winnerTokenAccount,
        treasuryTokenAccount: PROTOCOL_USDC_ACCOUNT,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  /** Resolve an expired market to a 50/50 split */
  async resolveExpiredMarket(
    market: PublicKey,
    index: number = 0
  ): Promise<string> {
    return this.program.methods
      .resolveExpiredMarket(index)
      .accounts({
        market,
      })
      .rpc();
  }
}
