# Price System

## Ticks

Yosoku uses a **tick-based** pricing system. Prices are integers from **1 to 999**, where each tick equals $0.001.

The YES and NO sides of any market always sum to **1000 ticks ($1.00)**. If YES is at 400 ($0.40), NO is at 600 ($0.60).

## USDC

All USDC amounts use **6 decimal places** (1 USDC = 1,000,000 base units).

One share at tick 500 costs **500,000 base units** ($0.50).

## Utility Functions

All functions are exported from the `yosoku` package:

```ts
import {
  costPerShare,
  usdcToShares,
  sharesToUsdc,
  complementPrice,
  tickToPrice,
  priceToTick,
  isValidPrice,
  formatUsdc,
  parseUsdc,
  FULL_PRICE,
  HALF_PRICE,
} from "yosoku";
```

### costPerShare

Returns the USDC base units required for one share at a given tick.

```ts
costPerShare(500)   // 500_000n
costPerShare(100)   // 100_000n
costPerShare(999)   // 999_000n
```

### usdcToShares

How many whole shares you can buy with a given USDC amount.

```ts
usdcToShares(100_000_000n, 500)   // 200n  (100 USDC at $0.50 = 200 shares)
usdcToShares(10_000_000n, 250)    // 40n   (10 USDC at $0.25 = 40 shares)
```

### sharesToUsdc

Total USDC cost for a given number of shares.

```ts
sharesToUsdc(200n, 500)   // 100_000_000n  (200 shares at $0.50 = 100 USDC)
sharesToUsdc(100n, 300)   // 30_000_000n   (100 shares at $0.30 = 30 USDC)
```

### complementPrice

The opposite side's tick price. YES + NO = 1000.

```ts
complementPrice(300)   // 700
complementPrice(500)   // 500
complementPrice(900)   // 100
```

### tickToPrice / priceToTick

Convert between ticks and dollar amounts.

```ts
tickToPrice(500)   // 0.5
tickToPrice(750)   // 0.75
priceToTick(0.5)   // 500
priceToTick(0.33)  // 330
```

### isValidPrice

Check if a tick is in the valid range (1-999, integer).

```ts
isValidPrice(500)    // true
isValidPrice(0)      // false
isValidPrice(1000)   // false
isValidPrice(3.5)    // false
```

### formatUsdc / parseUsdc

Convert between USDC base units and display strings.

```ts
formatUsdc(1_500_000n)         // "$1.50"
formatUsdc(new BN(250_000))    // "$0.25"    (accepts BN too)
formatUsdc(0n)                 // "$0.00"

parseUsdc("$1.50")             // 1_500_000n
parseUsdc("1.50")              // 1_500_000n (dollar sign optional)
parseUsdc(1.5)                 // 1_500_000n (accepts numbers too)
```

## Constants

```ts
FULL_PRICE   // 1000 — YES + NO always equals this
HALF_PRICE   // 500  — used for split outcomes ($0.50)
```
