import { PublicKey } from "@solana/web3.js";

export function getMarketPda(
  programId: PublicKey,
  marketId: bigint
): [PublicKey, number] {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(marketId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), buffer],
    programId
  );
}

export function getPositionPda(
  programId: PublicKey,
  market: PublicKey,
  index: number,
  user: PublicKey,
  side: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("position"),
      market.toBuffer(),
      Buffer.from([index]),
      user.toBuffer(),
      Buffer.from([side]),
    ],
    programId
  );
}

export function getOrderPda(
  programId: PublicKey,
  market: PublicKey,
  index: number,
  user: PublicKey,
  price: number,
  seed: number
): [PublicKey, number] {
  const priceBuffer = Buffer.alloc(2);
  priceBuffer.writeUInt16LE(price);
  const seedBuffer = Buffer.alloc(4);
  seedBuffer.writeUInt32LE(seed);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("order"),
      market.toBuffer(),
      Buffer.from([index]),
      user.toBuffer(),
      priceBuffer,
      seedBuffer,
    ],
    programId
  );
}

export function getVaultPda(
  programId: PublicKey,
  market: PublicKey,
  index: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), market.toBuffer(), Buffer.from([index])],
    programId
  );
}

export function getCreatorVaultPda(
  programId: PublicKey,
  market: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("creator-vault"), market.toBuffer()],
    programId
  );
}

export function getResolutionProposalPda(
  programId: PublicKey,
  market: PublicKey,
  index: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("resolution_proposal"),
      market.toBuffer(),
      Buffer.from([index]),
    ],
    programId
  );
}

export function getBondVaultPda(
  programId: PublicKey,
  market: PublicKey,
  index: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bond_vault"), market.toBuffer(), Buffer.from([index])],
    programId
  );
}

export function getFillLogPda(
  programId: PublicKey,
  market: PublicKey,
  index: number,
  side: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("fill_log"),
      market.toBuffer(),
      Buffer.from([index]),
      Buffer.from([side]),
    ],
    programId
  );
}

export function getVoteStatePda(
  programId: PublicKey,
  market: PublicKey,
  index: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vote_state"), market.toBuffer(), Buffer.from([index])],
    programId
  );
}
