import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import {
  toAnchorSide,
  fromAnchorSide,
  toSideNumber,
  fromAnchorOrderSide,
  fromAnchorMarketStatus,
  fromAnchorResolvingState,
  toAnchorCoveredBy,
  fromAnchorCoveredBy,
  toAnchorResolverType,
  fromAnchorResolverType,
  toAnchorMarketInfoType,
  fromAnchorMarketInfoType,
} from "../../src/types";

describe("Type Converters", () => {
  describe("toAnchorSide / fromAnchorSide", () => {
    it("converts 'yes' to { yes: {} }", () => {
      const result = toAnchorSide("yes");
      expect(result).to.deep.equal({ yes: {} });
    });

    it("converts 'no' to { no: {} }", () => {
      const result = toAnchorSide("no");
      expect(result).to.deep.equal({ no: {} });
    });

    it("round-trips 'yes' correctly", () => {
      expect(fromAnchorSide(toAnchorSide("yes"))).to.equal("yes");
    });

    it("round-trips 'no' correctly", () => {
      expect(fromAnchorSide(toAnchorSide("no"))).to.equal("no");
    });

    it("fromAnchorSide handles capitalized keys like { Yes: {} }", () => {
      expect(fromAnchorSide({ Yes: {} })).to.equal("yes");
    });
  });

  describe("toSideNumber", () => {
    it("returns 0 for 'yes'", () => {
      expect(toSideNumber("yes")).to.equal(0);
    });

    it("returns 1 for 'no'", () => {
      expect(toSideNumber("no")).to.equal(1);
    });
  });

  describe("fromAnchorOrderSide", () => {
    it("returns 'yes' for { yes: {} }", () => {
      expect(fromAnchorOrderSide({ yes: {} })).to.equal("yes");
    });

    it("returns 'no' for { no: {} }", () => {
      expect(fromAnchorOrderSide({ no: {} })).to.equal("no");
    });

    it("returns 'split' for { split: {} }", () => {
      expect(fromAnchorOrderSide({ split: {} })).to.equal("split");
    });

    it("returns 'none' for { none: {} }", () => {
      expect(fromAnchorOrderSide({ none: {} })).to.equal("none");
    });
  });

  describe("fromAnchorMarketStatus", () => {
    it("returns 'active' for { active: {} }", () => {
      expect(fromAnchorMarketStatus({ active: {} })).to.equal("active");
    });

    it("returns 'paused' for { paused: {} }", () => {
      expect(fromAnchorMarketStatus({ paused: {} })).to.equal("paused");
    });

    it("returns 'resolved' for { resolved: {} }", () => {
      expect(fromAnchorMarketStatus({ resolved: {} })).to.equal("resolved");
    });
  });

  describe("fromAnchorResolvingState", () => {
    it("returns 'notStarted' for { notStarted: {} }", () => {
      expect(fromAnchorResolvingState({ notStarted: {} })).to.equal(
        "notStarted"
      );
    });

    it("returns 'proposed' for { proposed: {} }", () => {
      expect(fromAnchorResolvingState({ proposed: {} })).to.equal("proposed");
    });

    it("returns 'disputed' for { disputed: {} }", () => {
      expect(fromAnchorResolvingState({ disputed: {} })).to.equal("disputed");
    });

    it("returns 'completed' for { completed: {} }", () => {
      expect(fromAnchorResolvingState({ completed: {} })).to.equal("completed");
    });
  });

  describe("toAnchorCoveredBy / fromAnchorCoveredBy", () => {
    it("converts 'usdc' to { usdc: {} } and back", () => {
      const anchor = toAnchorCoveredBy("usdc");
      expect(anchor).to.deep.equal({ usdc: {} });
      expect(fromAnchorCoveredBy(anchor)).to.equal("usdc");
    });

    it("converts 'shares' to { shares: {} } and back", () => {
      const anchor = toAnchorCoveredBy("shares");
      expect(anchor).to.deep.equal({ shares: {} });
      expect(fromAnchorCoveredBy(anchor)).to.equal("shares");
    });
  });

  describe("toAnchorResolverType / fromAnchorResolverType", () => {
    it("converts UMA type and back", () => {
      const input = { type: "uma" as const };
      const anchor = toAnchorResolverType(input);
      expect(anchor).to.deep.equal({ umaResolver: {} });
      const output = fromAnchorResolverType(anchor);
      expect(output.type).to.equal("uma");
    });

    it("converts WalletVote type with voters and back", () => {
      const voters = [Keypair.generate().publicKey, Keypair.generate().publicKey];
      const input = { type: "walletVote" as const, voters };
      const anchor = toAnchorResolverType(input);
      expect(anchor.walletVoteResolver).to.not.be.undefined;
      expect(anchor.walletVoteResolver.voters).to.have.lengthOf(2);
      const output = fromAnchorResolverType(anchor);
      expect(output.type).to.equal("walletVote");
      if (output.type === "walletVote") {
        expect(output.voters).to.have.lengthOf(2);
        expect(output.voters[0].toBase58()).to.equal(voters[0].toBase58());
      }
    });
  });

  describe("toAnchorMarketInfoType / fromAnchorMarketInfoType", () => {
    it("converts 'regular' to { regular: {} } and back", () => {
      const anchor = toAnchorMarketInfoType("regular");
      expect(anchor).to.deep.equal({ regular: {} });
      expect(fromAnchorMarketInfoType(anchor)).to.equal("regular");
    });

    it("converts 'multiLeg' to { multiLeg: {} } and back", () => {
      const anchor = toAnchorMarketInfoType("multiLeg");
      expect(anchor).to.deep.equal({ multiLeg: {} });
      expect(fromAnchorMarketInfoType(anchor)).to.equal("multiLeg");
    });
  });
});
