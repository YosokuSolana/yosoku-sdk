/** All program error codes */
export enum PredMarketErrorCode {
  InvalidPrice = 6000,
  InvalidAmount = 6001,
  MathOverflow = 6002,
  OrderBookFull = 6003,
  InvalidOrderBookSide = 6004,
  InvalidOrderBook = 6005,
  InvalidVault = 6006,
  MarketResolved = 6007,
  InvalidMint = 6008,
  EmptyName = 6009,
  NameTooLong = 6010,
  DescriptionTooLong = 6011,
  EmptyRules = 6012,
  RulesTooLong = 6013,
  EmptyCategory = 6014,
  CategoryTooLong = 6015,
  ImageUriTooLong = 6016,
  InvalidDeadline = 6017,
  InvalidMinOrderSize = 6018,
  SlippageExceeded = 6019,
  NoLiquidity = 6020,
  MarketNotActive = 6021,
  NoFillsToClaim = 6022,
  Unauthorized = 6023,
  InsufficientShares = 6024,
  BelowMinOrderSize = 6025,
  InsufficientVaultBalance = 6026,
  InvalidTokenOwner = 6027,
  DuplicateOrderBook = 6028,
  InvariantViolation = 6029,
  OrderAlreadyFilled = 6030,
  DeadlineNotReached = 6031,
  ResolvingAlreadyRequested = 6032,
  InvalidMessageType = 6033,
  MarketNotFound = 6034,
  ResolutionNotPending = 6035,
  ProposalAlreadyExists = 6036,
  NoProposalExists = 6037,
  InvalidProposedOutcome = 6038,
  DisputeWindowExpired = 6039,
  DisputeWindowNotExpired = 6040,
  AlreadyDisputed = 6041,
  ProposalAlreadySettled = 6042,
  CannotDisputeOwnProposal = 6043,
  InvalidResolutionState = 6044,
  MarketNotResolved = 6045,
  InvalidIndex = 6046,
  MismatchedOrderBooks = 6047,
  NotMultiLegMarket = 6048,
  InvalidMarketStatus = 6049,
  OrderBookNotEmpty = 6050,
  OrderBookNotClosed = 6051,
  FillLogMismatch = 6052,
  InvalidResolverType = 6053,
  UnauthorizedVoter = 6054,
  InvalidVote = 6055,
  VotingDeadlinePassed = 6056,
  VotingFinalized = 6057,
  NoVotersSpecified = 6058,
  TooManyVoters = 6059,
  DuplicateVoter = 6060,
  MarketInfoLocked = 6061,
  MarketInfoTypeMismatch = 6062,
  MultiLegQuestionInvalidPlaceholder = 6063,
  EventDeadlineInPast = 6064,
  MarketQuestionEmpty = 6065,
  MarketInfoAlreadyUsed = 6066,
  InvalidProtocolAccount = 6067,
  InvalidReferralAccount = 6068,
  InsufficientFundsForFees = 6069,
  NoFeesToClaim = 6070,
}

