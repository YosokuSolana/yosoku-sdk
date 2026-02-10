import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";
import {
  PROGRAM_ID,
  getMarketPda,
  getPositionPda,
  getOrderPda,
  getVaultPda,
  getCreatorVaultPda,
  getResolutionProposalPda,
  getBondVaultPda,
  getFillLogPda,
  getVoteStatePda,
} from "../../src";
import {
  createProviderClient,
  randomMarketId,
  futureDeadline,
  initClockDrift,
} from "./helpers";

describe("PDA Parity (SDK vs raw findProgramAddressSync)", () => {
  let marketPda: PublicKey;
  let userPubkey: PublicKey;

  before(async () => {
    await initClockDrift();
    const { client, wallet } = createProviderClient();
    userPubkey = wallet.publicKey;

    // Create a real market so we have a realistic market address
    const result = await client.markets.createRegularMarket({
      name: "PDA Parity Test",
      category: "test",
      eventDeadline: futureDeadline(),
      marketQuestion: "PDA parity check?",
      minOrderSize: new (await import("@coral-xyz/anchor")).BN(1_000_000),
    });
    marketPda = result.marketPda;
  });

  it("getMarketPda matches raw derivation", () => {
    const marketId = BigInt(99999);
    const [sdkPda] = getMarketPda(PROGRAM_ID, marketId);
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(marketId);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), buf],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getPositionPda matches raw derivation", () => {
    const index = 0;
    const side = 0; // YES
    const [sdkPda] = getPositionPda(
      PROGRAM_ID,
      marketPda,
      index,
      userPubkey,
      side
    );
    const [rawPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        marketPda.toBuffer(),
        Buffer.from([index]),
        userPubkey.toBuffer(),
        Buffer.from([side]),
      ],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getOrderPda matches raw derivation", () => {
    const index = 0;
    const price = 500;
    const seed = 42;
    const [sdkPda] = getOrderPda(
      PROGRAM_ID,
      marketPda,
      index,
      userPubkey,
      price,
      seed
    );
    const priceBuf = Buffer.alloc(2);
    priceBuf.writeUInt16LE(price);
    const seedBuf = Buffer.alloc(4);
    seedBuf.writeUInt32LE(seed);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("order"),
        marketPda.toBuffer(),
        Buffer.from([index]),
        userPubkey.toBuffer(),
        priceBuf,
        seedBuf,
      ],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getVaultPda matches raw derivation", () => {
    const index = 0;
    const [sdkPda] = getVaultPda(PROGRAM_ID, marketPda, index);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer(), Buffer.from([index])],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getCreatorVaultPda matches raw derivation", () => {
    const [sdkPda] = getCreatorVaultPda(PROGRAM_ID, marketPda);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("creator-vault"), marketPda.toBuffer()],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getResolutionProposalPda matches raw derivation", () => {
    const index = 0;
    const [sdkPda] = getResolutionProposalPda(PROGRAM_ID, marketPda, index);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("resolution_proposal"),
        marketPda.toBuffer(),
        Buffer.from([index]),
      ],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getBondVaultPda matches raw derivation", () => {
    const index = 0;
    const [sdkPda] = getBondVaultPda(PROGRAM_ID, marketPda, index);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bond_vault"), marketPda.toBuffer(), Buffer.from([index])],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getFillLogPda matches raw derivation", () => {
    const index = 0;
    const side = 1; // NO
    const [sdkPda] = getFillLogPda(PROGRAM_ID, marketPda, index, side);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("fill_log"),
        marketPda.toBuffer(),
        Buffer.from([index]),
        Buffer.from([side]),
      ],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });

  it("getVoteStatePda matches raw derivation", () => {
    const index = 0;
    const [sdkPda] = getVoteStatePda(PROGRAM_ID, marketPda, index);
    const [rawPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vote_state"),
        marketPda.toBuffer(),
        Buffer.from([index]),
      ],
      PROGRAM_ID
    );
    expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
  });
});
