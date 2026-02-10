import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  futureDeadline,
  initClockDrift,
} from "./helpers";
import { PredMarketClient, parsePredMarketError, PredMarketErrorCode } from "../../src";

describe("MarketInfo CRUD", () => {
  let client: PredMarketClient;

  before(async () => {
    await initClockDrift();
    ({ client } = createProviderClient());
  });

  describe("createMarketInfo", () => {
    it("creates MarketInfo with UMA resolver", async () => {
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
      });

      expect(result.marketInfoPda).to.not.be.undefined;
      expect(result.signature).to.be.a("string");
    });

    it("creates MarketInfo with WalletVote resolver", async () => {
      const voters = [
        Keypair.generate().publicKey,
        Keypair.generate().publicKey,
        Keypair.generate().publicKey,
      ];
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "walletVote", voters },
      });

      expect(result.marketInfoPda).to.not.be.undefined;
    });
  });

  describe("createPopulatedMarketInfo", () => {
    it("sets question, description, rules in one call", async () => {
      const result = await client.marketInfo.createPopulatedMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
        marketQuestion: "Will it rain tomorrow?",
        description: "Weather prediction market",
        rules: "Resolved based on official weather data",
      });

      const info = await client.accounts.getMarketInfo(result.marketInfoPda);
      expect(info).to.not.be.null;
      expect(info!.marketQuestion).to.include("Will it rain tomorrow?");
      expect(info!.description).to.include("Weather prediction market");
      expect(info!.rules).to.include("Resolved based on official weather data");
    });
  });

  describe("text field operations", () => {
    it("setMarketQuestion updates the question", async () => {
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
      });

      await client.marketInfo.setMarketQuestion(
        result.marketInfoPda,
        "Updated question?"
      );

      const info = await client.accounts.getMarketInfo(result.marketInfoPda);
      expect(info!.marketQuestion).to.include("Updated question?");
    });

    it("appendMarketQuestion appends text", async () => {
      const result = await client.marketInfo.createPopulatedMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
        marketQuestion: "Base question",
      });

      await client.marketInfo.appendMarketQuestion(
        result.marketInfoPda,
        " - appended part"
      );

      const info = await client.accounts.getMarketInfo(result.marketInfoPda);
      expect(info!.marketQuestion).to.include("Base question");
      expect(info!.marketQuestion).to.include("appended part");
    });

    it("setDescription updates the description", async () => {
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
      });

      await client.marketInfo.setDescription(
        result.marketInfoPda,
        "New description"
      );

      const info = await client.accounts.getMarketInfo(result.marketInfoPda);
      expect(info!.description).to.include("New description");
    });

    it("setRules updates the rules", async () => {
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
      });

      await client.marketInfo.setRules(result.marketInfoPda, "New rules");

      const info = await client.accounts.getMarketInfo(result.marketInfoPda);
      expect(info!.rules).to.include("New rules");
    });
  });

  describe("setMarketType", () => {
    it("changes the market type", async () => {
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
      });

      await client.marketInfo.setMarketType(result.marketInfoPda, "multiLeg");

      const info = await client.accounts.getMarketInfo(result.marketInfoPda);
      expect(info!.marketType).to.equal("multiLeg");
    });
  });

  describe("setResolverType", () => {
    it("changes the resolver type", async () => {
      const voters = [Keypair.generate().publicKey];
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
      });

      await client.marketInfo.setResolverType(result.marketInfoPda, {
        type: "walletVote",
        voters,
      });

      const info = await client.accounts.getMarketInfo(result.marketInfoPda);
      expect(info!.resolverType.type).to.equal("walletVote");
    });
  });

  describe("authorization", () => {
    it("non-authority gets Unauthorized error", async () => {
      const { provider } = createProviderClient();
      const nonAuthority = await createFundedUser(provider, 10_000_000);

      // Create info as authority
      const result = await client.marketInfo.createMarketInfo({
        marketType: "regular",
        resolverType: { type: "uma" },
      });

      // Try to modify as non-authority
      try {
        await nonAuthority.client.marketInfo.setMarketQuestion(
          result.marketInfoPda,
          "Hacked question"
        );
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.Unauthorized);
      }
    });
  });

  describe("locking", () => {
    it("modification after market creation gets MarketInfoLocked", async () => {
      // Create market (locks the MarketInfo)
      const marketResult = await client.markets.createRegularMarket({
        name: "Lock Test",
        category: "test",
        eventDeadline: futureDeadline(),
        marketQuestion: "Lock test?",
      });

      // Try to modify the locked MarketInfo
      try {
        await client.marketInfo.setMarketQuestion(
          marketResult.marketInfo,
          "Should fail"
        );
        expect.fail("Should have thrown MarketInfoLocked");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.MarketInfoLocked);
      }
    });
  });
});
