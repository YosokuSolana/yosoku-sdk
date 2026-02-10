import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  futureDeadline,
  getUsdcBalance,
  sleep,
  shortDeadline,
  initClockDrift,
} from "./helpers";
import {
  PredMarketClient,
  parsePredMarketError,
  PredMarketErrorCode,
} from "../../src";

describe("Positions", () => {
  let creatorClient: PredMarketClient;

  before(async () => {
    await initClockDrift();
    ({ client: creatorClient } = createProviderClient());
  });

  describe("claimPosition", () => {
    it("claims fills into position after matching", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Claim Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "Claim test?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const maker = await createFundedUser(provider, 100_000_000);
      const taker = await createFundedUser(provider, 100_000_000);

      // Place matching bids
      const makerBid = await maker.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });
      await taker.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      // Claim maker's YES position
      const sig = await maker.client.positions.claimPosition({
        market: result.marketPda,
        orderPda: makerBid.orderPda,
        orderSide: "yes",
      });

      expect(sig).to.be.a("string");

      // Verify position exists
      const pos = await maker.client.accounts.getPosition(
        result.marketPda,
        0,
        maker.keypair.publicKey,
        "yes"
      );
      expect(pos).to.not.be.null;
      expect(pos!.amount.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("mergeShares", () => {
    it("merges YES + NO shares into USDC", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Merge Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "Merge test?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 200_000_000);
      const counterparty = await createFundedUser(provider, 200_000_000);

      // User gets YES shares
      const yesBid = await user.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });
      await counterparty.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      await user.client.positions.claimPosition({
        market: result.marketPda,
        orderPda: yesBid.orderPda,
        orderSide: "yes",
      });

      // User gets NO shares
      const noBid = await user.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });
      await counterparty.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      await user.client.positions.claimPosition({
        market: result.marketPda,
        orderPda: noBid.orderPda,
        orderSide: "no",
      });

      const balanceBefore = await getUsdcBalance(
        provider.connection,
        user.keypair.publicKey
      );

      // Merge 10 pairs
      const sig = await user.client.positions.mergeShares({
        market: result.marketPda,
        amount: new BN(10),
      });

      expect(sig).to.be.a("string");

      const balanceAfter = await getUsdcBalance(
        provider.connection,
        user.keypair.publicKey
      );

      // Should receive 10 * 1_000_000 = 10 USDC back ($1.00 per pair)
      expect(Number(balanceAfter)).to.be.greaterThan(Number(balanceBefore));
    });
  });

  describe("cancelOrder", () => {
    it("cancels unfilled resting order and refunds USDC", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Cancel Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "Cancel test?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      const balanceBefore = await getUsdcBalance(
        provider.connection,
        user.keypair.publicKey
      );

      const bid = await user.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 300,
        usdcAmount: new BN(10_000_000),
      });

      const balanceAfterOrder = await getUsdcBalance(
        provider.connection,
        user.keypair.publicKey
      );
      expect(Number(balanceAfterOrder)).to.be.lessThan(Number(balanceBefore));

      // Cancel the order
      const sig = await user.client.positions.cancelOrder({
        market: result.marketPda,
        orderPda: bid.orderPda,
      });

      expect(sig).to.be.a("string");

      const balanceAfterCancel = await getUsdcBalance(
        provider.connection,
        user.keypair.publicKey
      );

      // USDC should be refunded (close to original balance)
      expect(Number(balanceAfterCancel)).to.be.greaterThan(Number(balanceAfterOrder));
    });
  });

  describe("redeemPosition", () => {
    it("redeems winning YES position after resolution", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Redeem Test",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Redeem test?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const buyer = await createFundedUser(provider, 200_000_000);
      const seller = await createFundedUser(provider, 200_000_000);

      // Create matching orders
      const buyerBid = await buyer.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });
      await seller.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      // Claim buyer's YES position
      await buyer.client.positions.claimPosition({
        market: result.marketPda,
        orderPda: buyerBid.orderPda,
        orderSide: "yes",
      });

      // Wait for deadline then resolve as expired (split)
      await sleep(35000);

      await creatorClient.resolution.resolveExpiredMarket(result.marketPda);

      // Redeem YES position
      const balanceBefore = await getUsdcBalance(
        provider.connection,
        buyer.keypair.publicKey
      );

      const sig = await buyer.client.positions.redeemPosition({
        market: result.marketPda,
        side: "yes",
      });

      expect(sig).to.be.a("string");

      const balanceAfter = await getUsdcBalance(
        provider.connection,
        buyer.keypair.publicKey
      );

      // Should receive USDC from redemption
      expect(Number(balanceAfter)).to.be.greaterThan(Number(balanceBefore));
    });

    it("fails with MarketNotResolved on active market", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Not Resolved Test",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "Not resolved?",
        minOrderSize: new BN(1_000_000),
      });

      const { provider } = createProviderClient();
      const user = await createFundedUser(provider, 100_000_000);

      // Give user shares first
      const bid = await user.client.trading.limitBid({
        market: result.marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      const { provider: p2 } = createProviderClient();
      const counterparty = await createFundedUser(p2, 100_000_000);
      await counterparty.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      await user.client.positions.claimPosition({
        market: result.marketPda,
        orderPda: bid.orderPda,
        orderSide: "yes",
      });

      try {
        await user.client.positions.redeemPosition({
          market: result.marketPda,
          side: "yes",
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.MarketNotResolved);
      }
    });
  });
});
