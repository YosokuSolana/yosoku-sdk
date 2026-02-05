import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// ============================================================================
// Public SDK types
// ============================================================================

export type Side = "yes" | "no";
export type MarketStatus = "active" | "paused" | "resolved";
export type ResolvingState = "notStarted" | "proposed" | "disputed" | "completed";
export type WinningSide = "yes" | "no" | "none" | "split";
export type CoveredByType = "usdc" | "shares";
export type MarketTypeLabel = "regular" | "multiLeg";
export type MarketInfoTypeLabel = "regular" | "multiLeg";

export type ResolverTypeInput =
  | { type: "uma" }
  | { type: "walletVote"; voters: PublicKey[] };

export type ResolverTypeOutput =
  | { type: "uma" }
  | { type: "walletVote"; voters: PublicKey[] };

// ============================================================================
// Account types (returned by account fetchers)
// ============================================================================

export interface MarketAccount {
  address: PublicKey;
  marketId: bigint;
  creator: PublicKey;
  marketInfo: PublicKey;
  category: string;
  imageUri: string;
  createdAt: Date;
  minOrderSize: BN;
  eventDeadline: Date;
  feeBps: number;
  verified: boolean;
  marketType: MarketTypeLabel;
  legs: MarketLeg[];
}

export interface MarketLeg {
  index: number;
  name: string;
  yesOrderBook: PublicKey;
  noOrderBook: PublicKey;
  yesFillLog: PublicKey;
  noFillLog: PublicKey;
  vault: PublicKey;
  status: MarketStatus;
  winningSide: WinningSide;
  resolvingState: ResolvingState;
  sharesOutstanding: BN;
  totalVolume: BN;
}

export interface OrderAccount {
  address: PublicKey;
  authority: PublicKey;
  market: PublicKey;
  index: number;
  side: Side;
  price: number;
  orderId: number;
  amount: BN;
  seed: number;
  coveredBy: CoveredByType;
}

export interface PositionAccount {
  address: PublicKey;
  market: PublicKey;
  index: number;
  user: PublicKey;
  side: Side;
  amount: BN;
}

export interface OrderBookLevel {
  /** Tick price (1-999) */
  price: number;
  /** Total shares at this level */
  totalQuantity: BN;
  /** Number of orders at this level */
  orderCount: number;
}

export interface OrderBookView {
  side: Side;
  levels: OrderBookLevel[];
}

export interface FillLogView {
  market: PublicKey;
  index: number;
  side: Side;
}

export interface MarketInfoAccount {
  address: PublicKey;
  authority: PublicKey | null;
  isLocked: boolean;
  marketType: MarketInfoTypeLabel;
  resolverType: ResolverTypeOutput;
  marketQuestion: string;
  description: string;
  rules: string;
}

export interface ResolutionProposalAccount {
  address: PublicKey;
  market: PublicKey;
  index: number;
  proposer: PublicKey;
  proposedOutcome: "yes" | "no" | "none";
  proposerBond: BN;
  proposedAt: Date;
  disputer: PublicKey;
  disputerBond: BN;
  disputedAt: Date | null;
  isSettled: boolean;
  bondsClaimed: boolean;
  bump: number;
}

export interface VoteRecord {
  voter: PublicKey;
  vote: "none" | "yes" | "no";
  votedAt: Date | null;
}

export interface VoteStateAccount {
  address: PublicKey;
  market: PublicKey;
  index: number;
  totalVoters: number;
  yesVotes: number;
  noVotes: number;
  votes: VoteRecord[];
  isFinalized: boolean;
  bump: number;
}

// ============================================================================
// Instruction result types
// ============================================================================

export interface RegularMarketResult {
  marketId: bigint;
  marketPda: PublicKey;
  vault: PublicKey;
  creatorVault: PublicKey;
  yesOrderBook: PublicKey;
  noOrderBook: PublicKey;
  yesFillLog: PublicKey;
  noFillLog: PublicKey;
  marketInfo: PublicKey;
  signatures: string[];
}

export interface MultiLegMarketResult {
  marketId: bigint;
  marketPda: PublicKey;
  creatorVault: PublicKey;
  marketInfo: PublicKey;
  signatures: string[];
}

export interface LegResult {
  index: number;
  name: string;
  vault: PublicKey;
  yesOrderBook: PublicKey;
  noOrderBook: PublicKey;
  yesFillLog: PublicKey;
  noFillLog: PublicKey;
  signature: string;
}

export interface OrderResult {
  orderPda: PublicKey;
  signature: string;
}

// ============================================================================
// Anchor enum converters (internal)
// ============================================================================

/** @internal */
export function toAnchorSide(side: Side): { yes: {} } | { no: {} } {
  return side === "yes" ? { yes: {} } : { no: {} };
}

/** @internal */
export function toSideNumber(side: Side): number {
  return side === "yes" ? 0 : 1;
}

/** @internal */
export function fromAnchorSide(anchorSide: any): Side {
  if (anchorSide.yes !== undefined || anchorSide.Yes !== undefined) return "yes";
  return "no";
}

/** @internal */
export function fromAnchorOrderSide(anchorSide: any): WinningSide {
  if (anchorSide.yes !== undefined) return "yes";
  if (anchorSide.no !== undefined) return "no";
  if (anchorSide.split !== undefined) return "split";
  return "none";
}

/** @internal */
export function fromAnchorMarketStatus(status: any): MarketStatus {
  if (status.active !== undefined) return "active";
  if (status.paused !== undefined) return "paused";
  return "resolved";
}

/** @internal */
export function fromAnchorResolvingState(state: any): ResolvingState {
  if (state.notStarted !== undefined) return "notStarted";
  if (state.proposed !== undefined) return "proposed";
  if (state.disputed !== undefined) return "disputed";
  return "completed";
}

/** @internal */
export function fromAnchorCoveredBy(cb: any): CoveredByType {
  if (cb.usdc !== undefined) return "usdc";
  return "shares";
}

/** @internal */
export function toAnchorCoveredBy(
  cb: CoveredByType
): { usdc: {} } | { shares: {} } {
  return cb === "usdc" ? { usdc: {} } : { shares: {} };
}

/** @internal */
export function toAnchorResolverType(rt: ResolverTypeInput): any {
  if (rt.type === "uma") return { umaResolver: {} };
  return { walletVoteResolver: { voters: rt.voters } };
}

/** @internal */
export function fromAnchorResolverType(rt: any): ResolverTypeOutput {
  if (rt.umaResolver !== undefined) return { type: "uma" };
  return { type: "walletVote", voters: rt.walletVoteResolver.voters };
}

/** @internal */
export function toAnchorMarketInfoType(
  mt: MarketInfoTypeLabel
): { regular: {} } | { multiLeg: {} } {
  return mt === "regular" ? { regular: {} } : { multiLeg: {} };
}

/** @internal */
export function fromAnchorMarketInfoType(mt: any): MarketInfoTypeLabel {
  if (mt.regular !== undefined) return "regular";
  return "multiLeg";
}
