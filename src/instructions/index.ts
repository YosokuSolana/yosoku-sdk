export { MarketModule } from "./market-creation";
export type {
  CreateRegularMarketParams,
  CreateMultiLegMarketParams,
  AddLegParams,
} from "./market-creation";

export { MarketInfoModule } from "./market-info";
export type { CreateMarketInfoParams, CreateMarketInfoResult } from "./market-info";

export { TradingModule } from "./trading";
export type {
  LimitBidParams,
  LimitAskParams,
  CoveredBidParams,
  MarketBuyParams,
  MarketSellParams,
} from "./trading";

export { PositionModule } from "./positions";
export type {
  ClaimPositionParams,
  MergeSharesParams,
  CancelOrderParams,
  RedeemPositionParams,
} from "./positions";

export { ResolutionModule } from "./resolution";
export type {
  ProposeResolutionParams,
  FinalizeResolutionParams,
  ClaimDisputeWinningsParams,
} from "./resolution";

export { VoteResolutionModule } from "./vote-resolution";
export type { VoteResolutionParams } from "./vote-resolution";

export { AdminModule } from "./admin";
