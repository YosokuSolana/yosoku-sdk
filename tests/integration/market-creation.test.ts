import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createProviderClient,
  randomMarketId,
  futureDeadline,
  initClockDrift,
} from "./helpers";
import { PredMarketClient } from "../../src";

describe("Market Creation", () => {
  let client: PredMarketClient;

  before(async () => {
    await initClockDrift();
    ({ client } = createProviderClient());
  });

  describe("createRegularMarket", () => {
    it("creates a market and returns RegularMarketResult", async () => {
      const result = await client.markets.createRegularMarket({
        name: "Test Regular Market",
        category: "sports",
        eventDeadline: futureDeadline(),
        marketQuestion: "Will team A win?",
        minOrderSize: new BN(1_000_000),
      });

      expect(result.marketPda).to.be.instanceOf(PublicKey);
      expect(result.vault).to.be.instanceOf(PublicKey);
      expect(result.creatorVault).to.be.instanceOf(PublicKey);
      expect(result.yesOrderBook).to.be.instanceOf(PublicKey);
      expect(result.noOrderBook).to.be.instanceOf(PublicKey);
      expect(result.yesFillLog).to.be.instanceOf(PublicKey);
      expect(result.noFillLog).to.be.instanceOf(PublicKey);
      expect(result.marketInfo).to.be.instanceOf(PublicKey);
      expect(result.signatures).to.be.an("array").with.length.greaterThan(0);
    });

    it("on-chain market has correct fields", async () => {
      const result = await client.markets.createRegularMarket({
        name: "Fetchable Market",
        category: "crypto",
        eventDeadline: futureDeadline(),
        marketQuestion: "Will BTC hit 100k?",
        minOrderSize: new BN(1_000_000),
      });

      const market = await client.accounts.getMarket(result.marketPda);
      expect(market).to.not.be.null;
      expect(market!.legs[0].status).to.equal("active");
      expect(market!.creator.toBase58()).to.equal(
        client.program.provider.publicKey!.toBase58()
      );
    });

    it("uses provided marketId when specified", async () => {
      const marketId = randomMarketId();
      const result = await client.markets.createRegularMarket({
        marketId,
        name: "Custom ID Market",
        category: "test",
        eventDeadline: futureDeadline(),
        marketQuestion: "Custom ID test?",
      });

      expect(result.marketId).to.equal(marketId);
    });

    it("auto-creates MarketInfo when not provided", async () => {
      const result = await client.markets.createRegularMarket({
        name: "Auto MarketInfo",
        category: "test",
        eventDeadline: futureDeadline(),
        marketQuestion: "Auto market info?",
        description: "A description",
        rules: "Some rules",
      });

      const info = await client.accounts.getMarketInfo(result.marketInfo);
      expect(info).to.not.be.null;
      expect(info!.marketQuestion).to.include("Auto market info?");
    });

    it("uses provided MarketInfo when specified", async () => {
      // Create MarketInfo first
      const infoResult = await client.marketInfo.createPopulatedMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
        marketQuestion: "Pre-created info",
      });

      const result = await client.markets.createRegularMarket({
        name: "With Pre-Created Info",
        category: "test",
        eventDeadline: futureDeadline(),
        marketQuestion: "Pre-created info",
        marketInfo: infoResult.marketInfoPda,
      });

      expect(result.marketInfo.toBase58()).to.equal(
        infoResult.marketInfoPda.toBase58()
      );
    });
  });

  describe("createMultiLegMarket", () => {
    it("creates a multi-leg market", async () => {
      const result = await client.markets.createMultiLegMarket({
        category: "politics",
        eventDeadline: futureDeadline(),
        marketQuestion: "Who will win ___?",
      });

      expect(result.marketPda).to.be.instanceOf(PublicKey);
      expect(result.creatorVault).to.be.instanceOf(PublicKey);
      expect(result.marketInfo).to.be.instanceOf(PublicKey);
      expect(result.signatures).to.be.an("array").with.length.greaterThan(0);
    });
  });

  describe("addLeg", () => {
    it("adds a leg and returns LegResult", async () => {
      const market = await client.markets.createMultiLegMarket({
        category: "politics",
        eventDeadline: futureDeadline(),
        marketQuestion: "Who will win ___?",
      });

      const leg = await client.markets.addLeg({
        marketPda: market.marketPda,
        legName: "Candidate A",
      });

      expect(leg.index).to.equal(0);
      expect(leg.name).to.equal("Candidate A");
      expect(leg.vault).to.be.instanceOf(PublicKey);
      expect(leg.yesOrderBook).to.be.instanceOf(PublicKey);
      expect(leg.noOrderBook).to.be.instanceOf(PublicKey);
      expect(leg.yesFillLog).to.be.instanceOf(PublicKey);
      expect(leg.noFillLog).to.be.instanceOf(PublicKey);
      expect(leg.signature).to.be.a("string");
    });

    it("can add multiple legs with correct indices", async () => {
      const market = await client.markets.createMultiLegMarket({
        category: "politics",
        eventDeadline: futureDeadline(),
        marketQuestion: "Who will win ___?",
      });

      const leg0 = await client.markets.addLeg({
        marketPda: market.marketPda,
        legName: "Candidate A",
      });
      const leg1 = await client.markets.addLeg({
        marketPda: market.marketPda,
        legName: "Candidate B",
      });

      expect(leg0.index).to.equal(0);
      expect(leg1.index).to.equal(1);
    });
  });
});
