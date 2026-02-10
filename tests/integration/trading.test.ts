import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  futureDeadline,
  getUsdcBalance,
  sleep,
  initClockDrift,
} from "./helpers";
import {
  PredMarketClient,
  parsePredMarketError,
  PredMarketErrorCode,
} from "../../src";

describe("Trading", () => {
  let creatorClient: PredMarketClient;
  let marketPda: PublicKey;
  let yesOrderBook: PublicKey;
  let noOrderBook: PublicKey;

  before(async () => {
    await initClockDrift();
    const { client, provider } = createProviderClient();
    creatorClient = client;

    // Create a market for all trading tests
    const result = await client.markets.createRegularMarket({
      name: "Trading Test Market",
      category: "test",
      eventDeadline: futureDeadline(24),
      marketQuestion: "Trading test?",
      minOrderSize: new BN(1_000_000),
    });
    marketPda = result.marketPda;
    yesOrderBook = result.yesOrderBook;
    noOrderBook = result.noOrderBook;
  });

  describe("limitBid", () => {
    it("places a YES bid and returns OrderResult", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      const result = await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(10_000_000), // 10 USDC
      });

      expect(result.orderPda).to.be.instanceOf(PublicKey);
      expect(result.signature).to.be.a("string");
    });

    it("fetches the order with correct fields", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      const result = await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 400,
        usdcAmount: new BN(10_000_000),
      });

      const order = await user.client.accounts.getOrder(result.orderPda);
      expect(order).to.not.be.null;
      expect(order!.side).to.equal("yes");
      expect(order!.price).to.equal(400);
    });

    it("deducts USDC from user ATA", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      const balanceBefore = await getUsdcBalance(
        provider.connection,
        user.keypair.publicKey
      );

      await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      const balanceAfter = await getUsdcBalance(
        provider.connection,
        user.keypair.publicKey
      );

      expect(Number(balanceAfter)).to.be.lessThan(Number(balanceBefore));
    });

    it("auto-generates seed", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      // Place two orders at same price — should succeed with different auto seeds
      const r1 = await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 300,
        usdcAmount: new BN(5_000_000),
      });
      const r2 = await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 300,
        usdcAmount: new BN(5_000_000),
      });

      expect(r1.orderPda.toBase58()).to.not.equal(r2.orderPda.toBase58());
    });

    it("uses provided seed", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      const result = await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 600,
        usdcAmount: new BN(5_000_000),
        seed: 12345,
      });

      expect(result.orderPda).to.be.instanceOf(PublicKey);
    });
  });

  describe("limitAsk", () => {
    it("places a YES ask (sells YES shares)", async () => {
      const { provider } = createProviderClient();
      // Create two users for matching
      const seller = await createFundedUser(provider, 200_000_000);
      const counterparty = await createFundedUser(provider, 200_000_000);

      // Step 1: seller places YES bid to acquire YES shares
      const sellerBid = await seller.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      // Step 2: counterparty places NO bid at same price — matches with seller's YES bid
      await counterparty.client.trading.limitBid({
        market: marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      // Step 3: seller claims YES position from the matched order
      await seller.client.positions.claimPosition({
        market: marketPda,
        orderPda: sellerBid.orderPda,
        orderSide: "yes",
      });

      // Step 4: seller places a limit ask to sell some YES shares
      const askResult = await seller.client.trading.limitAsk({
        market: marketPda,
        side: "yes",
        price: 600,
        shares: new BN(5),
      });

      expect(askResult.orderPda).to.be.instanceOf(PublicKey);
      expect(askResult.signature).to.be.a("string");
    });
  });

  describe("marketBuy", () => {
    it("buys YES shares from resting NO bids", async () => {
      // Fresh market for clean orderbook
      const result = await creatorClient.markets.createRegularMarket({
        name: "MarketBuy Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "MarketBuy test?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const maker = await createFundedUser(provider, 100_000_000);
      const taker = await createFundedUser(provider, 100_000_000);

      // Maker places NO bid (provides liquidity for YES buyers)
      await maker.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      // Taker market-buys YES shares
      const sig = await taker.client.trading.marketBuy({
        market: result.marketPda,
        side: "yes",
        maxUsdc: new BN(25_000_000),
        minShares: new BN(1),
      });

      expect(sig).to.be.a("string");
    });

    it("fails with SlippageExceeded on empty book", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Empty Book Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "Empty book?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const taker = await createFundedUser(provider, 100_000_000);

      try {
        await taker.client.trading.marketBuy({
          market: result.marketPda,
          side: "yes",
          maxUsdc: new BN(10_000_000),
          minShares: new BN(1),
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(6019); // SlippageExceeded — empty book yields 0 shares, below minShares
      }
    });
  });

  describe("marketSell", () => {
    it("sells YES shares against resting YES bids", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "MarketSell Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "MarketSell test?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const maker = await createFundedUser(provider, 200_000_000);
      const seller = await createFundedUser(provider, 200_000_000);

      // Give seller YES shares: place YES + NO bids that match
      const sellerBid = await seller.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });
      await maker.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      // Claim seller's YES position
      await seller.client.positions.claimPosition({
        market: result.marketPda,
        orderPda: sellerBid.orderPda,
        orderSide: "yes",
      });

      // Maker now places fresh YES bids for seller to sell into
      await maker.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 400,
        usdcAmount: new BN(20_000_000),
      });

      // Seller market-sells YES shares
      const sig = await seller.client.trading.marketSell({
        market: result.marketPda,
        side: "yes",
        shares: new BN(10),
        minUsdc: new BN(1_000_000),
      });

      expect(sig).to.be.a("string");
    });
  });

  describe("error cases", () => {
    it("rejects price 0", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      try {
        await user.client.trading.limitBid({
          market: marketPda,
          side: "yes",
          price: 0,
          usdcAmount: new BN(10_000_000),
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(6002); // MathOverflow — price 0 causes overflow before validation
      }
    });

    it("InvalidPrice for price 1000", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      try {
        await user.client.trading.limitBid({
          market: marketPda,
          side: "yes",
          price: 1000,
          usdcAmount: new BN(10_000_000),
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.InvalidPrice);
      }
    });

    it("rejects tiny order amount", async () => {
      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      try {
        await user.client.trading.limitBid({
          market: marketPda,
          side: "yes",
          price: 500,
          usdcAmount: new BN(100), // way below min order size of 1 USDC
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(6001); // InvalidAmount — tiny amount rejected before min-size check
      }
    });
  });
});
