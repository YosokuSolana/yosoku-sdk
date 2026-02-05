import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import { OrderAccount, fromAnchorSide, fromAnchorCoveredBy } from "../types";

/** @internal */
export function parseOrderAccount(
  address: PublicKey,
  raw: any
): OrderAccount {
  return {
    address,
    authority: raw.authority,
    market: raw.market,
    index: raw.index,
    side: fromAnchorSide(raw.side),
    price: raw.price,
    orderId: raw.orderId,
    amount: raw.amount,
    seed: raw.seed,
    coveredBy: fromAnchorCoveredBy(raw.coveredBy),
  };
}

/** @internal */
export async function fetchOrder(
  program: Program<PredMarket>,
  address: PublicKey
): Promise<OrderAccount | null> {
  try {
    const raw = await program.account.order.fetch(address);
    return parseOrderAccount(address, raw);
  } catch {
    return null;
  }
}

/** @internal */
export async function fetchUserOrders(
  program: Program<PredMarket>,
  market: PublicKey,
  user: PublicKey
): Promise<OrderAccount[]> {
  const accounts = await program.account.order.all([
    {
      memcmp: {
        offset: 8, // after discriminator: authority
        bytes: user.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 8 + 32, // after discriminator + authority: market
        bytes: market.toBase58(),
      },
    },
  ]);
  return accounts.map((a) => parseOrderAccount(a.publicKey, a.account));
}
