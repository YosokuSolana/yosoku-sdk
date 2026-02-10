import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  futureDeadline,
  initClockDrift,
} from "./helpers";
import { PredMarketClient } from "../../src";

describe("Account Fetchers", () => {
  let client: PredMarketClient;
  let provider: any;
  let marketPda: PublicKey;
  let yesOrderBook: PublicKey;
  let noOrderBook: PublicKey;
  let marketInfo: PublicKey;
  let marketId: bigint;

  before(async () => {
    await initClockDrift();
    const setup = createProviderClient();
    client = setup.client;
    provider = setup.provider;

    const result = await client.markets.createRegularMarket({
      name: "Account Fetcher Test",
      category: "test",
      eventDeadline: futureDeadline(24),
      marketQuestion: "Account fetcher?",
      description: "Testing account fetchers",
      rules: "Standard rules apply",
      minOrderSize: new BN(1_000_000),
    });

    marketPda = result.marketPda;
    yesOrderBook = result.yesOrderBook;
    noOrderBook = result.noOrderBook;
    marketInfo = result.marketInfo;
    marketId = result.marketId;
  });

  describe("getMarket", () => {
    it("returns MarketAccount with correct fields", async () => {
      const market = await client.accounts.getMarket(marketPda);
      expect(market).to.not.be.null;
      expect(market!.legs[0].status).to.equal("active");
      expect(market!.creator).to.be.instanceOf(PublicKey);
    });

    it("returns null for non-existent market", async () => {
      const fakePda = Keypair.generate().publicKey;
      const market = await client.accounts.getMarket(fakePda);
      expect(market).to.be.null;
    });
  });

  describe("getMarketById", () => {
    it("fetches market by ID", async () => {
      const market = await client.accounts.getMarketById(marketId);
      expect(market).to.not.be.null;
      expect(market!.legs[0].status).to.equal("active");
    });
  });

  describe("getMarkets", () => {
    it("filters by creator", async () => {
      const markets = await client.accounts.getMarkets({
        creator: client.program.provider.publicKey!,
      });
      expect(markets).to.be.an("array");
      expect(markets.length).to.be.greaterThan(0);
    });
  });

  describe("getOrder", () => {
    it("returns OrderAccount for existing order", async () => {
      const user = await createFundedUser(provider, 100_000_000);
      const result = await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      const order = await client.accounts.getOrder(result.orderPda);
      expect(order).to.not.be.null;
      expect(order!.side).to.equal("yes");
      expect(order!.price).to.equal(500);
    });

    it("returns null for non-existent order", async () => {
      const fakeOrder = Keypair.generate().publicKey;
      const order = await client.accounts.getOrder(fakeOrder);
      expect(order).to.be.null;
    });
  });

  describe("getUserOrders", () => {
    it.skip("returns all orders for user in market (getProgramAccounts not supported on forked surfnet)", async () => {
      const user = await createFundedUser(provider, 100_000_000);

      await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 300,
        usdcAmount: new BN(5_000_000),
      });
      await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 400,
        usdcAmount: new BN(5_000_000),
      });

      const orders = await client.accounts.getUserOrders(
        marketPda,
        user.keypair.publicKey
      );
      expect(orders).to.be.an("array");
      expect(orders.length).to.be.greaterThanOrEqual(2);
    });
  });

  describe("getPosition", () => {
    it("returns null when no position exists", async () => {
      const noOne = Keypair.generate().publicKey;
      const pos = await client.accounts.getPosition(
        marketPda,
        0,
        noOne,
        "yes"
      );
      expect(pos).to.be.null;
    });

    it("returns position after match and claim", async () => {
      // Fresh market to avoid interference from shared orderbook
      const freshMarket = await client.markets.createRegularMarket({
        name: "Position Fetch Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "Position fetch?",
        minOrderSize: new BN(1_000_000),
      });

      const user = await createFundedUser(provider, 100_000_000);
      const counterparty = await createFundedUser(provider, 100_000_000);

      const bidResult = await user.client.trading.limitBid({
        market: freshMarket.marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      await counterparty.client.trading.limitBid({
        market: freshMarket.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      await user.client.positions.claimPosition({
        market: freshMarket.marketPda,
        orderPda: bidResult.orderPda,
        orderSide: "yes",
      });

      const pos = await client.accounts.getPosition(
        freshMarket.marketPda,
        0,
        user.keypair.publicKey,
        "yes"
      );
      expect(pos).to.not.be.null;
      expect(pos!.amount.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("getOrderBook", () => {
    it("returns orderbook view", async () => {
      const ob = await client.accounts.getOrderBook(yesOrderBook);
      expect(ob).to.not.be.null;
    });
  });

  describe("getOrderBooks", () => {
    it("returns both YES and NO views", async () => {
      const obs = await client.accounts.getOrderBooks(marketPda);
      expect(obs.yes).to.not.be.null;
      expect(obs.no).to.not.be.null;
    });
  });

  describe("getMarketInfo", () => {
    it("returns MarketInfo with text fields", async () => {
      const info = await client.accounts.getMarketInfo(marketInfo);
      expect(info).to.not.be.null;
      expect(info!.marketQuestion).to.include("Account fetcher?");
      expect(info!.description).to.include("Testing account fetchers");
      expect(info!.rules).to.include("Standard rules apply");
    });
  });

  describe("getResolutionProposal", () => {
    it("returns null before any proposal", async () => {
      const proposal = await client.accounts.getResolutionProposal(marketPda);
      expect(proposal).to.be.null;
    });
  });

  describe("getVoteState", () => {
    it("returns null before any voting", async () => {
      const voteState = await client.accounts.getVoteState(marketPda);
      expect(voteState).to.be.null;
    });
  });
});
