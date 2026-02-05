import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import {
  MarketInfoAccount,
  fromAnchorMarketInfoType,
  fromAnchorResolverType,
} from "../types";

/** @internal */
export function parseMarketInfoAccount(
  address: PublicKey,
  raw: any
): MarketInfoAccount {
  return {
    address,
    authority: raw.authority ?? null,
    isLocked: raw.isLocked,
    marketType: fromAnchorMarketInfoType(raw.marketType),
    resolverType: fromAnchorResolverType(raw.resolverType),
    marketQuestion: raw.marketQuestion,
    description: raw.description,
    rules: raw.rules,
  };
}

/** @internal */
export async function fetchMarketInfo(
  program: Program<PredMarket>,
  address: PublicKey
): Promise<MarketInfoAccount | null> {
  try {
    const raw = await program.account.marketInfo.fetch(address);
    return parseMarketInfoAccount(address, raw);
  } catch {
    return null;
  }
}
