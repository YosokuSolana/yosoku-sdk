import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import {
  MarketInfoTypeLabel,
  ResolverTypeInput,
  toAnchorMarketInfoType,
  toAnchorResolverType,
} from "../types";

export interface CreateMarketInfoParams {
  marketType: MarketInfoTypeLabel;
  resolverType: ResolverTypeInput;
}

export interface CreateMarketInfoResult {
  marketInfoPda: PublicKey;
  keypair: Keypair;
  signature: string;
}

export class MarketInfoModule {
  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {}

  /** Create a new MarketInfo account */
  async createMarketInfo(
    params: CreateMarketInfoParams
  ): Promise<CreateMarketInfoResult> {
    const keypair = Keypair.generate();

    const sig = await this.program.methods
      .createMarketInfo(
        toAnchorMarketInfoType(params.marketType),
        toAnchorResolverType(params.resolverType)
      )
      .accounts({
        marketInfo: keypair.publicKey,
        creator: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();

    return {
      marketInfoPda: keypair.publicKey,
      keypair,
      signature: sig,
    };
  }

  /**
   * Create a MarketInfo and populate it with text fields.
   * Convenience method that combines createMarketInfo + set text fields.
   */
  async createPopulatedMarketInfo(params: {
    marketType: MarketInfoTypeLabel;
    resolverType: ResolverTypeInput;
    marketQuestion?: string;
    description?: string;
    rules?: string;
  }): Promise<CreateMarketInfoResult> {
    const result = await this.createMarketInfo({
      marketType: params.marketType,
      resolverType: params.resolverType,
    });

    if (params.marketQuestion) {
      await this.setMarketQuestion(result.marketInfoPda, params.marketQuestion);
    }
    if (params.description) {
      await this.setDescription(result.marketInfoPda, params.description);
    }
    if (params.rules) {
      await this.setRules(result.marketInfoPda, params.rules);
    }

    return result;
  }

  /** Set the market question (replaces existing) */
  async setMarketQuestion(
    marketInfo: PublicKey,
    question: string
  ): Promise<string> {
    return this.program.methods
      .setMarketQuestion(question)
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Append to the market question */
  async appendMarketQuestion(
    marketInfo: PublicKey,
    chunk: string
  ): Promise<string> {
    return this.program.methods
      .appendMarketQuestion(chunk)
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Set the description (replaces existing) */
  async setDescription(
    marketInfo: PublicKey,
    description: string
  ): Promise<string> {
    return this.program.methods
      .setDescription(description)
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Append to the description */
  async appendDescription(
    marketInfo: PublicKey,
    chunk: string
  ): Promise<string> {
    return this.program.methods
      .appendDescription(chunk)
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Set the rules (replaces existing) */
  async setRules(marketInfo: PublicKey, rules: string): Promise<string> {
    return this.program.methods
      .setRules(rules)
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Append to the rules */
  async appendRules(marketInfo: PublicKey, chunk: string): Promise<string> {
    return this.program.methods
      .appendRules(chunk)
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /** Set the market type */
  async setMarketType(
    marketInfo: PublicKey,
    marketType: MarketInfoTypeLabel
  ): Promise<string> {
    return this.program.methods
      .setMarketType(toAnchorMarketInfoType(marketType))
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
      })
      .rpc();
  }

  /** Set the resolver type */
  async setResolverType(
    marketInfo: PublicKey,
    resolverType: ResolverTypeInput
  ): Promise<string> {
    return this.program.methods
      .setResolverType(toAnchorResolverType(resolverType))
      .accounts({
        marketInfo,
        authority: this.program.provider.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

}
