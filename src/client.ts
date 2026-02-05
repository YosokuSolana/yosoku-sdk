import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { PredMarket } from "./idl/pred_market";
import IDL from "./idl/pred_market.json";
import { PROGRAM_ID } from "./constants";
import { AccountModule } from "./accounts";
import { MarketModule } from "./instructions/market-creation";
import { MarketInfoModule } from "./instructions/market-info";
import { TradingModule } from "./instructions/trading";
import { PositionModule } from "./instructions/positions";
import { ResolutionModule } from "./instructions/resolution";
import { VoteResolutionModule } from "./instructions/vote-resolution";
import { AdminModule } from "./instructions/admin";
import { EventModule } from "./events";

export interface PredMarketClientConfig {
  /** An Anchor provider (connection + wallet) */
  provider?: AnchorProvider;
  /** A raw connection (for read-only usage) */
  connection?: Connection;
  /** Override the program ID (defaults to the canonical one) */
  programId?: PublicKey;
}

export class PredMarketClient {
  /** The underlying Anchor program instance */
  readonly program: Program<PredMarket>;
  /** The program ID */
  readonly programId: PublicKey;

  /** Market creation and multi-leg management */
  readonly markets: MarketModule;
  /** MarketInfo metadata operations */
  readonly marketInfo: MarketInfoModule;
  /** Limit orders, market orders */
  readonly trading: TradingModule;
  /** Claim, merge, cancel, redeem positions */
  readonly positions: PositionModule;
  /** UMA resolution (propose, finalize, dispute, claim, resolve-expired) */
  readonly resolution: ResolutionModule;
  /** Wallet vote resolution */
  readonly voteResolution: VoteResolutionModule;
  /** Admin operations (verify, close, migrate) */
  readonly admin: AdminModule;
  /** Account fetching and deserialization */
  readonly accounts: AccountModule;
  /** Event parsing and subscriptions */
  readonly events: EventModule;

  constructor(config: PredMarketClientConfig) {
    const programId = config.programId ?? PROGRAM_ID;
    this.programId = programId;

    let provider: AnchorProvider;
    if (config.provider) {
      provider = config.provider;
    } else if (config.connection) {
      // Read-only: create a dummy wallet
      const dummyWallet = {
        publicKey: Keypair.generate().publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      } as Wallet;
      provider = new AnchorProvider(config.connection, dummyWallet, {
        commitment: "confirmed",
      });
    } else {
      throw new Error(
        "PredMarketClient requires either a provider or a connection"
      );
    }

    this.program = new Program(IDL as any, provider) as unknown as Program<PredMarket>;

    this.markets = new MarketModule(this.program);
    this.marketInfo = new MarketInfoModule(this.program);
    this.trading = new TradingModule(this.program);
    this.positions = new PositionModule(this.program);
    this.resolution = new ResolutionModule(this.program);
    this.voteResolution = new VoteResolutionModule(this.program);
    this.admin = new AdminModule(this.program);
    this.accounts = new AccountModule(this.program);
    this.events = new EventModule(this.program);
  }

  /** Create a client from an Anchor Provider */
  static fromProvider(
    provider: AnchorProvider,
    programId?: PublicKey
  ): PredMarketClient {
    return new PredMarketClient({ provider, programId });
  }

  /** Create a read-only client (no signing capability) */
  static readOnly(
    connection: Connection,
    programId?: PublicKey
  ): PredMarketClient {
    return new PredMarketClient({ connection, programId });
  }
}
