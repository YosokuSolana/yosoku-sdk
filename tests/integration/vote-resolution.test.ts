import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  createProviderClient,
  createFundedUser,
  shortDeadline,
  sleep,
  initClockDrift,
} from "./helpers";
import {
  PredMarketClient,
  parsePredMarketError,
  PredMarketErrorCode,
} from "../../src";

describe("WalletVote Resolution", () => {
  let creatorClient: PredMarketClient;
  let creatorProvider: any;

  before(async () => {
    await initClockDrift();
    const setup = createProviderClient();
    creatorClient = setup.client;
    creatorProvider = setup.provider;
  });

  describe("voteResolution", () => {
    it("authorized voter casts YES vote", async () => {
      const voter1 = await createFundedUser(creatorProvider, 10_000_000);
      const voter2 = await createFundedUser(creatorProvider, 10_000_000);
      const voter3 = await createFundedUser(creatorProvider, 10_000_000);

      const result = await creatorClient.markets.createRegularMarket({
        name: "Vote Test",
        category: "test",
        eventDeadline: shortDeadline(60),
        marketQuestion: "Vote test?",
        minOrderSize: new BN(1_000_000),
        resolverType: {
          type: "walletVote",
          voters: [
            voter1.keypair.publicKey,
            voter2.keypair.publicKey,
            voter3.keypair.publicKey,
          ],
        },
      });

      const sig = await voter1.client.voteResolution.voteResolution({
        market: result.marketPda,
        vote: "yes",
      });

      expect(sig).to.be.a("string");

      // Verify vote state
      const voteState = await creatorClient.accounts.getVoteState(
        result.marketPda
      );
      expect(voteState).to.not.be.null;
    });

    it("unauthorized voter gets UnauthorizedVoter error", async () => {
      const voter1 = await createFundedUser(creatorProvider, 10_000_000);
      const nonVoter = await createFundedUser(creatorProvider, 10_000_000);

      const result = await creatorClient.markets.createRegularMarket({
        name: "Unauth Voter",
        category: "test",
        eventDeadline: shortDeadline(60),
        marketQuestion: "Unauth voter?",
        minOrderSize: new BN(1_000_000),
        resolverType: {
          type: "walletVote",
          voters: [voter1.keypair.publicKey],
        },
      });

      try {
        await nonVoter.client.voteResolution.voteResolution({
          market: result.marketPda,
          vote: "yes",
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.UnauthorizedVoter);
      }
    });
  });

  describe("auto-finalization", () => {
    it("2/3 majority YES resolves market", async () => {
      const voter1 = await createFundedUser(creatorProvider, 10_000_000);
      const voter2 = await createFundedUser(creatorProvider, 10_000_000);
      const voter3 = await createFundedUser(creatorProvider, 10_000_000);

      const result = await creatorClient.markets.createRegularMarket({
        name: "Auto Finalize",
        category: "test",
        eventDeadline: shortDeadline(60),
        marketQuestion: "Auto finalize?",
        minOrderSize: new BN(1_000_000),
        resolverType: {
          type: "walletVote",
          voters: [
            voter1.keypair.publicKey,
            voter2.keypair.publicKey,
            voter3.keypair.publicKey,
          ],
        },
      });

      // Vote 1: YES
      await voter1.client.voteResolution.voteResolution({
        market: result.marketPda,
        vote: "yes",
      });

      // Market should not be resolved yet
      let market = await creatorClient.accounts.getMarket(result.marketPda);
      expect(market!.legs[0].status).to.equal("active");

      // Vote 2: YES (2/3 majority)
      await voter2.client.voteResolution.voteResolution({
        market: result.marketPda,
        vote: "yes",
      });

      // Market should now be resolved
      market = await creatorClient.accounts.getMarket(result.marketPda);
      expect(market!.legs[0].status).to.equal("resolved");
      expect(market!.legs[0].winningSide).to.equal("yes");
    });
  });

  describe("deadline expiry", () => {
    it("finalizeVoteResolution after deadline with no majority resolves to split", async () => {
      const voter1 = await createFundedUser(creatorProvider, 10_000_000);
      const voter2 = await createFundedUser(creatorProvider, 10_000_000);
      const voter3 = await createFundedUser(creatorProvider, 10_000_000);

      const result = await creatorClient.markets.createRegularMarket({
        name: "Deadline Expiry",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Deadline expiry?",
        minOrderSize: new BN(1_000_000),
        resolverType: {
          type: "walletVote",
          voters: [
            voter1.keypair.publicKey,
            voter2.keypair.publicKey,
            voter3.keypair.publicKey,
          ],
        },
      });

      // Vote 1: YES (not a majority)
      await voter1.client.voteResolution.voteResolution({
        market: result.marketPda,
        vote: "yes",
      });

      // Wait for deadline
      await sleep(35000);

      // Finalize after deadline
      const sig = await creatorClient.voteResolution.finalizeVoteResolution(
        result.marketPda
      );

      expect(sig).to.be.a("string");

      const market = await creatorClient.accounts.getMarket(result.marketPda);
      expect(market!.legs[0].status).to.equal("resolved");
      expect(market!.legs[0].winningSide).to.equal("split");
    });

    it("voting after deadline fails with VotingDeadlinePassed", async () => {
      const voter1 = await createFundedUser(creatorProvider, 10_000_000);

      const result = await creatorClient.markets.createRegularMarket({
        name: "Late Vote",
        category: "test",
        eventDeadline: shortDeadline(30),
        marketQuestion: "Late vote?",
        minOrderSize: new BN(1_000_000),
        resolverType: {
          type: "walletVote",
          voters: [voter1.keypair.publicKey],
        },
      });

      await sleep(35000);

      try {
        await voter1.client.voteResolution.voteResolution({
          market: result.marketPda,
          vote: "yes",
        });
        expect.fail("Should have thrown");
      } catch (err: any) {
        const parsed = parsePredMarketError(err);
        expect(parsed).to.not.be.null;
        expect(parsed!.code).to.equal(PredMarketErrorCode.VotingDeadlinePassed);
      }
    });
  });
});
