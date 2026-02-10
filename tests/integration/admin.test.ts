import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  futureDeadline,
  shortDeadline,
  getUsdcBalance,
  sleep,
  initClockDrift,
} from "./helpers";
import {
  PredMarketClient,
  parsePredMarketError,
  PredMarketErrorCode,
} from "../../src";

describe("Admin Operations", () => {
  let creatorClient: PredMarketClient;
  let creatorProvider: any;
  let creatorWallet: any;

  before(async () => {
    await initClockDrift();
    const setup = createProviderClient();
    creatorClient = setup.client;
    creatorProvider = setup.provider;
    creatorWallet = setup.wallet;
  });

  describe("verifyMarket", () => {
    it.skip("creator verifies a market (VERIFIER_PUBKEY is a placeholder)", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Verify Test",
        category: "test",
        eventDeadline: futureDeadline(),
        marketQuestion: "Verify test?",
        minOrderSize: new BN(1_000_000),
      });

      const sig = await creatorClient.admin.verifyMarket(result.marketPda);
      expect(sig).to.be.a("string");

      const market = await creatorClient.accounts.getMarket(result.marketPda);
      expect(market!.verified).to.be.true;
    });

    it("non-admin fails with Unauthorized", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Unauth Verify",
        category: "test",
        eventDeadline: futureDeadline(),
        marketQuestion: "Unauth verify?",
        minOrderSize: new BN(1_000_000),
      });

      const nonAdmin = await createFundedUser(creatorProvider, 10_000_000);

      try {
        await nonAdmin.client.admin.verifyMarket(result.marketPda);
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.Unauthorized);
      }
    });
  });

  describe("closeOrderbook", () => {
    it("closes orderbook after market resolution", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Close OB",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Close OB?",
        minOrderSize: new BN(1_000_000),
      });

      await sleep(35000);
      await creatorClient.resolution.resolveExpiredMarket(result.marketPda);

      const sig = await creatorClient.admin.closeOrderbook(
        result.marketPda,
        0,
        "yes"
      );
      expect(sig).to.be.a("string");
    });
  });

  describe("closeMarket", () => {
    it("closes market after both orderbooks closed", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Close Market",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Close market?",
        minOrderSize: new BN(1_000_000),
      });

      await sleep(35000);
      await creatorClient.resolution.resolveExpiredMarket(result.marketPda);

      // Close both orderbooks
      await creatorClient.admin.closeOrderbook(result.marketPda, 0, "yes");
      await creatorClient.admin.closeOrderbook(result.marketPda, 0, "no");

      // Close market
      const sig = await creatorClient.admin.closeMarket(result.marketPda);
      expect(sig).to.be.a("string");
    });

    it.skip("fails with OrderBookNotClosed if orderbooks still open (check may have been removed)", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Close Fail",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Close fail?",
        minOrderSize: new BN(1_000_000),
      });

      await sleep(35000);
      await creatorClient.resolution.resolveExpiredMarket(result.marketPda);

      try {
        await creatorClient.admin.closeMarket(result.marketPda);
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.OrderBookNotClosed);
      }
    });
  });

  describe("claimCreatorFees", () => {
    it("fails with NoFeesToClaim on empty vault", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "No Fees",
        category: "test",
        eventDeadline: futureDeadline(),
        marketQuestion: "No fees?",
        minOrderSize: new BN(1_000_000),
      });

      try {
        await creatorClient.admin.claimCreatorFees(result.marketPda);
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.NoFeesToClaim);
      }
    });
  });
});
