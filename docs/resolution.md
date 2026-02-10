# Resolution

Markets can be resolved through two mechanisms: **UMA resolution** (default) or **wallet vote**. The mechanism is set at market creation via the `resolverType` parameter.

## UMA Resolution

The default resolution path. Anyone can propose an outcome after the event deadline passes. The proposal enters a 24-hour dispute window before finalization.

### Propose

```ts
// Must be after the market's eventDeadline
await client.resolution.proposeResolution({
  market: marketPda,
  proposedOutcome: "yes",  // "yes" or "no"
  // index: 0,             // leg index
});
```

This deposits a **100 USDC bond** (`PROPOSER_BOND`). The bond is returned when the proposal finalizes without dispute.

### Finalize

After the 24-hour dispute window expires, anyone can finalize.

```ts
await client.resolution.finalizeResolution(marketPda);
// or with specific leg:
await client.resolution.finalizeResolution(marketPda, 0);
```

The market status changes to `"resolved"` and the winning side is set. The proposer's bond is returned.

Throws `DisputeWindowNotExpired` (6040) if called too early.

### Claim Dispute Winnings

After a disputed resolution settles, the winner can claim their bond winnings.

```ts
await client.resolution.claimDisputeWinnings(marketPda);
```

### Resolve Expired Market

If the deadline passes and nobody proposes a resolution, anyone can resolve the market to a **50/50 split**.

```ts
await client.resolution.resolveExpiredMarket(marketPda);
```

Both YES and NO shares redeem at $0.50 each.

### Timeline

```
Event deadline passes
       │
       ├─ Someone proposes → 24h dispute window
       │                          │
       │                    ├─ No dispute → Finalize → Market resolved
       │                    │
       │                    └─ Dispute filed (200 USDC bond)
       │                          │
       │                          └─ Settlement → Winner claims bonds
       │
       └─ Nobody proposes → resolveExpiredMarket → Split (50/50)
```

## Wallet Vote Resolution

For markets created with `resolverType: { type: "walletVote", voters: [...] }`.

### Vote

Authorized voters cast their vote:

```ts
await voterClient.voteResolution.voteResolution({
  market: marketPda,
  vote: "yes",  // "yes" or "no"
  // index: 0,
});
```

Only wallets in the `voters` list can vote. Throws `UnauthorizedVoter` (6054) otherwise.

### Auto-Finalization

The market auto-resolves as soon as a **majority** is reached. For example, if 3 voters are registered and 2 vote YES, the market immediately resolves to YES.

### Finalize After Deadline

If the voting deadline passes without a majority, anyone can finalize to a split:

```ts
await client.voteResolution.finalizeVoteResolution(marketPda);
```

Throws `VotingDeadlinePassed` (6056) if someone tries to vote after the deadline.

### Reading Vote State

```ts
const voteState = await client.accounts.getVoteState(marketPda);
if (voteState) {
  console.log(`YES: ${voteState.yesVotes}, NO: ${voteState.noVotes}`);
  console.log(`Finalized: ${voteState.isFinalized}`);
  for (const record of voteState.votes) {
    console.log(`${record.voter.toBase58()}: ${record.vote}`);
  }
}
```

## Checking Resolution State

```ts
const market = await client.accounts.getMarket(marketPda);
const leg = market.legs[0];

console.log(leg.status);         // "active" | "paused" | "resolved"
console.log(leg.winningSide);    // "yes" | "no" | "none" | "split"
console.log(leg.resolvingState); // "notStarted" | "proposed" | "disputed" | "completed"

// UMA proposal details
const proposal = await client.accounts.getResolutionProposal(marketPda);
if (proposal) {
  console.log(proposal.proposedOutcome);  // "yes" | "no"
  console.log(proposal.proposedAt);       // Date
  console.log(proposal.isSettled);        // boolean
}
```

## Constants

```ts
import { PROPOSER_BOND, DISPUTER_BOND, DISPUTE_WINDOW_SECONDS } from "yosoku";

PROPOSER_BOND           // 100_000_000n (100 USDC)
DISPUTER_BOND           // 200_000_000n (200 USDC)
DISPUTE_WINDOW_SECONDS  // 86400 (24 hours)
```
