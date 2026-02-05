import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PredMarket } from "../idl/pred_market";
import { Side, toAnchorSide } from "../types";
import { getCreatorVaultPda } from "../pda";
import { USDC_MINT } from "../constants";
import { fetchMarket } from "../accounts/market";

export class AdminModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** Toggle verification status of a market (verifier only) */
  async verifyMarket(market: PublicKey): Promise<string> {
    return this.program.methods
      .verifyMarket()
      .accounts({
        verifier: this.program.provider.publicKey!,
        market,
      })
      .rpc();
  }

  /** Close an order book after market resolution */
  async closeOrderbook(
    market: PublicKey,
    index: number,
    side: Side
  ): Promise<string> {
    const m = await fetchMarket(this.program, market);
    if (!m) throw new Error(`Market not found: ${market.toBase58()}`);
    const leg = m.legs[index];
    const obKey = side === "yes" ? leg.yesOrderBook : leg.noOrderBook;

    return this.program.methods
      .closeOrderbook(index, toAnchorSide(side))
      .accounts({
        caller: this.program.provider.publicKey!,
        market,
        orderBook: obKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Close a market's vault and account */
  async closeMarket(market: PublicKey, index: number = 0): Promise<string> {
    const m = await fetchMarket(this.program, market);
    if (!m) throw new Error(`Market not found: ${market.toBase58()}`);
    const leg = m.legs[index];
    const callerAta = getAssociatedTokenAddressSync(
      USDC_MINT, this.program.provider.publicKey!
    );

    return this.program.methods
      .closeMarket(index)
      .accounts({
        caller: this.program.provider.publicKey!,
        market,
        vault: leg.vault,
        callerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Close any program-owned account (admin only) */
  async adminCloseAccount(account: PublicKey): Promise<string> {
    return this.program.methods
      .adminCloseAccount()
      .accounts({
        admin: this.program.provider.publicKey!,
        accountToClose: account,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Claim accumulated creator fees from the creator vault */
  async claimCreatorFees(market: PublicKey): Promise<string> {
    const [creatorVault] = getCreatorVaultPda(this.program.programId, market);
    const creatorAta = getAssociatedTokenAddressSync(
      USDC_MINT, this.program.provider.publicKey!
    );

    return this.program.methods
      .claimCreatorFees()
      .accounts({
        creator: this.program.provider.publicKey!,
        market,
        creatorVault,
        creatorAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }
}
