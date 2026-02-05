import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import {
  MarketAccount,
  MarketLeg,
  fromAnchorMarketStatus,
  fromAnchorOrderSide,
  fromAnchorResolvingState,
} from "../types";

/** @internal */
function parseMarketData(data: any, index: number): MarketLeg {
  return {
    index,
    name: data.name,
    yesOrderBook: data.yesOrderBook,
    noOrderBook: data.noOrderBook,
    yesFillLog: data.yesFillLog,
    noFillLog: data.noFillLog,
    vault: data.vault,
    status: fromAnchorMarketStatus(data.status),
    winningSide: fromAnchorOrderSide(data.winningSide),
    resolvingState: fromAnchorResolvingState(data.resolvingState),
    sharesOutstanding: data.sharesOutstanding,
    totalVolume: data.totalVolume,
  };
}

/** @internal */
function extractLegs(marketType: any): { label: "regular" | "multiLeg"; legs: MarketLeg[] } {
  if (marketType.regular) {
    const data = marketType.regular;
    // Anchor may serialize as array, object with "0" key, or direct object
    let legData: any;
    if (Array.isArray(data)) {
      legData = data[0];
    } else if (data["0"]) {
      legData = data["0"];
    } else if (data.name !== undefined) {
      legData = data;
    } else {
      throw new Error("Cannot parse regular market data");
    }
    return { label: "regular", legs: [parseMarketData(legData, 0)] };
  }

  if (marketType.multiLeg) {
    const multiLegData = marketType.multiLeg;
    const legsArray = Array.isArray(multiLegData)
      ? multiLegData
      : multiLegData["0"] ?? [];
    return {
      label: "multiLeg",
      legs: legsArray.map((d: any, i: number) => parseMarketData(d, i)),
    };
  }

  throw new Error("Unknown market type");
}

/** @internal */
export function parseMarketAccount(
  address: PublicKey,
  raw: any
): MarketAccount {
  const { label, legs } = extractLegs(raw.marketType);
  return {
    address,
    marketId: BigInt(raw.marketId.toString()),
    creator: raw.creator,
    marketInfo: raw.marketInfo,
    category: raw.category,
    imageUri: raw.imageUri,
    createdAt: new Date(Number(raw.createdAt.toString()) * 1000),
    minOrderSize: raw.minOrderSize,
    eventDeadline: new Date(Number(raw.eventDeadline.toString()) * 1000),
    feeBps: raw.feeBps,
    verified: raw.verified,
    marketType: label,
    legs,
  };
}

/** @internal */
export async function fetchMarket(
  program: Program<PredMarket>,
  address: PublicKey
): Promise<MarketAccount | null> {
  try {
    const raw = await program.account.market.fetch(address);
    return parseMarketAccount(address, raw);
  } catch {
    return null;
  }
}

/** @internal */
export async function fetchAllMarkets(
  program: Program<PredMarket>,
  filters?: { creator?: PublicKey; verified?: boolean }
): Promise<MarketAccount[]> {
  const anchorFilters: any[] = [];

  if (filters?.creator) {
    // creator field is at offset 8 (discriminator) + 8 (market_id) = 16
    anchorFilters.push({
      memcmp: {
        offset: 16,
        bytes: filters.creator.toBase58(),
      },
    });
  }

  const accounts = await program.account.market.all(anchorFilters);
  let results = accounts.map((a) =>
    parseMarketAccount(a.publicKey, a.account)
  );

  if (filters?.verified !== undefined) {
    results = results.filter((m) => m.verified === filters.verified);
  }

  return results;
}
