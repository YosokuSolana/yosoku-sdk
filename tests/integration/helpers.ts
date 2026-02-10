import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PredMarketClient, USDC_MINT, PROGRAM_ID } from "../../src";
import * as fs from "fs";

export const LOCAL_RPC = "http://127.0.0.1:8899";
export const LOCAL_WS = "ws://127.0.0.1:8902";

/** The cloned devnet USDC ATA owned by the deployer wallet (~500k USDC) */
export const FUNDED_USDC_ATA = new PublicKey(
  "BdBSRosm2htgLVrS9ygjFAJzTy1B4JAgBDG8ozbrNqAD"
);

/** Load the deployer wallet from the Solana CLI config */
export function loadDeployerKeypair(): Keypair {
  const keyPath =
    process.env.SOLANA_KEYPAIR_PATH || `${process.env.HOME}/.config/solana/id.json`;
  const raw = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

/** Create an AnchorProvider + PredMarketClient for the deployer wallet */
export function createProviderClient(): {
  provider: AnchorProvider;
  client: PredMarketClient;
  wallet: Keypair;
} {
  const wallet = loadDeployerKeypair();
  const connection = new Connection(LOCAL_RPC, {
    commitment: "confirmed",
    wsEndpoint: LOCAL_WS,
  });
  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: async (tx: any) => {
      tx.partialSign(wallet);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      txs.forEach((tx) => tx.partialSign(wallet));
      return txs;
    },
  } as Wallet;
  const provider = new AnchorProvider(connection, anchorWallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  const client = PredMarketClient.fromProvider(provider);
  return { provider, client, wallet };
}

/** Create a fresh keypair, airdrop SOL, create USDC ATA, transfer USDC */
export async function createFundedUser(
  fundingProvider: AnchorProvider,
  usdcAmount: number = 1000_000_000 // 1000 USDC default
): Promise<{
  keypair: Keypair;
  usdcAta: PublicKey;
  provider: AnchorProvider;
  client: PredMarketClient;
}> {
  const keypair = Keypair.generate();
  const connection = fundingProvider.connection;

  // Airdrop SOL for tx fees
  const sig = await connection.requestAirdrop(
    keypair.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(sig, "confirmed");

  // Create USDC ATA for the new user
  const userUsdcAta = getAssociatedTokenAddressSync(
    USDC_MINT,
    keypair.publicKey
  );

  const fundingWallet = loadDeployerKeypair();
  const fundingUsdcAta = getAssociatedTokenAddressSync(
    USDC_MINT,
    fundingWallet.publicKey
  );

  // Build tx: create ATA + transfer USDC from funding wallet
  const { Transaction } = await import("@solana/web3.js");
  const tx = new Transaction();

  tx.add(
    createAssociatedTokenAccountInstruction(
      fundingWallet.publicKey,
      userUsdcAta,
      keypair.publicKey,
      USDC_MINT
    )
  );

  tx.add(
    createTransferInstruction(
      fundingUsdcAta,
      userUsdcAta,
      fundingWallet.publicKey,
      usdcAmount
    )
  );

  tx.feePayer = fundingWallet.publicKey;
  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.partialSign(fundingWallet);
  const rawTx = tx.serialize();
  const txSig = await connection.sendRawTransaction(rawTx);
  await connection.confirmTransaction(txSig, "confirmed");

  // Create per-user provider + client
  const userWallet = {
    publicKey: keypair.publicKey,
    signTransaction: async (t: any) => {
      t.partialSign(keypair);
      return t;
    },
    signAllTransactions: async (txs: any[]) => {
      txs.forEach((t) => t.partialSign(keypair));
      return txs;
    },
  } as Wallet;

  const userProvider = new AnchorProvider(connection, userWallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  const userClient = PredMarketClient.fromProvider(userProvider);

  return {
    keypair,
    usdcAta: userUsdcAta,
    provider: userProvider,
    client: userClient,
  };
}

/** Get USDC balance for a wallet (in base units) */
export async function getUsdcBalance(
  connection: Connection,
  owner: PublicKey
): Promise<bigint> {
  const ata = getAssociatedTokenAddressSync(USDC_MINT, owner);
  try {
    const info = await connection.getTokenAccountBalance(ata);
    return BigInt(info.value.amount);
  } catch {
    return BigInt(0);
  }
}

/** Sleep helper */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a random market ID */
export function randomMarketId(): bigint {
  return BigInt(Math.floor(Math.random() * 1_000_000_000));
}

/**
 * The validator clock may drift ahead of wallclock (common with Surfpool/test validators).
 * We compute the drift once and apply it to all deadline calculations.
 */
let clockDrift = 0; // seconds the validator is ahead of wallclock

/** Must be called before using shortDeadline/futureDeadline. Idempotent. */
export async function initClockDrift(connection?: Connection): Promise<void> {
  const conn = connection ?? new Connection(LOCAL_RPC);
  const slot = await conn.getSlot();
  const blockTime = await conn.getBlockTime(slot);
  if (blockTime) {
    clockDrift = blockTime - Math.floor(Date.now() / 1000);
  }
}

/** Default event deadline: 1 hour from now (adjusted for validator clock) */
export function futureDeadline(hoursFromNow: number = 1): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000 + clockDrift * 1000);
}

/** Short deadline for resolution tests: seconds from now (adjusted for validator clock) */
export function shortDeadline(secondsFromNow: number = 5): Date {
  return new Date(Date.now() + secondsFromNow * 1000 + clockDrift * 1000);
}
