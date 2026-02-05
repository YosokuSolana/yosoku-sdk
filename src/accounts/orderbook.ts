import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { OrderBookView, OrderBookLevel, Side } from "../types";
import { PRICE_TICKS, MAX_ORDERS } from "../constants";

/**
 * @internal
 *
 * Deserializes an OrderBook from raw account bytes.
 * Returns an aggregated L2 view (price levels) without exposing internal structure.
 */

// Layout offsets (after 8-byte Anchor discriminator)
const SIDE_OFFSET = 8;
const INDEX_OFFSET = 9;
// 6 bytes padding
const MARKET_OFFSET = 16;
const ORDER_COUNT_OFFSET = 48;
const FILL_LOG_OFFSET = 56;
const TICKS_OFFSET = 88;
const TICKS_SIZE = PRICE_TICKS * 4;
const ORDERS_OFFSET = TICKS_OFFSET + TICKS_SIZE;

// Each node in the allocator: Key (8 bytes) + Value (8 bytes) + metadata (16 bytes)
const NODE_SIZE = 32;
const KEY_SIZE = 8;
const VALUE_SIZE = 8;

// Allocator header size within the tree structure
const ALLOCATOR_HEADER_SIZE = 16;

function sideFromByte(b: number): Side {
  return b === 0 ? "yes" : "no";
}

/** @internal */
export async function fetchOrderBook(
  connection: Connection,
  address: PublicKey
): Promise<OrderBookView | null> {
  const accountInfo = await connection.getAccountInfo(address);
  if (!accountInfo) return null;

  const data = accountInfo.data;
  const side = sideFromByte(data[SIDE_OFFSET]);
  const orderCount = Number(data.readBigUInt64LE(ORDER_COUNT_OFFSET));

  if (orderCount === 0) {
    return { side, levels: [] };
  }

  // Aggregate by price from the tree structure
  const levelMap = new Map<number, { quantity: bigint; count: number }>();

  // Read nodes from the tree: scan allocated entries
  const treeData = data.subarray(ORDERS_OFFSET);

  // The tree has a header followed by node data
  // Each node contains: key (OrderKey: price u16, padding u16, inverted_order_id u32) + value (OrderValue: packed u64)
  // We scan all MAX_ORDERS slots and aggregate non-empty entries by price
  for (let i = 0; i < MAX_ORDERS; i++) {
    const nodeOffset = ALLOCATOR_HEADER_SIZE + i * NODE_SIZE;
    if (nodeOffset + KEY_SIZE + VALUE_SIZE > treeData.length) break;

    // Read the key
    const price = treeData.readUInt16LE(nodeOffset);
    // Read the value (packed: lower 56 bits = quantity, upper 8 bits = type)
    const valueData = treeData.readBigUInt64LE(nodeOffset + KEY_SIZE);
    const quantity = valueData & BigInt("0x00FFFFFFFFFFFFFF");

    // Skip empty/unallocated nodes
    if (price === 0 || quantity === BigInt(0)) continue;

    const existing = levelMap.get(price);
    if (existing) {
      existing.quantity += quantity;
      existing.count++;
    } else {
      levelMap.set(price, { quantity, count: 1 });
    }
  }

  // Sort levels by price descending (best bids first)
  const levels: OrderBookLevel[] = Array.from(levelMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([price, { quantity, count }]) => ({
      price,
      totalQuantity: new BN(quantity.toString()),
      orderCount: count,
    }));

  return { side, levels };
}
