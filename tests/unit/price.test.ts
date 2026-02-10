import { expect } from "chai";
import { BN } from "@coral-xyz/anchor";
import {
  FULL_PRICE,
  HALF_PRICE,
  costPerShare,
  usdcToShares,
  sharesToUsdc,
  complementPrice,
  tickToPrice,
  priceToTick,
  isValidPrice,
  formatUsdc,
  parseUsdc,
} from "../../src";

describe("Price Utilities", () => {
  describe("constants", () => {
    it("FULL_PRICE is 1000", () => {
      expect(FULL_PRICE).to.equal(1000);
    });

    it("HALF_PRICE is 500", () => {
      expect(HALF_PRICE).to.equal(500);
    });
  });

  describe("costPerShare", () => {
    it("returns 500_000 for tick 500 ($0.50)", () => {
      expect(costPerShare(500)).to.equal(BigInt(500_000));
    });

    it("returns 1_000 for tick 1 ($0.001)", () => {
      expect(costPerShare(1)).to.equal(BigInt(1_000));
    });

    it("returns 999_000 for tick 999 ($0.999)", () => {
      expect(costPerShare(999)).to.equal(BigInt(999_000));
    });
  });

  describe("usdcToShares", () => {
    it("100 USDC at tick 500 = 200 shares", () => {
      // 100 USDC = 100_000_000 base units, cost per share at 500 = 500_000
      expect(usdcToShares(BigInt(100_000_000), 500)).to.equal(BigInt(200));
    });

    it("returns 0 for insufficient USDC", () => {
      // Less than 1 share's cost
      expect(usdcToShares(BigInt(100), 500)).to.equal(BigInt(0));
    });

    it("handles integer division (truncates)", () => {
      // 750_000 / 500_000 = 1.5 → truncates to 1
      expect(usdcToShares(BigInt(750_000), 500)).to.equal(BigInt(1));
    });
  });

  describe("sharesToUsdc", () => {
    it("100 shares at tick 500 = 50 USDC in base units", () => {
      expect(sharesToUsdc(BigInt(100), 500)).to.equal(BigInt(50_000_000));
    });

    it("1 share at tick 1 = 1000 base units", () => {
      expect(sharesToUsdc(BigInt(1), 1)).to.equal(BigInt(1_000));
    });

    it("0 shares = 0 USDC", () => {
      expect(sharesToUsdc(BigInt(0), 500)).to.equal(BigInt(0));
    });
  });

  describe("complementPrice", () => {
    it("complement of 500 is 500", () => {
      expect(complementPrice(500)).to.equal(500);
    });

    it("complement of 300 is 700", () => {
      expect(complementPrice(300)).to.equal(700);
    });

    it("complement of 1 is 999", () => {
      expect(complementPrice(1)).to.equal(999);
    });

    it("complement of 999 is 1", () => {
      expect(complementPrice(999)).to.equal(1);
    });
  });

  describe("tickToPrice", () => {
    it("500 ticks = $0.50", () => {
      expect(tickToPrice(500)).to.equal(0.5);
    });

    it("1 tick = $0.001", () => {
      expect(tickToPrice(1)).to.equal(0.001);
    });

    it("999 ticks = $0.999", () => {
      expect(tickToPrice(999)).to.equal(0.999);
    });
  });

  describe("priceToTick", () => {
    it("$0.50 = 500 ticks", () => {
      expect(priceToTick(0.5)).to.equal(500);
    });

    it("$0.001 = 1 tick", () => {
      expect(priceToTick(0.001)).to.equal(1);
    });

    it("rounds to nearest integer", () => {
      expect(priceToTick(0.4996)).to.equal(500);
      expect(priceToTick(0.5006)).to.equal(501);
    });
  });

  describe("isValidPrice", () => {
    it("returns true for 1", () => {
      expect(isValidPrice(1)).to.be.true;
    });

    it("returns true for 999", () => {
      expect(isValidPrice(999)).to.be.true;
    });

    it("returns true for 500", () => {
      expect(isValidPrice(500)).to.be.true;
    });

    it("returns false for 0", () => {
      expect(isValidPrice(0)).to.be.false;
    });

    it("returns false for 1000", () => {
      expect(isValidPrice(1000)).to.be.false;
    });

    it("returns false for negative numbers", () => {
      expect(isValidPrice(-1)).to.be.false;
    });

    it("returns false for non-integers like 500.5", () => {
      expect(isValidPrice(500.5)).to.be.false;
    });
  });

  describe("formatUsdc", () => {
    it("formats 1_500_000 as '$1.50'", () => {
      expect(formatUsdc(BigInt(1_500_000))).to.equal("$1.50");
    });

    it("formats 0 as '$0.00'", () => {
      expect(formatUsdc(BigInt(0))).to.equal("$0.00");
    });

    it("formats 100_000_000 as '$100.00'", () => {
      expect(formatUsdc(BigInt(100_000_000))).to.equal("$100.00");
    });

    it("accepts BN input", () => {
      expect(formatUsdc(new BN(1_500_000))).to.equal("$1.50");
    });
  });

  describe("parseUsdc", () => {
    it("parses '1.50' to 1_500_000n", () => {
      expect(parseUsdc("1.50")).to.equal(BigInt(1_500_000));
    });

    it("parses '$1.50' to 1_500_000n (strips dollar sign)", () => {
      expect(parseUsdc("$1.50")).to.equal(BigInt(1_500_000));
    });

    it("parses '100' to 100_000_000n", () => {
      expect(parseUsdc("100")).to.equal(BigInt(100_000_000));
    });

    it("parses numeric input 1.5 to 1_500_000n", () => {
      expect(parseUsdc(1.5)).to.equal(BigInt(1_500_000));
    });

    it("parses '0.001' to 1000n", () => {
      expect(parseUsdc("0.001")).to.equal(BigInt(1000));
    });
  });
});
