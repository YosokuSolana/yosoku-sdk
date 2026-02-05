import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PredMarket } from "../idl/pred_market";
import {
  RegularMarketResult,
  MultiLegMarketResult,
  LegResult,
  ResolverTypeInput,
  MarketInfoTypeLabel,
} from "../types";
import { getMarketPda, getCreatorVaultPda, getVaultPda } from "../pda";
import { USDC_MINT, ORDER_BOOK_SIZE, FILL_LOG_SIZE } from "../constants";
import { MarketInfoModule } from "./market-info";

export interface CreateRegularMarketParams {
  marketId?: bigint;
  name: string;
  category: string;
  imageUri?: string;
  minOrderSize?: BN;
  eventDeadline: Date | number;
  marketQuestion: string;
  description?: string;
  rules?: string;
  resolverType?: ResolverTypeInput;
  /** Pre-created MarketInfo. If omitted, one will be created automatically. */
  marketInfo?: PublicKey;
}

export interface CreateMultiLegMarketParams {
  marketId?: bigint;
  category: string;
  imageUri?: string;
  minOrderSize?: BN;
  eventDeadline: Date | number;
  /** Must contain exactly one "___" placeholder */
  marketQuestion: string;
  description?: string;
  rules?: string;
  resolverType?: ResolverTypeInput;
  marketInfo?: PublicKey;
}

export interface AddLegParams {
  marketPda: PublicKey;
  legName: string;
}

/** @internal */
function toUnixTimestamp(deadline: Date | number): BN {
  const ts =
    typeof deadline === "number"
      ? deadline
      : Math.floor(deadline.getTime() / 1000);
  return new BN(ts);
}

export class MarketModule {
  private readonly marketInfoModule: MarketInfoModule;

  /** @internal */
  constructor(private readonly program: Program<PredMarket>) {
    this.marketInfoModule = new MarketInfoModule(program);
  }