const ERROR_MESSAGES: Record<number, string> = {
  [PredMarketErrorCode.InvalidPrice]: "Invalid price - must be between 1 and 999",
  [PredMarketErrorCode.InvalidAmount]: "Invalid amount - must be greater than 0",
  [PredMarketErrorCode.MathOverflow]: "Math overflow",
  [PredMarketErrorCode.OrderBookFull]: "Order book is full",
  [PredMarketErrorCode.InvalidOrderBookSide]: "Order book side does not match the requested side",
  [PredMarketErrorCode.InvalidOrderBook]: "Order book does not belong to this market",
  [PredMarketErrorCode.InvalidVault]: "Vault does not belong to this market",
  [PredMarketErrorCode.MarketResolved]: "Market has already been resolved",
  [PredMarketErrorCode.InvalidMint]: "Invalid USDC mint",
  [PredMarketErrorCode.EmptyName]: "Name cannot be empty",
  [PredMarketErrorCode.NameTooLong]: "Name exceeds maximum length of 64 characters",
  [PredMarketErrorCode.DescriptionTooLong]: "Description exceeds maximum length of 256 characters",
  [PredMarketErrorCode.EmptyRules]: "Rules cannot be empty",
  [PredMarketErrorCode.RulesTooLong]: "Rules exceeds maximum length of 512 characters",
  [PredMarketErrorCode.EmptyCategory]: "Category cannot be empty",
  [PredMarketErrorCode.CategoryTooLong]: "Category exceeds maximum length of 32 characters",
  [PredMarketErrorCode.ImageUriTooLong]: "Image URI exceeds maximum length of 128 characters",
  [PredMarketErrorCode.InvalidDeadline]: "Resolving deadline must be in the future",
  [PredMarketErrorCode.InvalidMinOrderSize]: "Minimum order size must be greater than 0",
  [PredMarketErrorCode.SlippageExceeded]: "Slippage exceeded - received fewer shares than minimum",
  [PredMarketErrorCode.NoLiquidity]: "No liquidity available",
  [PredMarketErrorCode.MarketNotActive]: "Market is not active",
  [PredMarketErrorCode.NoFillsToClaim]: "No fills to claim",
  [PredMarketErrorCode.Unauthorized]: "Unauthorized",
  [PredMarketErrorCode.InsufficientShares]: "Insufficient shares in position",
  [PredMarketErrorCode.BelowMinOrderSize]: "Order size below market minimum",
  [PredMarketErrorCode.InsufficientVaultBalance]: "Insufficient vault balance",
  [PredMarketErrorCode.InvalidTokenOwner]: "Invalid token account owner",
  [PredMarketErrorCode.DuplicateOrderBook]: "Order books must be different accounts",
  [PredMarketErrorCode.InvariantViolation]: "Invariant violation: vault balance less than shares outstanding",
  [PredMarketErrorCode.OrderAlreadyFilled]: "Order has already been filled and cannot be cancelled",
  [PredMarketErrorCode.DeadlineNotReached]: "Resolving deadline has not been reached yet",
  [PredMarketErrorCode.ResolvingAlreadyRequested]: "Resolution has already been requested for this market",
  [PredMarketErrorCode.InvalidMessageType]: "Invalid message type received",
  [PredMarketErrorCode.MarketNotFound]: "Market not found for resolution result",
  [PredMarketErrorCode.ResolutionNotPending]: "Resolution not pending for this market",
  [PredMarketErrorCode.ProposalAlreadyExists]: "A resolution proposal already exists for this market",
  [PredMarketErrorCode.NoProposalExists]: "No resolution proposal exists for this market",
  [PredMarketErrorCode.InvalidProposedOutcome]: "Invalid proposed outcome - must be 1 (Yes) or 2 (No)",
  [PredMarketErrorCode.DisputeWindowExpired]: "Dispute window has expired",
  [PredMarketErrorCode.DisputeWindowNotExpired]: "Dispute window has not expired yet",
  [PredMarketErrorCode.AlreadyDisputed]: "Resolution proposal has already been disputed",
  [PredMarketErrorCode.ProposalAlreadySettled]: "Resolution proposal has already been settled",
  [PredMarketErrorCode.CannotDisputeOwnProposal]: "Cannot dispute your own proposal",
  [PredMarketErrorCode.InvalidResolutionState]: "Invalid resolution state for this operation",
  [PredMarketErrorCode.MarketNotResolved]: "Market has not been resolved yet",
  [PredMarketErrorCode.InvalidIndex]: "Invalid market index",
  [PredMarketErrorCode.MismatchedOrderBooks]: "Order books must be from the same market leg (mismatched index)",
  [PredMarketErrorCode.NotMultiLegMarket]: "Can only add orderbook sets to MultiLeg markets",
  [PredMarketErrorCode.InvalidMarketStatus]: "Invalid market status",
  [PredMarketErrorCode.OrderBookNotEmpty]: "Order book still has active orders - cancel them first",
  [PredMarketErrorCode.OrderBookNotClosed]: "Order books must be closed before closing the market",
  [PredMarketErrorCode.FillLogMismatch]: "Fill log does not match the order book",
  [PredMarketErrorCode.InvalidResolverType]: "Invalid resolver type for this operation",
  [PredMarketErrorCode.UnauthorizedVoter]: "Voter not in authorized list",
  [PredMarketErrorCode.InvalidVote]: "Invalid vote - must be 1 (Yes) or 2 (No)",
  [PredMarketErrorCode.VotingDeadlinePassed]: "Cannot vote after resolving deadline",
  [PredMarketErrorCode.VotingFinalized]: "Voting has already been finalized",
  [PredMarketErrorCode.NoVotersSpecified]: "WalletVoteResolver requires at least one voter",
  [PredMarketErrorCode.TooManyVoters]: "Maximum 10 voters allowed",
  [PredMarketErrorCode.DuplicateVoter]: "Duplicate voter in list",
  [PredMarketErrorCode.MarketInfoLocked]: "MarketInfo is locked and cannot be modified",
  [PredMarketErrorCode.MarketInfoTypeMismatch]: "MarketInfo type does not match market creation type",
  [PredMarketErrorCode.MultiLegQuestionInvalidPlaceholder]: "MultiLeg market question must contain exactly one '___' placeholder",
  [PredMarketErrorCode.EventDeadlineInPast]: "Event deadline must be in the future",
  [PredMarketErrorCode.MarketQuestionEmpty]: "Market question cannot be empty",
  [PredMarketErrorCode.MarketInfoAlreadyUsed]: "MarketInfo has already been used for a market",
  [PredMarketErrorCode.InvalidProtocolAccount]: "Invalid protocol treasury account",
  [PredMarketErrorCode.InvalidReferralAccount]: "Invalid referral account - must be a valid USDC token account",
  [PredMarketErrorCode.InsufficientFundsForFees]: "Insufficient funds to cover fees",
  [PredMarketErrorCode.NoFeesToClaim]: "Creator vault is empty - no fees to claim",
};

export class PredMarketError extends Error {
  readonly code: number;
  readonly errorName: string;

  constructor(code: number, message: string, errorName: string) {
    super(message);
    this.name = "PredMarketError";
    this.code = code;
    this.errorName = errorName;
  }
}

/**
 * Extract and enrich a program error from an Anchor error.
 * Returns a typed PredMarketError if the error is a known program error, null otherwise.
 */
export function parsePredMarketError(error: unknown): PredMarketError | null {
  if (error == null || typeof error !== "object") return null;

  // Anchor wraps errors with a .error.errorCode.number
  const err = error as any;
  let code: number | undefined;

  if (err.error?.errorCode?.number != null) {
    code = err.error.errorCode.number;
  } else if (err.code != null && typeof err.code === "number") {
    code = err.code;
  }

  if (code == null) return null;

  const message = ERROR_MESSAGES[code];
  if (!message) return null;

  const errorName =
    PredMarketErrorCode[code as PredMarketErrorCode] ?? `Unknown(${code})`;
  return new PredMarketError(code, message, errorName);
}
