import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import { PositionAccount, Side, fromAnchorSide, toSideNumber } from "../types";
import { getPositionPda } from "../pda";

/** @internal */
export function parsePositionAccount(
  address: PublicKey,
  raw: any
): PositionAccount {
  return {
    address,
    market: raw.market,
    index: raw.index,
    user: raw.user,
    side: fromAnchorSide(raw.side),
    amount: raw.amount,
  };
}

/** @internal */
export async function fetchPosition(
  program: Program<PredMarket>,
  market: PublicKey,
  index: number,
  user: PublicKey,
  side: Side
): Promise<PositionAccount | null> {
  const [pda] = getPositionPda(
    program.programId,
    market,
    index,
    user,
    toSideNumber(side)
  );
  try {
    const raw = await program.account.position.fetch(pda);
    return parsePositionAccount(pda, raw);
  } catch {
    return null;
  }
}

/** @internal */
export async function fetchUserPositions(
  program: Program<PredMarket>,
  market: PublicKey,
  user: PublicKey
): Promise<PositionAccount[]> {
  const accounts = await program.account.position.all([
    {
      memcmp: {
        offset: 8, // after discriminator: market
        bytes: market.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 8 + 32 + 1, // after discriminator + market + index: user
        bytes: user.toBase58(),
      },
    },
  ]);
  return accounts.map((a) => parsePositionAccount(a.publicKey, a.account));
}
