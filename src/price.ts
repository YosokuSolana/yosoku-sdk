import { BN } from "@coral-xyz/anchor";
import { USDC_DECIMALS } from "./constants";

/** Full price: YES + NO = 1000 ticks = $1.00 */
export const FULL_PRICE = 1000;

/** Half price: $0.50 (used for split outcomes) */
export const HALF_PRICE = 500;

/**
 * Cost in USDC base units for one share at a given tick price.
 * E.g., tick 500 = $0.50 = 500,000 base units per share.
 */
export function costPerShare(priceTick: number): bigint {
  return BigInt(priceTick) * BigInt(1000);
}

/**
 * Calculate how many shares can be bought with a given USDC amount at a given tick.
 */
export function usdcToShares(usdcBaseUnits: bigint, priceTick: number): bigint {
  return usdcBaseUnits / costPerShare(priceTick);
}

/**
 * Calculate the USDC cost for a given number of shares at a given tick.
 */
export function sharesToUsdc(shares: bigint, priceTick: number): bigint {
  return shares * costPerShare(priceTick);
}

/**
 * Complement price: if YES is at price X, NO is at (1000 - X).
 * YES + NO always equals $1.00.
 */
export function complementPrice(priceTick: number): number {
  return FULL_PRICE - priceTick;
}

/**
 * Convert a tick price (1-999) to a dollar amount.
 * E.g., 500 -> 0.50
 */
export function tickToPrice(priceTick: number): number {
  return priceTick / FULL_PRICE;
}

/**
 * Convert a dollar amount to a tick price.
 * E.g., 0.50 -> 500
 */
export function priceToTick(price: number): number {
  return Math.round(price * FULL_PRICE);
}

/**
 * Check if a price tick is valid (between 1 and 999 inclusive).
 */
export function isValidPrice(priceTick: number): boolean {
  return Number.isInteger(priceTick) && priceTick >= 1 && priceTick <= 999;
}

/**
 * Format USDC base units to a display string.
 * E.g., 1_500_000n -> "$1.50"
 */
export function formatUsdc(baseUnits: bigint | BN): string {
  const units =
    typeof baseUnits === "bigint" ? baseUnits : BigInt(baseUnits.toString());
  const divisor = BigInt(10 ** USDC_DECIMALS);
  const whole = units / divisor;
  const frac = units % divisor;
  const fracStr = frac.toString().padStart(USDC_DECIMALS, "0").slice(0, 2);
  return `$${whole}.${fracStr}`;
}

/**
 * Parse a display amount to USDC base units.
 * E.g., "1.50" or 1.5 -> 1_500_000n
 */
export function parseUsdc(displayAmount: string | number): bigint {
  const str =
    typeof displayAmount === "string"
      ? displayAmount.replace("$", "")
      : displayAmount.toString();
  const parts = str.split(".");
  const whole = BigInt(parts[0] || "0");
  const fracStr = (parts[1] || "0").padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  const frac = BigInt(fracStr);
  return whole * BigInt(10 ** USDC_DECIMALS) + frac;
}
