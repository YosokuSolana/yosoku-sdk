# Error Handling

## Parsing Errors

Use `parsePredMarketError` to extract typed error information from any Anchor error.

```ts
import { parsePredMarketError, PredMarketErrorCode } from "yosoku";

try {
  await client.trading.limitBid({ ... });
} catch (err) {
  const parsed = parsePredMarketError(err);
  if (parsed) {
    console.log(parsed.code);       // 6019
    console.log(parsed.errorName);  // "SlippageExceeded"
    console.log(parsed.message);    // "Slippage exceeded - received fewer shares than minimum"
  } else {
    // Not a program error (network issue, etc.)
    throw err;
  }
}
```

`parsePredMarketError` returns `null` if the error isn't a known program error.

## Checking Specific Errors

```ts
const parsed = parsePredMarketError(err);
if (parsed?.code === PredMarketErrorCode.SlippageExceeded) {
  // Handle slippage
}

switch (parsed?.code) {
  case PredMarketErrorCode.NoLiquidity:
    console.log("Order book is empty");
    break;
  case PredMarketErrorCode.InsufficientShares:
    console.log("Not enough shares");
    break;
  default:
    console.log(parsed?.message);
}
```

## PredMarketError Class

```ts
class PredMarketError extends Error {
  code: number;        // Numeric error code (6000-6070)
  errorName: string;   // Enum name (e.g., "SlippageExceeded")
  message: string;     // Human-readable message
}
```

## All Error Codes

| Code | Name | Message |
|------|------|---------|
| 6000 | InvalidPrice | Invalid price - must be between 1 and 999 |
| 6001 | InvalidAmount | Invalid amount - must be greater than 0 |
| 6002 | MathOverflow | Math overflow |
| 6003 | OrderBookFull | Order book is full |
| 6004 | InvalidOrderBookSide | Order book side does not match the requested side |
| 6005 | InvalidOrderBook | Order book does not belong to this market |
| 6006 | InvalidVault | Vault does not belong to this market |
| 6007 | MarketResolved | Market has already been resolved |
| 6008 | InvalidMint | Invalid USDC mint |
| 6009 | EmptyName | Name cannot be empty |
| 6010 | NameTooLong | Name exceeds maximum length of 64 characters |
| 6011 | DescriptionTooLong | Description exceeds maximum length of 256 characters |
| 6012 | EmptyRules | Rules cannot be empty |
| 6013 | RulesTooLong | Rules exceeds maximum length of 512 characters |
| 6014 | EmptyCategory | Category cannot be empty |
| 6015 | CategoryTooLong | Category exceeds maximum length of 32 characters |
| 6016 | ImageUriTooLong | Image URI exceeds maximum length of 128 characters |
| 6017 | InvalidDeadline | Resolving deadline must be in the future |
| 6018 | InvalidMinOrderSize | Minimum order size must be greater than 0 |
| 6019 | SlippageExceeded | Slippage exceeded - received fewer shares than minimum |
| 6020 | NoLiquidity | No liquidity available |
| 6021 | MarketNotActive | Market is not active |
| 6022 | NoFillsToClaim | No fills to claim |
| 6023 | Unauthorized | Unauthorized |
| 6024 | InsufficientShares | Insufficient shares in position |
| 6025 | BelowMinOrderSize | Order size below market minimum |
| 6026 | InsufficientVaultBalance | Insufficient vault balance |
| 6027 | InvalidTokenOwner | Invalid token account owner |
| 6028 | DuplicateOrderBook | Order books must be different accounts |
| 6029 | InvariantViolation | Invariant violation: vault balance less than shares outstanding |
| 6030 | OrderAlreadyFilled | Order has already been filled and cannot be cancelled |
| 6031 | DeadlineNotReached | Resolving deadline has not been reached yet |
| 6032 | ResolvingAlreadyRequested | Resolution has already been requested for this market |
| 6033 | InvalidMessageType | Invalid message type received |
| 6034 | MarketNotFound | Market not found for resolution result |
| 6035 | ResolutionNotPending | Resolution not pending for this market |
| 6036 | ProposalAlreadyExists | A resolution proposal already exists for this market |
| 6037 | NoProposalExists | No resolution proposal exists for this market |
| 6038 | InvalidProposedOutcome | Invalid proposed outcome - must be 1 (Yes) or 2 (No) |
| 6039 | DisputeWindowExpired | Dispute window has expired |
| 6040 | DisputeWindowNotExpired | Dispute window has not expired yet |
| 6041 | AlreadyDisputed | Resolution proposal has already been disputed |
| 6042 | ProposalAlreadySettled | Resolution proposal has already been settled |
| 6043 | CannotDisputeOwnProposal | Cannot dispute your own proposal |
| 6044 | InvalidResolutionState | Invalid resolution state for this operation |
| 6045 | MarketNotResolved | Market has not been resolved yet |
| 6046 | InvalidIndex | Invalid market index |
| 6047 | MismatchedOrderBooks | Order books must be from the same market leg |
| 6048 | NotMultiLegMarket | Can only add orderbook sets to MultiLeg markets |
| 6049 | InvalidMarketStatus | Invalid market status |
| 6050 | OrderBookNotEmpty | Order book still has active orders - cancel them first |
| 6051 | OrderBookNotClosed | Order books must be closed before closing the market |
| 6052 | FillLogMismatch | Fill log does not match the order book |
| 6053 | InvalidResolverType | Invalid resolver type for this operation |
| 6054 | UnauthorizedVoter | Voter not in authorized list |
| 6055 | InvalidVote | Invalid vote - must be 1 (Yes) or 2 (No) |
| 6056 | VotingDeadlinePassed | Cannot vote after resolving deadline |
| 6057 | VotingFinalized | Voting has already been finalized |
| 6058 | NoVotersSpecified | WalletVoteResolver requires at least one voter |
| 6059 | TooManyVoters | Maximum 10 voters allowed |
| 6060 | DuplicateVoter | Duplicate voter in list |
| 6061 | MarketInfoLocked | MarketInfo is locked and cannot be modified |
| 6062 | MarketInfoTypeMismatch | MarketInfo type does not match market creation type |
| 6063 | MultiLegQuestionInvalidPlaceholder | MultiLeg market question must contain exactly one '___' placeholder |
| 6064 | EventDeadlineInPast | Event deadline must be in the future |
| 6065 | MarketQuestionEmpty | Market question cannot be empty |
| 6066 | MarketInfoAlreadyUsed | MarketInfo has already been used for a market |
| 6067 | InvalidProtocolAccount | Invalid protocol treasury account |
| 6068 | InvalidReferralAccount | Invalid referral account - must be a valid USDC token account |
| 6069 | InsufficientFundsForFees | Insufficient funds to cover fees |
| 6070 | NoFeesToClaim | Creator vault is empty - no fees to claim |
