import { Connection, PublicKey } from "@solana/web3.js";
import { FillLogView, Side } from "../types";

/**
 * @internal
 *
 * Deserializes a FillLog from raw account bytes.
 * Exposes only the minimal public view (market, index, side).
 * Internal settlement details are not exposed.
 */

// Layout offsets (after 8-byte Anchor discriminator)
const MARKET_OFFSET = 8;
const INDEX_OFFSET = 40;
const SIDE_OFFSET = 41;

function sideFromByte(b: number): Side {
  return b === 0 ? "yes" : "no";
}

/** @internal */
export async function fetchFillLog(
  connection: Connection,
  address: PublicKey
): Promise<FillLogView | null> {
  const accountInfo = await connection.getAccountInfo(address);
  if (!accountInfo) return null;

  const data = accountInfo.data;
  const market = new PublicKey(data.subarray(MARKET_OFFSET, MARKET_OFFSET + 32));
  const index = data[INDEX_OFFSET];
  const side = sideFromByte(data[SIDE_OFFSET]);

  return { market, index, side };
}
