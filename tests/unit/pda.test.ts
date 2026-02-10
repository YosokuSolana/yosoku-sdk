import { expect } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  getMarketPda,
  getPositionPda,
  getOrderPda,
  getVaultPda,
  getCreatorVaultPda,
  getResolutionProposalPda,
  getBondVaultPda,
  getFillLogPda,
  getVoteStatePda,
  PROGRAM_ID,
} from "../../src";

describe("PDA Derivation", () => {
  const programId = PROGRAM_ID;
  const fakeMarket = Keypair.generate().publicKey;
  const fakeUser = Keypair.generate().publicKey;

  describe("getMarketPda", () => {
    it("derives deterministic address for marketId 0", () => {
      const [pda1] = getMarketPda(programId, BigInt(0));
      const [pda2] = getMarketPda(programId, BigInt(0));
      expect(pda1.toBase58()).to.equal(pda2.toBase58());
    });

    it("derives deterministic address for large marketId", () => {
      const id = BigInt("18446744073709551615"); // u64 max
      const [pda1] = getMarketPda(programId, id);
      const [pda2] = getMarketPda(programId, id);
      expect(pda1.toBase58()).to.equal(pda2.toBase58());
    });

    it("produces different addresses for different marketIds", () => {
      const [pda1] = getMarketPda(programId, BigInt(1));
      const [pda2] = getMarketPda(programId, BigInt(2));
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("returns a valid bump value between 0 and 255", () => {
      const [, bump] = getMarketPda(programId, BigInt(42));
      expect(bump).to.be.gte(0);
      expect(bump).to.be.lte(255);
    });

    it("uses u64LE encoding for marketId seed", () => {
      const marketId = BigInt(12345);
      const [sdkPda] = getMarketPda(programId, marketId);
      const buffer = Buffer.alloc(8);
      buffer.writeBigUInt64LE(marketId);
      const [rawPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), buffer],
        programId
      );
      expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
    });
  });

  describe("getPositionPda", () => {
    it("derives different PDAs for YES vs NO side", () => {
      const [yesPda] = getPositionPda(programId, fakeMarket, 0, fakeUser, 0);
      const [noPda] = getPositionPda(programId, fakeMarket, 0, fakeUser, 1);
      expect(yesPda.toBase58()).to.not.equal(noPda.toBase58());
    });

    it("derives different PDAs for different users", () => {
      const user2 = Keypair.generate().publicKey;
      const [pda1] = getPositionPda(programId, fakeMarket, 0, fakeUser, 0);
      const [pda2] = getPositionPda(programId, fakeMarket, 0, user2, 0);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("derives different PDAs for different market indices", () => {
      const [pda1] = getPositionPda(programId, fakeMarket, 0, fakeUser, 0);
      const [pda2] = getPositionPda(programId, fakeMarket, 1, fakeUser, 0);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("is deterministic", () => {
      const [pda1] = getPositionPda(programId, fakeMarket, 0, fakeUser, 0);
      const [pda2] = getPositionPda(programId, fakeMarket, 0, fakeUser, 0);
      expect(pda1.toBase58()).to.equal(pda2.toBase58());
    });
  });

  describe("getOrderPda", () => {
    it("derives different PDAs for different prices", () => {
      const [pda1] = getOrderPda(programId, fakeMarket, 0, fakeUser, 500, 1);
      const [pda2] = getOrderPda(programId, fakeMarket, 0, fakeUser, 600, 1);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("derives different PDAs for different seeds", () => {
      const [pda1] = getOrderPda(programId, fakeMarket, 0, fakeUser, 500, 1);
      const [pda2] = getOrderPda(programId, fakeMarket, 0, fakeUser, 500, 2);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("derives different PDAs for different users at same price/seed", () => {
      const user2 = Keypair.generate().publicKey;
      const [pda1] = getOrderPda(programId, fakeMarket, 0, fakeUser, 500, 1);
      const [pda2] = getOrderPda(programId, fakeMarket, 0, user2, 500, 1);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("uses u16LE for price and u32LE for seed", () => {
      const price = 500;
      const seed = 42;
      const [sdkPda] = getOrderPda(programId, fakeMarket, 0, fakeUser, price, seed);
      const priceBuffer = Buffer.alloc(2);
      priceBuffer.writeUInt16LE(price);
      const seedBuffer = Buffer.alloc(4);
      seedBuffer.writeUInt32LE(seed);
      const [rawPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("order"),
          fakeMarket.toBuffer(),
          Buffer.from([0]),
          fakeUser.toBuffer(),
          priceBuffer,
          seedBuffer,
        ],
        programId
      );
      expect(sdkPda.toBase58()).to.equal(rawPda.toBase58());
    });
  });

  describe("getVaultPda", () => {
    it("derives different vaults for different indices", () => {
      const [pda1] = getVaultPda(programId, fakeMarket, 0);
      const [pda2] = getVaultPda(programId, fakeMarket, 1);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("is deterministic", () => {
      const [pda1] = getVaultPda(programId, fakeMarket, 0);
      const [pda2] = getVaultPda(programId, fakeMarket, 0);
      expect(pda1.toBase58()).to.equal(pda2.toBase58());
    });
  });

  describe("getCreatorVaultPda", () => {
    it("derives deterministically from market address", () => {
      const [pda1] = getCreatorVaultPda(programId, fakeMarket);
      const [pda2] = getCreatorVaultPda(programId, fakeMarket);
      expect(pda1.toBase58()).to.equal(pda2.toBase58());
    });

    it("differs for different markets", () => {
      const market2 = Keypair.generate().publicKey;
      const [pda1] = getCreatorVaultPda(programId, fakeMarket);
      const [pda2] = getCreatorVaultPda(programId, market2);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });
  });

  describe("getResolutionProposalPda", () => {
    it("derives from market + index", () => {
      const [pda1] = getResolutionProposalPda(programId, fakeMarket, 0);
      const [pda2] = getResolutionProposalPda(programId, fakeMarket, 1);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });
  });

  describe("getBondVaultPda", () => {
    it("derives from market + index", () => {
      const [pda1] = getBondVaultPda(programId, fakeMarket, 0);
      const [pda2] = getBondVaultPda(programId, fakeMarket, 1);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });
  });

  describe("getFillLogPda", () => {
    it("derives different PDAs for YES vs NO side", () => {
      const [pda1] = getFillLogPda(programId, fakeMarket, 0, 0);
      const [pda2] = getFillLogPda(programId, fakeMarket, 0, 1);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("derives different PDAs for different indices", () => {
      const [pda1] = getFillLogPda(programId, fakeMarket, 0, 0);
      const [pda2] = getFillLogPda(programId, fakeMarket, 1, 0);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });
  });

  describe("getVoteStatePda", () => {
    it("derives from market + index", () => {
      const [pda1] = getVoteStatePda(programId, fakeMarket, 0);
      const [pda2] = getVoteStatePda(programId, fakeMarket, 1);
      expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
    });

    it("is deterministic", () => {
      const [pda1] = getVoteStatePda(programId, fakeMarket, 0);
      const [pda2] = getVoteStatePda(programId, fakeMarket, 0);
      expect(pda1.toBase58()).to.equal(pda2.toBase58());
    });
  });
});