  /** Create a regular (single-leg) market with full automation */
  async createRegularMarket(
    params: CreateRegularMarketParams
  ): Promise<RegularMarketResult> {
    const provider = this.program
      .provider as anchor.AnchorProvider;
    const marketId =
      params.marketId ?? BigInt(Math.floor(Math.random() * 1_000_000_000));
    const [marketPda] = getMarketPda(this.program.programId, marketId);

    const yesOrderBook = Keypair.generate();
    const noOrderBook = Keypair.generate();
    const yesFillLog = Keypair.generate();
    const noFillLog = Keypair.generate();

    const [vault] = getVaultPda(this.program.programId, marketPda, 0);
    const [creatorVault] = getCreatorVaultPda(this.program.programId, marketPda);

    // Create or use provided MarketInfo
    let marketInfoPk = params.marketInfo;
    const signatures: string[] = [];

    if (!marketInfoPk) {
      const miResult = await this.marketInfoModule.createPopulatedMarketInfo({
        marketType: "regular",
        resolverType: params.resolverType ?? { type: "uma" },
        eventDeadline: toUnixTimestamp(params.eventDeadline),
        marketQuestion: params.marketQuestion,
        description: params.description,
        rules: params.rules,
      });
      marketInfoPk = miResult.marketInfoPda;
      signatures.push(miResult.signature);
    }

    // Pre-create large accounts
    const obRent =
      await provider.connection.getMinimumBalanceForRentExemption(
        ORDER_BOOK_SIZE
      );
    const flRent =
      await provider.connection.getMinimumBalanceForRentExemption(
        FILL_LOG_SIZE
      );

    const tx1 = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: yesOrderBook.publicKey,
        lamports: obRent,
        space: ORDER_BOOK_SIZE,
        programId: this.program.programId,
      }),
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: noOrderBook.publicKey,
        lamports: obRent,
        space: ORDER_BOOK_SIZE,
        programId: this.program.programId,
      })
    );
    signatures.push(
      await provider.sendAndConfirm(tx1, [yesOrderBook, noOrderBook])
    );

    const tx2 = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: yesFillLog.publicKey,
        lamports: flRent,
        space: FILL_LOG_SIZE,
        programId: this.program.programId,
      }),
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: noFillLog.publicKey,
        lamports: flRent,
        space: FILL_LOG_SIZE,
        programId: this.program.programId,
      })
    );
    signatures.push(
      await provider.sendAndConfirm(tx2, [yesFillLog, noFillLog])
    );

    const marketData = {
      name: params.name,
      yesOrderBook: yesOrderBook.publicKey,
      noOrderBook: noOrderBook.publicKey,
      yesFillLog: yesFillLog.publicKey,
      noFillLog: noFillLog.publicKey,
      vault,
      status: { active: {} },
      winningSide: { none: {} },
      resolvingState: { notStarted: {} },
      sharesOutstanding: new BN(0),
      totalVolume: new BN(0),
    };

    const createParams = {
      marketId: new BN(marketId.toString()),
      category: params.category,
      imageUri: params.imageUri ?? "",
      minOrderSize: params.minOrderSize ?? new BN(1_000_000),
      eventDeadline: toUnixTimestamp(params.eventDeadline),
      marketType: { regular: [marketData] },
    };

    const sig = await this.program.methods
      .createRegularMarket(createParams as any)
      .accounts({
        creator: provider.wallet.publicKey,
        market: marketPda,
        marketInfo: marketInfoPk,
        yesOrderBook: yesOrderBook.publicKey,
        noOrderBook: noOrderBook.publicKey,
        yesFillLog: yesFillLog.publicKey,
        noFillLog: noFillLog.publicKey,
        vault,
        creatorVault,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    signatures.push(sig);

    return {
      marketId,
      marketPda,
      vault,
      creatorVault,
      yesOrderBook: yesOrderBook.publicKey,
      noOrderBook: noOrderBook.publicKey,
      yesFillLog: yesFillLog.publicKey,
      noFillLog: noFillLog.publicKey,
      marketInfo: marketInfoPk,
      signatures,
    };
  }

  /** Create a multi-leg market (starts with zero legs) */
  async createMultiLegMarket(
    params: CreateMultiLegMarketParams
  ): Promise<MultiLegMarketResult> {
    const provider = this.program
      .provider as anchor.AnchorProvider;
    const marketId =
      params.marketId ?? BigInt(Math.floor(Math.random() * 1_000_000_000));
    const [marketPda] = getMarketPda(this.program.programId, marketId);
    const [creatorVault] = getCreatorVaultPda(this.program.programId, marketPda);

    const signatures: string[] = [];

    let marketInfoPk = params.marketInfo;
    if (!marketInfoPk) {
      const miResult = await this.marketInfoModule.createPopulatedMarketInfo({
        marketType: "multiLeg",
        resolverType: params.resolverType ?? { type: "uma" },
        eventDeadline: toUnixTimestamp(params.eventDeadline),
        marketQuestion: params.marketQuestion,
        description: params.description,
        rules: params.rules,
      });
      marketInfoPk = miResult.marketInfoPda;
      signatures.push(miResult.signature);
    }

    const createParams = {
      marketId: new BN(marketId.toString()),
      category: params.category,
      imageUri: params.imageUri ?? "",
      minOrderSize: params.minOrderSize ?? new BN(1_000_000),
      eventDeadline: toUnixTimestamp(params.eventDeadline),
      marketType: { multiLeg: [[]] },
    };

    const sig = await this.program.methods
      .createMultilegMarket(createParams as any)
      .accounts({
        creator: provider.wallet.publicKey,
        market: marketPda,
        marketInfo: marketInfoPk,
        creatorVault,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    signatures.push(sig);

    return {
      marketId,
      marketPda,
      creatorVault,
      marketInfo: marketInfoPk,
      signatures,
    };
  }

  /** Add a leg to an existing multi-leg market */
  async addLeg(params: AddLegParams): Promise<LegResult> {
    const provider = this.program
      .provider as anchor.AnchorProvider;

    // Fetch the market to determine next leg index
    const marketAccount = await this.program.account.market.fetch(
      params.marketPda
    );
    const mt = marketAccount.marketType as any;
    const existingLegs = mt.multiLeg
      ? Array.isArray(mt.multiLeg)
        ? mt.multiLeg
        : mt.multiLeg["0"] ?? []
      : [];
    const index = existingLegs.length;

    const yesOrderBook = Keypair.generate();
    const noOrderBook = Keypair.generate();
    const yesFillLog = Keypair.generate();
    const noFillLog = Keypair.generate();
    const [vault] = getVaultPda(this.program.programId, params.marketPda, index);

    const obRent =
      await provider.connection.getMinimumBalanceForRentExemption(
        ORDER_BOOK_SIZE
      );
    const flRent =
      await provider.connection.getMinimumBalanceForRentExemption(
        FILL_LOG_SIZE
      );

    const tx1 = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: yesOrderBook.publicKey,
        lamports: obRent,
        space: ORDER_BOOK_SIZE,
        programId: this.program.programId,
      }),
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: noOrderBook.publicKey,
        lamports: obRent,
        space: ORDER_BOOK_SIZE,
        programId: this.program.programId,
      })
    );
    await provider.sendAndConfirm(tx1, [yesOrderBook, noOrderBook]);

    const tx2 = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: yesFillLog.publicKey,
        lamports: flRent,
        space: FILL_LOG_SIZE,
        programId: this.program.programId,
      }),
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: noFillLog.publicKey,
        lamports: flRent,
        space: FILL_LOG_SIZE,
        programId: this.program.programId,
      })
    );
    await provider.sendAndConfirm(tx2, [yesFillLog, noFillLog]);

    const marketData = {
      name: params.legName,
      yesOrderBook: yesOrderBook.publicKey,
      noOrderBook: noOrderBook.publicKey,
      yesFillLog: yesFillLog.publicKey,
      noFillLog: noFillLog.publicKey,
      vault,
      status: { active: {} },
      winningSide: { none: {} },
      resolvingState: { notStarted: {} },
      sharesOutstanding: new BN(0),
      totalVolume: new BN(0),
    };

    const sig = await this.program.methods
      .addOrderbookSetToMarket({ index, marketData } as any)
      .accounts({
        payer: provider.wallet.publicKey,
        market: params.marketPda,
        yesOrderBook: yesOrderBook.publicKey,
        noOrderBook: noOrderBook.publicKey,
        yesFillLog: yesFillLog.publicKey,
        noFillLog: noFillLog.publicKey,
        vault,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return {
      index,
      name: params.legName,
      vault,
      yesOrderBook: yesOrderBook.publicKey,
      noOrderBook: noOrderBook.publicKey,
      yesFillLog: yesFillLog.publicKey,
      noFillLog: noFillLog.publicKey,
      signature: sig,
    };
  }
}
