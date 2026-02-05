import { PublicKey } from "@solana/web3.js";

/** Program ID for the pred-market program */
export const PROGRAM_ID = new PublicKey(
  "8p6MKtMGGugZMy2HGXtL3uBb11y7xuzXmbMbQgNmWVUQ"
);

/** USDC mint address (devnet) */
export const USDC_MINT = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);

/** Protocol treasury USDC account */
export const PROTOCOL_USDC_ACCOUNT = new PublicKey(
  "cyr1Aqp4n3Fk8uCkDnthKxNR6QQkztubzDX3mJCExkc"
);

/** Admin public key */
export const ADMIN_PUBKEY = new PublicKey(
  "Hw1AaSgWow8ccM7QFcfQXj6NSvWjauBE9GaTDAis26X8"
);

/** USDC token decimals */
export const USDC_DECIMALS = 6;

/** Proposer bond for resolution (100 USDC) */
export const PROPOSER_BOND = BigInt(100_000_000);

/** Disputer bond for resolution (200 USDC) */
export const DISPUTER_BOND = BigInt(200_000_000);

/** Dispute window duration in seconds (24 hours) */
export const DISPUTE_WINDOW_SECONDS = 86400;

/** Maximum number of voters in WalletVoteResolver */
export const MAX_VOTERS = 10;

// --- Internal constants (not part of the public API surface) ---

/** @internal */
export const ORDER_BOOK_SIZE =
  8 + 1 + 1 + 6 + 32 + 8 + 32 + 999 * 4 + 16416 + 4;

/** @internal */
export const FILL_LOG_SIZE = 8 + 32 + 1 + 1 + 6 + 999 * 16;

/** @internal */
export const PRICE_TICKS = 999;

/** @internal */
export const MAX_ORDERS = 512;
