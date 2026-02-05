import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PredMarket } from "../idl/pred_market";
import {
  ResolutionProposalAccount,
  VoteStateAccount,
  VoteRecord,
} from "../types";
import { getResolutionProposalPda, getVoteStatePda } from "../pda";

/** @internal */
function parseProposedOutcome(raw: any): "yes" | "no" | "none" {
  if (raw.yes !== undefined) return "yes";
  if (raw.no !== undefined) return "no";
  return "none";
}

/** @internal */
function parseVoteValue(v: number): "none" | "yes" | "no" {
  if (v === 1) return "yes";
  if (v === 2) return "no";
  return "none";
}

/** @internal */
export function parseResolutionProposal(
  address: PublicKey,
  raw: any
): ResolutionProposalAccount {
  const disputedAt = raw.disputedAt
    ? Number(raw.disputedAt.toString())
    : 0;
  return {
    address,
    market: raw.market,
    index: raw.index,
    proposer: raw.proposer,
    proposedOutcome: parseProposedOutcome(raw.proposedOutcome),
    proposerBond: raw.proposerBond,
    proposedAt: new Date(Number(raw.proposedAt.toString()) * 1000),
    disputer: raw.disputer,
    disputerBond: raw.disputerBond,
    disputedAt: disputedAt > 0 ? new Date(disputedAt * 1000) : null,
    isSettled: raw.isSettled,
    bondsClaimed: raw.bondsClaimed,
    bump: raw.bump,
  };
}

/** @internal */
export async function fetchResolutionProposal(
  program: Program<PredMarket>,
  market: PublicKey,
  index: number
): Promise<ResolutionProposalAccount | null> {
  const [pda] = getResolutionProposalPda(program.programId, market, index);
  try {
    const raw = await program.account.resolutionProposal.fetch(pda);
    return parseResolutionProposal(pda, raw);
  } catch {
    return null;
  }
}

/** @internal */
function parseVoteRecords(raw: any[]): VoteRecord[] {
  return raw.map((r) => ({
    voter: r.voter,
    vote: parseVoteValue(r.vote),
    votedAt: r.votedAt && Number(r.votedAt.toString()) > 0
      ? new Date(Number(r.votedAt.toString()) * 1000)
      : null,
  }));
}

/** @internal */
export function parseVoteState(
  address: PublicKey,
  raw: any
): VoteStateAccount {
  return {
    address,
    market: raw.market,
    index: raw.index,
    totalVoters: raw.totalVoters,
    yesVotes: raw.yesVotes,
    noVotes: raw.noVotes,
    votes: parseVoteRecords(raw.votes),
    isFinalized: raw.isFinalized,
    bump: raw.bump,
  };
}

/** @internal */
export async function fetchVoteState(
  program: Program<PredMarket>,
  market: PublicKey,
  index: number
): Promise<VoteStateAccount | null> {
  const [pda] = getVoteStatePda(program.programId, market, index);
  try {
    const raw = await program.account.voteState.fetch(pda);
    return parseVoteState(pda, raw);
  } catch {
    return null;
  }
}
