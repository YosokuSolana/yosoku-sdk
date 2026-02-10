import { expect } from "chai";
import {
  PredMarketErrorCode,
  PredMarketError,
  parsePredMarketError,
} from "../../src";

describe("Error Codes and Parser", () => {
  describe("PredMarketErrorCode enum", () => {
    it("InvalidPrice is 6000", () => {
      expect(PredMarketErrorCode.InvalidPrice).to.equal(6000);
    });

    it("NoFeesToClaim is 6070", () => {
      expect(PredMarketErrorCode.NoFeesToClaim).to.equal(6070);
    });

    it("Unauthorized is 6023", () => {
      expect(PredMarketErrorCode.Unauthorized).to.equal(6023);
    });

    it("SlippageExceeded is 6019", () => {
      expect(PredMarketErrorCode.SlippageExceeded).to.equal(6019);
    });

    it("MarketNotResolved is 6045", () => {
      expect(PredMarketErrorCode.MarketNotResolved).to.equal(6045);
    });
  });

  describe("parsePredMarketError", () => {
    it("returns PredMarketError for Anchor-style error", () => {
      const err = parsePredMarketError({
        error: { errorCode: { number: 6000 } },
      });
      expect(err).to.not.be.null;
      expect(err!.code).to.equal(6000);
      expect(err!.errorName).to.equal("InvalidPrice");
      expect(err!.message).to.include("Invalid price");
    });

    it("returns PredMarketError for flat code-style error", () => {
      const err = parsePredMarketError({ code: 6023 });
      expect(err).to.not.be.null;
      expect(err!.code).to.equal(6023);
      expect(err!.errorName).to.equal("Unauthorized");
    });

    it("returns null for unknown error codes", () => {
      const err = parsePredMarketError({
        error: { errorCode: { number: 9999 } },
      });
      expect(err).to.be.null;
    });

    it("returns null for null input", () => {
      expect(parsePredMarketError(null)).to.be.null;
    });

    it("returns null for undefined input", () => {
      expect(parsePredMarketError(undefined)).to.be.null;
    });

    it("returns null for non-object input", () => {
      expect(parsePredMarketError("string error")).to.be.null;
      expect(parsePredMarketError(42)).to.be.null;
    });

    it("returns null for errors without code property", () => {
      expect(parsePredMarketError({ message: "oops" })).to.be.null;
    });
  });

  describe("PredMarketError class", () => {
    it("extends Error", () => {
      const err = new PredMarketError(6000, "test message", "TestError");
      expect(err).to.be.instanceOf(Error);
    });

    it("has code, errorName, and message properties", () => {
      const err = new PredMarketError(6000, "test message", "TestError");
      expect(err.code).to.equal(6000);
      expect(err.errorName).to.equal("TestError");
      expect(err.message).to.equal("test message");
    });

    it("has name set to 'PredMarketError'", () => {
      const err = new PredMarketError(6000, "test", "Test");
      expect(err.name).to.equal("PredMarketError");
    });
  });
});
