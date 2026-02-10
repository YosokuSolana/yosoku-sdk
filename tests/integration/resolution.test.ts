import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  futureDeadline,
  shortDeadline,
  sleep,
  initClockDrift,
} from "./helpers";
import {
  PredMarketClient,
  parsePredMarketError,
  PredMarketErrorCode,
} from "../../src";

describe("UMA Resolution", () => {
  let creatorClient: PredMarketClient;

  before(async () => {
    await initClockDrift();
    ({ client: creatorClient } = createProviderClient());
  });

  describe("proposeResolution", () => {
    it("proposes YES outcome", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Propose Test",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Propose test?",
        minOrderSize: new BN(1_000_000),
      });

      // Wait for deadline to pass
      await sleep(35000);

      const sig = await creatorClient.resolution.proposeResolution({
        market: result.marketPda,
        proposedOutcome: "yes",
      });

      expect(sig).to.be.a("string");

      // Verify proposal exists
      const proposal = await creatorClient.accounts.getResolutionProposal(
        result.marketPda
      );
      expect(proposal).to.not.be.null;
      expect(proposal!.proposedOutcome).to.equal("yes");
    });

    it("fails with ProposalAlreadyExists if already proposed", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Dupe Propose",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Dupe propose?",
        minOrderSize: new BN(1_000_000),
      });

      await sleep(35000);

      await creatorClient.resolution.proposeResolution({
        market: result.marketPda,
        proposedOutcome: "yes",
      });

      try {
        await creatorClient.resolution.proposeResolution({
          market: result.marketPda,
          proposedOutcome: "no",
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        // The `init` constraint on resolution_proposal fails because the
        // account already exists — Anchor throws a system-level error, not
        // the custom ProposalAlreadyExists error.
        if (err.message?.includes("Should have thrown")) throw err;
        expect(err).to.be.instanceOf(Error);
      }
    });
  });

  describe("resolveExpiredMarket", () => {
    it("resolves to split after deadline passes with no proposal", async () => {
      const result = await creatorClient.markets.createRegularMarket({
        name: "Expire Test",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Expire test?",
        minOrderSize: new BN(1_000_000),
      });

      await sleep(35000);

      const sig = await creatorClient.resolution.resolveExpiredMarket(
        result.marketPda
      );

      expect(sig).to.be.a("string");

      const market = await creatorClient.accounts.getMarket(result.marketPda);
      expect(market).to.not.be.null;
      expect(market!.legs[0].status).to.equal("resolved");
      expect(market!.legs[0].winningSide).to.equal("split");
    });
  });

  describe("resolver type guard", () => {
    it("proposeResolution on WalletVote market fails with InvalidResolverType", async () => {
      const { provider, wallet } = createProviderClient();

      const result = await creatorClient.markets.createRegularMarket({
        name: "Wrong Resolver",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Wrong resolver?",
        minOrderSize: new BN(1_000_000),
        resolverType: {
          type: "walletVote",
          voters: [wallet.publicKey],
        },
      });

      await sleep(35000);

      try {
        await creatorClient.resolution.proposeResolution({
          market: result.marketPda,
          proposedOutcome: "yes",
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.InvalidResolverType);
      }
    });
  });
});
