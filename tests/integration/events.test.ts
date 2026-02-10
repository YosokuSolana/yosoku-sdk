import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  futureDeadline,
  sleep,
  initClockDrift,
} from "./helpers";
import { PredMarketClient } from "../../src";

/** Wait for an event with timeout */
function waitForEvent<T>(
  subscribe: (cb: (e: T) => void) => () => void,
  timeoutMs: number = 15000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsub();
      reject(new Error("Event timeout"));
    }, timeoutMs);

    const unsub = subscribe((event) => {
      clearTimeout(timer);
      unsub();
      resolve(event);
    });
  });
}

describe("Event Subscriptions", () => {
  let creatorClient: PredMarketClient;
  let creatorProvider: any;
  let marketPda: PublicKey;

  before(async () => {
    await initClockDrift();
    const setup = createProviderClient();
    creatorClient = setup.client;
    creatorProvider = setup.provider;

    const result = await creatorClient.markets.createRegularMarket({
      name: "Events Test",
      category: "test",
      eventDeadline: futureDeadline(24),
      marketQuestion: "Events test?",
      minOrderSize: new BN(1_000_000),
    });
    marketPda = result.marketPda;
  });

  describe("onOrderPlaced", () => {
    it("fires when limitBid is placed", async () => {
      const user = await createFundedUser(creatorProvider, 100_000_000);

      const eventPromise = waitForEvent<any>((cb) =>
        user.client.events.onOrderPlaced(cb)
      );

      await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 500,
        usdcAmount: new BN(10_000_000),
      });

      const event = await eventPromise;
      expect(event).to.not.be.undefined;
    });
  });

  describe("onTrade", () => {
    it("fires on market buy", async () => {
      // Fresh market for clean test
      const result = await creatorClient.markets.createRegularMarket({
        name: "Trade Event",
        category: "test",
        eventDeadline: futureDeadline(24),
        marketQuestion: "Trade event?",
        minOrderSize: new BN(1_000_000),
      });

      const maker = await createFundedUser(creatorProvider, 200_000_000);
      const taker = await createFundedUser(creatorProvider, 200_000_000);

      // Maker provides liquidity
      await maker.client.trading.limitBid({
        market: result.marketPda,
        side: "no",
        price: 500,
        usdcAmount: new BN(50_000_000),
      });

      const eventPromise = waitForEvent<any>((cb) =>
        taker.client.events.onTrade(cb)
      );

      // Taker market-buys
      await taker.client.trading.marketBuy({
        market: result.marketPda,
        side: "yes",
        maxUsdc: new BN(25_000_000),
        minShares: new BN(1),
      });

      const event = await eventPromise;
      expect(event).to.not.be.undefined;
    });
  });

  describe("unsubscribe", () => {
    it("stops receiving events after unsubscribe", async () => {
      const user = await createFundedUser(creatorProvider, 100_000_000);

      let eventCount = 0;
      const unsub = user.client.events.onOrderPlaced(() => {
        eventCount++;
      });

      // Unsubscribe immediately
      unsub();

      // Place an order
      await user.client.trading.limitBid({
        market: marketPda,
        side: "yes",
        price: 200,
        usdcAmount: new BN(5_000_000),
      });

      // Wait a bit for any delayed events
      await sleep(2000);

      // Should not have received any events
      expect(eventCount).to.equal(0);
    });
  });
});
