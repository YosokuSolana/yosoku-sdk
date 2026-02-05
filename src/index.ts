// Main client
export { PredMarketClient } from "./client";
export type { PredMarketClientConfig } from "./client";

// Constants
export {
  PROGRAM_ID,
  USDC_MINT,
  PROTOCOL_USDC_ACCOUNT,
  ADMIN_PUBKEY,
  USDC_DECIMALS,
  PROPOSER_BOND,
  DISPUTER_BOND,
  DISPUTE_WINDOW_SECONDS,
  MAX_VOTERS,
} from "./constants";

// Types
export type {
  Side,
  MarketStatus,
  ResolvingState,
  WinningSide,
  CoveredByType,
  MarketTypeLabel,
  MarketInfoTypeLabel,
  ResolverTypeInput,
  ResolverTypeOutput,
  MarketAccount,
  MarketLeg,
  OrderAccount,
  PositionAccount,
  OrderBookLevel,
  OrderBookView,
  FillLogView,
  MarketInfoAccount,
  ResolutionProposalAccount,
  VoteRecord,
  VoteStateAccount,
  RegularMarketResult,
  MultiLegMarketResult,
  LegResult,
  OrderResult,
} from "./types";

// PDA derivation
export {
  getMarketPda,
  getPositionPda,
  getOrderPda,
  getVaultPda,
  getCreatorVaultPda,
  getResolutionProposalPda,
  getBondVaultPda,
  getFillLogPda,
  getVoteStatePda,
} from "./pda";

// Price utilities
export {
  FULL_PRICE,
  HALF_PRICE,
  costPerShare,
  usdcToShares,
  sharesToUsdc,
  complementPrice,
  tickToPrice,
  priceToTick,
  isValidPrice,
  formatUsdc,
  parseUsdc,
} from "./price";

// Errors
export {
  PredMarketErrorCode,
  PredMarketError,
  parsePredMarketError,
} from "./errors";

// Instruction param types
export type {
  CreateRegularMarketParams,
  CreateMultiLegMarketParams,
  AddLegParams,
} from "./instructions/market-creation";
export type {
  CreateMarketInfoParams,
  CreateMarketInfoResult,
} from "./instructions/market-info";
export type {
  LimitBidParams,
  LimitAskParams,
  CoveredBidParams,
  MarketBuyParams,
  MarketSellParams,
} from "./instructions/trading";
export type {
  ClaimPositionParams,
  MergeSharesParams,
  CancelOrderParams,
  RedeemPositionParams,
} from "./instructions/positions";
export type {
  ProposeResolutionParams,
  FinalizeResolutionParams,
  ClaimDisputeWinningsParams,
} from "./instructions/resolution";
export type { VoteResolutionParams } from "./instructions/vote-resolution";

// Events
export type {
  TradeEvent,
  OrderPlacedEvent,
  OrderCancelledEvent,
  PositionClaimedEvent,
  PositionUpdatedEvent,
  SharesMergedEvent,
  PredMarketEvent,
} from "./events";
