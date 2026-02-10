/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pred_market.json`.
 */
export type PredMarket = {
  "address": "8p6MKtMGGugZMy2HGXtL3uBb11y7xuzXmbMbQgNmWVUQ",
  "metadata": {
    "name": "predMarket",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addOrderbookSetToMarket",
      "discriminator": [
        14,
        129,
        68,
        220,
        73,
        183,
        76,
        29
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "Order book for YES side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "noOrderBook",
          "docs": [
            "Order book for NO side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "Fill log for YES side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "Fill log for NO side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault for this leg (seeded by index)"
          ],
          "writable": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "addOrderbookSetParams"
            }
          }
        }
      ]
    },
    {
      "name": "adminCloseAccount",
      "docs": [
        "Close any program-owned account (for cleaning up old/incompatible accounts)",
        "Only the admin can call this instruction"
      ],
      "discriminator": [
        131,
        60,
        75,
        215,
        109,
        34,
        157,
        26
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "accountToClose",
          "docs": [
            "The account to close - must be owned by this program"
          ],
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "adminMigrateMarket",
      "docs": [
        "Migrate market data from old format (with resolving_deadline) to new format",
        "Only the admin can call this instruction"
      ],
      "discriminator": [
        203,
        217,
        127,
        253,
        222,
        155,
        220,
        22
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The market account to migrate"
          ],
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "appendDescription",
      "docs": [
        "Append to the description"
      ],
      "discriminator": [
        8,
        130,
        90,
        79,
        96,
        127,
        30,
        49
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "chunk",
          "type": "string"
        }
      ]
    },
    {
      "name": "appendMarketQuestion",
      "docs": [
        "Append to the market question"
      ],
      "discriminator": [
        112,
        120,
        124,
        234,
        222,
        159,
        28,
        233
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "chunk",
          "type": "string"
        }
      ]
    },
    {
      "name": "appendRules",
      "docs": [
        "Append to the rules"
      ],
      "discriminator": [
        130,
        43,
        72,
        96,
        141,
        180,
        52,
        46
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "chunk",
          "type": "string"
        }
      ]
    },
    {
      "name": "cancelOrder",
      "discriminator": [
        95,
        129,
        237,
        240,
        8,
        49,
        223,
        132
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "writable": true
        },
        {
          "name": "noOrderBook",
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "YES fill log - validated in handler"
          ]
        },
        {
          "name": "noFillLog",
          "docs": [
            "NO fill log - validated in handler"
          ]
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "yesPosition",
          "docs": [
            "YES position - receives shares back when cancelling NO bid (CoveredBy::Shares)"
          ],
          "writable": true
        },
        {
          "name": "noPosition",
          "docs": [
            "NO position - receives shares back when cancelling YES bid (CoveredBy::Shares)"
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claimCreatorFees",
      "docs": [
        "Claim accumulated creator fees from the creator vault",
        "Only the market creator can call this instruction"
      ],
      "discriminator": [
        0,
        23,
        125,
        234,
        156,
        118,
        134,
        89
      ],
      "accounts": [
        {
          "name": "creator",
          "docs": [
            "Market creator - must sign"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "Market account - verifies creator and provides PDA signing authority"
          ]
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault (fee accumulator)"
          ],
          "writable": true
        },
        {
          "name": "creatorAta",
          "docs": [
            "Creator's USDC ATA (destination)"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "claimDisputeWinnings",
      "docs": [
        "Claim dispute winnings after UMA resolution",
        "The winner (proposer or disputer) receives the total bonds minus protocol fee"
      ],
      "discriminator": [
        5,
        18,
        8,
        42,
        42,
        171,
        44,
        42
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Anyone can call this (permissionless), but funds go to winner"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The resolved market"
          ]
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "resolutionProposal",
          "docs": [
            "The resolution proposal"
          ],
          "writable": true
        },
        {
          "name": "bondVault",
          "docs": [
            "Bond vault holding the bonds"
          ],
          "writable": true
        },
        {
          "name": "winnerTokenAccount",
          "docs": [
            "Winner's USDC token account to receive payout"
          ],
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "Treasury USDC token account to receive protocol fee"
          ],
          "writable": true
        },
        {
          "name": "usdcMint",
          "docs": [
            "USDC mint"
          ]
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claimPosition",
      "discriminator": [
        168,
        90,
        89,
        44,
        203,
        246,
        210,
        46
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "yesOrderBook"
        },
        {
          "name": "noOrderBook"
        },
        {
          "name": "yesFillLog",
          "docs": [
            "YES fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "NO fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "userPosition",
          "docs": [
            "User's position for this order's side (only needed for CoveredBy::Usdc)"
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closeMarket",
      "docs": [
        "Close a market's vault and market account",
        "Only the market creator or admin can call this instruction",
        "Orderbooks must be closed first via close_orderbook"
      ],
      "discriminator": [
        88,
        154,
        248,
        186,
        48,
        14,
        123,
        244
      ],
      "accounts": [
        {
          "name": "caller",
          "docs": [
            "Creator or admin"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault to close"
          ],
          "writable": true
        },
        {
          "name": "callerAta",
          "docs": [
            "Caller's USDC ATA to receive any remaining vault funds"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closeOrderbook",
      "docs": [
        "Close an order book after market resolution",
        "Only the market creator or admin can call this instruction",
        "Requires market is resolved and order_count == 0"
      ],
      "discriminator": [
        195,
        216,
        135,
        205,
        50,
        240,
        187,
        46
      ],
      "accounts": [
        {
          "name": "caller",
          "docs": [
            "Creator or admin"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market"
        },
        {
          "name": "orderBook",
          "docs": [
            "Order book to close - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "orderSide"
            }
          }
        }
      ]
    },
    {
      "name": "coveredBid",
      "discriminator": [
        150,
        97,
        199,
        104,
        81,
        80,
        60,
        41
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault for this leg - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault - receives creator fees on fills"
          ],
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "YES fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "NO fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "protocolTreasury",
          "docs": [
            "Protocol treasury - receives protocol fees on fills"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "yesPosition",
          "docs": [
            "YES position - receives shares when buying YES, used as collateral when bidding NO"
          ],
          "writable": true
        },
        {
          "name": "noPosition",
          "docs": [
            "NO position - receives shares when buying NO, used as collateral when bidding YES"
          ],
          "writable": true
        },
        {
          "name": "referralAccount"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "orderSide"
            }
          }
        },
        {
          "name": "price",
          "type": "u16"
        },
        {
          "name": "shares",
          "type": "u64"
        },
        {
          "name": "seed",
          "type": "u32"
        },
        {
          "name": "coveredBy",
          "type": {
            "defined": {
              "name": "coveredBy"
            }
          }
        },
        {
          "name": "matchExisting",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createMarketInfo",
      "docs": [
        "Create a new MarketInfo account with required fields"
      ],
      "discriminator": [
        126,
        213,
        167,
        67,
        10,
        162,
        90,
        208
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "marketType",
          "type": {
            "defined": {
              "name": "marketInfoType"
            }
          }
        },
        {
          "name": "resolverType",
          "type": {
            "defined": {
              "name": "resolverType"
            }
          }
        }
      ]
    },
    {
      "name": "createMultilegMarket",
      "discriminator": [
        46,
        62,
        255,
        42,
        105,
        130,
        7,
        123
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing market metadata (description, rules, resolver_type, etc.)",
            "Must not be locked and must have market_type == MultiLeg with \"___\" in question"
          ],
          "writable": true
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault for fee accumulation"
          ],
          "writable": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createMarketParams"
            }
          }
        }
      ]
    },
    {
      "name": "createRegularMarket",
      "discriminator": [
        185,
        64,
        59,
        119,
        123,
        57,
        2,
        99
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing market metadata (description, rules, resolver_type, etc.)",
            "Must not be locked and must have market_type == Regular"
          ],
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "Order book for YES side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "noOrderBook",
          "docs": [
            "Order book for NO side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "Fill log for YES side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "Fill log for NO side - must be pre-created by client with correct size"
          ],
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault for this market (index 0 for regular markets)"
          ],
          "writable": true
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault for fee accumulation"
          ],
          "writable": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createMarketParams"
            }
          }
        }
      ]
    },
    {
      "name": "disputeResolution",
      "docs": [
        "Dispute a resolution proposal (escalate to UMA via LayerZero)",
        "Disputer posts a higher bond and the market is sent to UMA for final resolution"
      ],
      "discriminator": [
        89,
        169,
        106,
        71,
        131,
        77,
        122,
        232
      ],
      "accounts": [
        {
          "name": "disputer",
          "docs": [
            "The disputer submitting the dispute"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The market being disputed (boxed to reduce stack size)"
          ],
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing resolver_type and rules"
          ]
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "resolutionProposal",
          "docs": [
            "The resolution proposal being disputed"
          ],
          "writable": true
        },
        {
          "name": "bondVault",
          "docs": [
            "Bond vault holding the proposer's bond"
          ],
          "writable": true
        },
        {
          "name": "disputerTokenAccount",
          "docs": [
            "Disputer's USDC token account"
          ],
          "writable": true
        },
        {
          "name": "usdcMint",
          "docs": [
            "USDC mint"
          ]
        },
        {
          "name": "peer"
        },
        {
          "name": "store"
        },
        {
          "name": "endpoint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "disputeResolutionParams"
            }
          }
        }
      ]
    },
    {
      "name": "finalizeResolution",
      "docs": [
        "Finalize a resolution after dispute window expires (no dispute)",
        "Returns the proposer's bond and resolves the market to the proposed outcome"
      ],
      "discriminator": [
        191,
        74,
        94,
        214,
        45,
        150,
        152,
        125
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Anyone can call finalize after dispute window expires"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The market being finalized"
          ],
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing resolver_type"
          ]
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "resolutionProposal",
          "docs": [
            "The resolution proposal"
          ],
          "writable": true
        },
        {
          "name": "bondVault",
          "docs": [
            "Bond vault holding the proposer's bond"
          ],
          "writable": true
        },
        {
          "name": "proposerTokenAccount",
          "docs": [
            "Proposer's USDC token account to receive bond back"
          ],
          "writable": true
        },
        {
          "name": "usdcMint",
          "docs": [
            "USDC mint"
          ]
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "finalizeVoteResolution",
      "docs": [
        "Finalize vote resolution after deadline passes (WalletVoteResolver markets only)",
        "Anyone can call - resolves to 50/50 Split if no majority reached"
      ],
      "discriminator": [
        20,
        1,
        225,
        67,
        222,
        210,
        227,
        122
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Anyone can finalize after deadline"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The market to finalize"
          ],
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing resolver_type"
          ]
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "voteState",
          "docs": [
            "Vote state account - must exist (initialized during voting)"
          ],
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initLzStore",
      "docs": [
        "Initialize the LayerZero OApp store"
      ],
      "discriminator": [
        12,
        217,
        241,
        53,
        30,
        39,
        95,
        98
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "store",
          "writable": true
        },
        {
          "name": "lzReceiveTypesAccounts",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initLzStoreParams"
            }
          }
        }
      ]
    },
    {
      "name": "limitAsk",
      "discriminator": [
        59,
        245,
        60,
        64,
        14,
        83,
        233,
        164
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault for this leg - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault - receives creator fees on fills"
          ],
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "YES fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "NO fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "protocolTreasury",
          "docs": [
            "Protocol treasury - receives protocol fees on fills"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "yesPosition",
          "docs": [
            "YES position - receives shares when buying YES, used as collateral when bidding NO"
          ],
          "writable": true
        },
        {
          "name": "noPosition",
          "docs": [
            "NO position - receives shares when buying NO, used as collateral when bidding YES"
          ],
          "writable": true
        },
        {
          "name": "referralAccount"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "orderSide"
            }
          }
        },
        {
          "name": "price",
          "type": "u16"
        },
        {
          "name": "shares",
          "type": "u64"
        },
        {
          "name": "seed",
          "type": "u32"
        },
        {
          "name": "matchExisting",
          "type": "bool"
        }
      ]
    },
    {
      "name": "limitBid",
      "discriminator": [
        188,
        78,
        103,
        36,
        196,
        147,
        156,
        31
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault for this leg - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault - receives creator fees on fills"
          ],
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "YES fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "NO fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "protocolTreasury",
          "docs": [
            "Protocol treasury - receives protocol fees on fills"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "yesPosition",
          "docs": [
            "YES position - receives shares when buying YES, used as collateral when bidding NO"
          ],
          "writable": true
        },
        {
          "name": "noPosition",
          "docs": [
            "NO position - receives shares when buying NO, used as collateral when bidding YES"
          ],
          "writable": true
        },
        {
          "name": "referralAccount"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "orderSide"
            }
          }
        },
        {
          "name": "price",
          "type": "u16"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "seed",
          "type": "u32"
        },
        {
          "name": "matchExisting",
          "type": "bool"
        }
      ]
    },
    {
      "name": "lzQuoteSend",
      "docs": [
        "Get quote for sending a cross-chain message"
      ],
      "discriminator": [
        41,
        213,
        186,
        170,
        231,
        239,
        137,
        64
      ],
      "accounts": [
        {
          "name": "store"
        },
        {
          "name": "peer"
        },
        {
          "name": "endpoint"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "lzQuoteSendParams"
            }
          }
        }
      ],
      "returns": {
        "defined": {
          "name": "messagingFee"
        }
      }
    },
    {
      "name": "lzReceive",
      "docs": [
        "Handler for processing incoming cross-chain messages"
      ],
      "discriminator": [
        8,
        179,
        120,
        109,
        33,
        118,
        189,
        80
      ],
      "accounts": [
        {
          "name": "store",
          "writable": true
        },
        {
          "name": "peer"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "lzReceiveParams"
            }
          }
        }
      ]
    },
    {
      "name": "lzReceiveTypes",
      "docs": [
        "Handler that returns the list of accounts required to execute lz_receive"
      ],
      "discriminator": [
        221,
        17,
        246,
        159,
        248,
        128,
        31,
        96
      ],
      "accounts": [
        {
          "name": "store"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "lzReceiveParams"
            }
          }
        }
      ],
      "returns": {
        "vec": {
          "defined": {
            "name": "lzAccount"
          }
        }
      }
    },
    {
      "name": "lzResolveMarket",
      "docs": [
        "Request market resolution via cross-chain message",
        "Sends market pubkey, index, and rules to the destination chain for resolution"
      ],
      "discriminator": [
        139,
        28,
        240,
        121,
        199,
        58,
        67,
        50
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Anyone can request UMA resolution at any time"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The market to request resolution for"
          ],
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing rules"
          ]
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "peer"
        },
        {
          "name": "store"
        },
        {
          "name": "endpoint"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "lzResolveMarketParams"
            }
          }
        }
      ]
    },
    {
      "name": "marketBuy",
      "discriminator": [
        90,
        236,
        106,
        220,
        221,
        81,
        108,
        140
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault for this leg - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "YES fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "NO fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault - receives creator fee"
          ],
          "writable": true
        },
        {
          "name": "protocolTreasury",
          "docs": [
            "Protocol treasury - receives protocol fee"
          ],
          "writable": true
        },
        {
          "name": "referralAccount",
          "docs": [
            "Referral account - optional (pass system program to skip)",
            "When this is a valid token account, it must be passed as writable from the client."
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "userPosition",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "orderSide"
            }
          }
        },
        {
          "name": "maxUsdc",
          "type": "u64"
        },
        {
          "name": "minShares",
          "type": "u64"
        }
      ]
    },
    {
      "name": "marketSell",
      "discriminator": [
        11,
        224,
        159,
        119,
        129,
        127,
        145,
        237
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Vault for this leg - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "yesFillLog",
          "docs": [
            "YES fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "noFillLog",
          "docs": [
            "NO fill log - validated in handler"
          ],
          "writable": true
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "creatorVault",
          "docs": [
            "Creator vault - receives creator fee"
          ],
          "writable": true
        },
        {
          "name": "protocolTreasury",
          "docs": [
            "Protocol treasury - receives protocol fee"
          ],
          "writable": true
        },
        {
          "name": "referralAccount",
          "docs": [
            "Referral account - optional (pass system program to skip)",
            "When this is a valid token account, it must be passed as writable from the client."
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        },
        {
          "name": "userPosition",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "orderSide"
            }
          }
        },
        {
          "name": "shares",
          "type": "u64"
        },
        {
          "name": "minUsdc",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mergeShares",
      "discriminator": [
        236,
        47,
        171,
        1,
        210,
        167,
        204,
        0
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "yesOrderBook"
        },
        {
          "name": "noOrderBook"
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "yesPosition",
          "writable": true
        },
        {
          "name": "noPosition",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proposeResolution",
      "docs": [
        "Propose a resolution for a market (first tier)",
        "Anyone can propose at any time after market creation with a USDC bond"
      ],
      "discriminator": [
        19,
        68,
        181,
        23,
        194,
        146,
        152,
        252
      ],
      "accounts": [
        {
          "name": "proposer",
          "docs": [
            "The proposer submitting the resolution"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The market to propose resolution for"
          ],
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing resolver_type"
          ]
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "resolutionProposal",
          "docs": [
            "The resolution proposal account (PDA)"
          ],
          "writable": true
        },
        {
          "name": "bondVault",
          "docs": [
            "Bond vault to hold proposer and disputer bonds"
          ],
          "writable": true
        },
        {
          "name": "proposerTokenAccount",
          "docs": [
            "Proposer's USDC token account"
          ],
          "writable": true
        },
        {
          "name": "usdcMint",
          "docs": [
            "USDC mint"
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "proposeResolutionParams"
            }
          }
        }
      ]
    },
    {
      "name": "redeemPosition",
      "docs": [
        "Redeem a position after market resolution",
        "Winners receive $1.00 per share, losers receive $0",
        "Split outcome: all shares receive $0.50 each",
        "Position account is closed after redemption"
      ],
      "discriminator": [
        51,
        138,
        49,
        229,
        33,
        216,
        19,
        97
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "position",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "removeMarketInfo",
      "docs": [
        "Remove/close MarketInfo account (only when not locked)"
      ],
      "discriminator": [
        102,
        39,
        28,
        177,
        126,
        56,
        33,
        181
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "resolveExpiredMarket",
      "docs": [
        "Resolve an expired market to a 50/50 split",
        "Anyone can call this after the deadline if no proposal exists",
        "Both YES and NO shares will redeem at $0.50 each"
      ],
      "discriminator": [
        117,
        81,
        156,
        211,
        195,
        11,
        70,
        194
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setDescription",
      "docs": [
        "Set the description (replaces existing)"
      ],
      "discriminator": [
        234,
        4,
        121,
        243,
        47,
        60,
        8,
        236
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "setLzPeerConfig",
      "docs": [
        "Admin instruction to set or update cross-chain peer configuration"
      ],
      "discriminator": [
        195,
        23,
        146,
        164,
        165,
        236,
        21,
        120
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "peer",
          "writable": true
        },
        {
          "name": "store"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "setLzPeerConfigParams"
            }
          }
        }
      ]
    },
    {
      "name": "setMarketQuestion",
      "docs": [
        "Set the market question (replaces existing)"
      ],
      "discriminator": [
        204,
        210,
        3,
        56,
        222,
        5,
        254,
        31
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        }
      ]
    },
    {
      "name": "setMarketType",
      "docs": [
        "Set the market type (Regular or MultiLeg)"
      ],
      "discriminator": [
        82,
        91,
        95,
        4,
        183,
        89,
        89,
        5
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "marketType",
          "type": {
            "defined": {
              "name": "marketInfoType"
            }
          }
        }
      ]
    },
    {
      "name": "setResolverType",
      "docs": [
        "Set the resolver type (UmaResolver or WalletVoteResolver)"
      ],
      "discriminator": [
        178,
        72,
        177,
        36,
        149,
        106,
        53,
        148
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "resolverType",
          "type": {
            "defined": {
              "name": "resolverType"
            }
          }
        }
      ]
    },
    {
      "name": "setRules",
      "docs": [
        "Set the rules (replaces existing)"
      ],
      "discriminator": [
        66,
        148,
        196,
        43,
        232,
        210,
        174,
        169
      ],
      "accounts": [
        {
          "name": "marketInfo",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "rules",
          "type": "string"
        }
      ]
    },
    {
      "name": "verifyMarket",
      "docs": [
        "Toggle verification status of a market",
        "Only the authorized verifier can call this instruction"
      ],
      "discriminator": [
        117,
        131,
        234,
        199,
        26,
        123,
        63,
        62
      ],
      "accounts": [
        {
          "name": "verifier",
          "docs": [
            "Verifier must match the constant VERIFIER_PUBKEY"
          ],
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "voteResolution",
      "docs": [
        "Cast or change a vote on market resolution (WalletVoteResolver markets only)",
        "Auto-finalizes when majority (>50%) is reached"
      ],
      "discriminator": [
        137,
        137,
        237,
        83,
        15,
        30,
        101,
        248
      ],
      "accounts": [
        {
          "name": "voter",
          "docs": [
            "The voter casting a vote"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "docs": [
            "The market being voted on"
          ],
          "writable": true
        },
        {
          "name": "marketInfo",
          "docs": [
            "MarketInfo account containing resolver_type and voter list"
          ]
        },
        {
          "name": "yesOrderBook",
          "docs": [
            "YES order book (for index validation)"
          ]
        },
        {
          "name": "noOrderBook",
          "docs": [
            "NO order book (for index validation)"
          ]
        },
        {
          "name": "voteState",
          "docs": [
            "Vote state account (PDA) - initialized on first vote"
          ],
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "voteResolutionParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "endpointSettings",
      "discriminator": [
        221,
        232,
        73,
        56,
        10,
        66,
        72,
        14
      ]
    },
    {
      "name": "fillLog",
      "discriminator": [
        117,
        168,
        16,
        123,
        102,
        249,
        153,
        9
      ]
    },
    {
      "name": "lzReceiveTypesAccounts",
      "discriminator": [
        248,
        87,
        167,
        117,
        5,
        251,
        21,
        126
      ]
    },
    {
      "name": "lzStore",
      "discriminator": [
        180,
        175,
        185,
        198,
        25,
        242,
        68,
        31
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "marketInfo",
      "discriminator": [
        221,
        22,
        29,
        59,
        10,
        180,
        8,
        190
      ]
    },
    {
      "name": "order",
      "discriminator": [
        134,
        173,
        223,
        185,
        77,
        86,
        28,
        51
      ]
    },
    {
      "name": "orderBook",
      "discriminator": [
        55,
        230,
        125,
        218,
        149,
        39,
        65,
        248
      ]
    },
    {
      "name": "peerConfig",
      "discriminator": [
        181,
        157,
        86,
        198,
        33,
        193,
        94,
        203
      ]
    },
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    },
    {
      "name": "resolutionProposal",
      "discriminator": [
        188,
        203,
        94,
        223,
        208,
        121,
        225,
        38
      ]
    },
    {
      "name": "voteState",
      "discriminator": [
        100,
        177,
        100,
        106,
        158,
        188,
        195,
        137
      ]
    }
  ],
  "events": [
    {
      "name": "orderCancelled",
      "discriminator": [
        108,
        56,
        128,
        68,
        168,
        113,
        168,
        239
      ]
    },
    {
      "name": "orderPlaced",
      "discriminator": [
        96,
        130,
        204,
        234,
        169,
        219,
        216,
        227
      ]
    },
    {
      "name": "positionClaimed",
      "discriminator": [
        149,
        250,
        141,
        45,
        210,
        198,
        94,
        148
      ]
    },
    {
      "name": "positionUpdated",
      "discriminator": [
        208,
        212,
        54,
        188,
        246,
        71,
        235,
        88
      ]
    },
    {
      "name": "sharesMerged",
      "discriminator": [
        159,
        116,
        132,
        13,
        58,
        218,
        36,
        86
      ]
    },
    {
      "name": "trade",
      "discriminator": [
        24,
        254,
        218,
        152,
        253,
        43,
        18,
        81
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidLength"
    },
    {
      "code": 6001,
      "name": "bodyTooShort"
    },
    {
      "code": 6002,
      "name": "invalidUtf8"
    },
    {
      "code": 6003,
      "name": "invalidMessageType"
    }
  ],
  "types": [
    {
      "name": "addOrderbookSetParams",
      "docs": [
        "Parameters for adding a new orderbook set (leg) to a market"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "docs": [
              "Index for this leg (must match current legs.len())"
            ],
            "type": "u8"
          },
          {
            "name": "marketData",
            "type": {
              "defined": {
                "name": "marketData"
              }
            }
          }
        ]
      }
    },
    {
      "name": "coveredBy",
      "docs": [
        "What collateral backs an order"
      ],
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "usdc"
          },
          {
            "name": "shares"
          }
        ]
      }
    },
    {
      "name": "createMarketParams",
      "docs": [
        "Parameters for creating a new market",
        "Note: description, rules, and resolver_type are now in MarketInfo account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "imageUri",
            "type": "string"
          },
          {
            "name": "minOrderSize",
            "type": "u64"
          },
          {
            "name": "eventDeadline",
            "type": "i64"
          },
          {
            "name": "marketType",
            "type": {
              "defined": {
                "name": "marketType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "disputeResolutionParams",
      "docs": [
        "Parameters for disputing a resolution and escalating to UMA"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dstEid",
            "docs": [
              "Destination endpoint ID (e.g., Sepolia testnet)"
            ],
            "type": "u32"
          },
          {
            "name": "options",
            "docs": [
              "LayerZero options"
            ],
            "type": "bytes"
          },
          {
            "name": "nativeFee",
            "docs": [
              "Native fee for LayerZero"
            ],
            "type": "u64"
          },
          {
            "name": "lzTokenFee",
            "docs": [
              "LZ token fee (usually 0)"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "endpointSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "eid",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "lzTokenMint",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "enforcedOptions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "send",
            "type": "bytes"
          },
          {
            "name": "sendAndCall",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "fillLog",
      "docs": [
        "Persistent fill tracking for a single order book",
        "This account stores settlement state and is never closed,",
        "allowing users to claim their filled orders even after the orderbook is closed",
        "",
        "Seeds: [b\"fill_log\", market.key(), &[index], &[side as u8]]"
      ],
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this fill log belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "index",
            "docs": [
              "Index identifying which leg of a multi-leg market"
            ],
            "type": "u8"
          },
          {
            "name": "side",
            "docs": [
              "Side (YES or NO)"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "padding",
            "docs": [
              "Padding for alignment"
            ],
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "ticks",
            "docs": [
              "Per-tick settlement tracking"
            ],
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "fillTick"
                  }
                },
                999
              ]
            }
          }
        ]
      }
    },
    {
      "name": "fillTick",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "filledUpTo",
            "type": "u32"
          },
          {
            "name": "padding",
            "type": "u32"
          },
          {
            "name": "partialAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "initLzStoreParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "endpoint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "lzAccount",
      "docs": [
        "same to anchor_lang::prelude::AccountMeta"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "lzPeerConfigParam",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "peerAddress",
            "fields": [
              {
                "array": [
                  "u8",
                  32
                ]
              }
            ]
          },
          {
            "name": "enforcedOptions",
            "fields": [
              {
                "name": "send",
                "type": "bytes"
              },
              {
                "name": "sendAndCall",
                "type": "bytes"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "lzQuoteSendParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dstEid",
            "type": "u32"
          },
          {
            "name": "receiver",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "options",
            "type": "bytes"
          },
          {
            "name": "payInLzToken",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "lzReceiveParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "srcEid",
            "type": "u32"
          },
          {
            "name": "sender",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "guid",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "message",
            "type": "bytes"
          },
          {
            "name": "extraData",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "lzReceiveTypesAccounts",
      "docs": [
        "LzReceiveTypesAccounts PDA is used by the Executor as a prerequisite to calling `lz_receive`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "store",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "lzResolveMarketParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dstEid",
            "type": "u32"
          },
          {
            "name": "options",
            "type": "bytes"
          },
          {
            "name": "nativeFee",
            "type": "u64"
          },
          {
            "name": "lzTokenFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lzStore",
      "docs": [
        "Store PDA for LayerZero OApp configuration",
        "This account represents the \"address\" of the OApp on Solana"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "endpointProgram",
            "type": "pubkey"
          },
          {
            "name": "lastMessage",
            "docs": [
              "Last received cross-chain message (for debugging/tracking)"
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "market",
      "docs": [
        "Market account that holds shared constants and per-leg data",
        "Space is manually calculated using calculate_regular_market_space/calculate_multileg_market_space",
        "String length constraints are enforced at runtime in instruction handlers"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "docs": [
              "Unique market identifier"
            ],
            "type": "u64"
          },
          {
            "name": "creator",
            "docs": [
              "Creator of the market"
            ],
            "type": "pubkey"
          },
          {
            "name": "marketInfo",
            "docs": [
              "Reference to MarketInfo account (contains description, rules, resolver_type, etc.)"
            ],
            "type": "pubkey"
          },
          {
            "name": "category",
            "docs": [
              "Market category (max 32 chars, validated at runtime)"
            ],
            "type": "string"
          },
          {
            "name": "imageUri",
            "docs": [
              "Image URI for the market (max 128 chars, validated at runtime)"
            ],
            "type": "string"
          },
          {
            "name": "createdAt",
            "docs": [
              "When the market was created"
            ],
            "type": "u64"
          },
          {
            "name": "minOrderSize",
            "docs": [
              "Minimum order size in USDC base units"
            ],
            "type": "u64"
          },
          {
            "name": "eventDeadline",
            "docs": [
              "Event deadline - when the real-world event occurs (unix timestamp in seconds)"
            ],
            "type": "i64"
          },
          {
            "name": "feeBps",
            "docs": [
              "Trading fee in basis points (e.g., 100 = 1%)"
            ],
            "type": "u16"
          },
          {
            "name": "verified",
            "docs": [
              "Whether this market has been verified by an admin"
            ],
            "type": "bool"
          },
          {
            "name": "marketType",
            "docs": [
              "Market type containing per-leg data"
            ],
            "type": {
              "defined": {
                "name": "marketType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "marketData",
      "docs": [
        "Per-leg market data (order books, vault, resolution state)",
        "For Regular markets, there is one MarketData. For MultiLeg markets, there is a Vec<MarketData>."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "Short title/name for this leg (e.g., \"BTC above 50k\")"
            ],
            "type": "string"
          },
          {
            "name": "yesOrderBook",
            "docs": [
              "YES order book account for this leg"
            ],
            "type": "pubkey"
          },
          {
            "name": "noOrderBook",
            "docs": [
              "NO order book account for this leg"
            ],
            "type": "pubkey"
          },
          {
            "name": "yesFillLog",
            "docs": [
              "YES fill log account for this leg (persistent fill tracking)"
            ],
            "type": "pubkey"
          },
          {
            "name": "noFillLog",
            "docs": [
              "NO fill log account for this leg (persistent fill tracking)"
            ],
            "type": "pubkey"
          },
          {
            "name": "vault",
            "docs": [
              "USDC vault for this leg"
            ],
            "type": "pubkey"
          },
          {
            "name": "status",
            "docs": [
              "Current status for this leg"
            ],
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          },
          {
            "name": "winningSide",
            "docs": [
              "Winning side for this leg (only valid when status == Resolved)"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "resolvingState",
            "docs": [
              "Resolution request state for this leg"
            ],
            "type": {
              "defined": {
                "name": "resolvingState"
              }
            }
          },
          {
            "name": "sharesOutstanding",
            "docs": [
              "Total share pairs in circulation for this leg (YES == NO == this value)"
            ],
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "docs": [
              "Total trading volume in USDC base units for this leg"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketInfo",
      "docs": [
        "MarketInfo account - stores market metadata separately from operational data",
        "This allows for larger text fields (rules, description) via multi-tx append operations",
        "Once used by a market, this account becomes immutable (authority set to None, is_locked = true)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority who can modify this account (None = immutable)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "isLocked",
            "docs": [
              "Whether this MarketInfo has been consumed by a market"
            ],
            "type": "bool"
          },
          {
            "name": "marketType",
            "docs": [
              "Market type indicator (Regular or MultiLeg)"
            ],
            "type": {
              "defined": {
                "name": "marketInfoType"
              }
            }
          },
          {
            "name": "resolverType",
            "docs": [
              "Resolver type (UmaResolver or WalletVoteResolver)"
            ],
            "type": {
              "defined": {
                "name": "resolverType"
              }
            }
          },
          {
            "name": "marketQuestion",
            "docs": [
              "Market question (must contain \"___\" if MultiLeg)"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Market description"
            ],
            "type": "string"
          },
          {
            "name": "rules",
            "docs": [
              "Resolution rules (can be arbitrarily long via append operations)"
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "marketInfoType",
      "docs": [
        "Market info type indicator (does not contain leg data)"
      ],
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "regular"
          },
          {
            "name": "multiLeg"
          }
        ]
      }
    },
    {
      "name": "marketStatus",
      "docs": [
        "Market status"
      ],
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "paused"
          },
          {
            "name": "resolved"
          }
        ]
      }
    },
    {
      "name": "marketType",
      "docs": [
        "Market type enum - Regular (single leg) or MultiLeg (multiple legs)"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "regular",
            "fields": [
              {
                "defined": {
                  "name": "marketData"
                }
              }
            ]
          },
          {
            "name": "multiLeg",
            "fields": [
              {
                "vec": {
                  "defined": {
                    "name": "marketData"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      "name": "messagingFee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nativeFee",
            "type": "u64"
          },
          {
            "name": "lzTokenFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "index",
            "docs": [
              "Index identifying which leg of a multi-leg market this order belongs to"
            ],
            "type": "u8"
          },
          {
            "name": "side",
            "docs": [
              "Which side this order is for (YES or NO)"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "price",
            "docs": [
              "Price in 0.1¢ increments (1-999)"
            ],
            "type": "u16"
          },
          {
            "name": "orderId",
            "docs": [
              "Order ID within the price tick"
            ],
            "type": "u32"
          },
          {
            "name": "amount",
            "docs": [
              "Number of shares"
            ],
            "type": "u64"
          },
          {
            "name": "seed",
            "docs": [
              "Unique seed for PDA derivation"
            ],
            "type": "u32"
          },
          {
            "name": "coveredBy",
            "docs": [
              "What backs this order - determines claim payout"
            ],
            "type": {
              "defined": {
                "name": "coveredBy"
              }
            }
          }
        ]
      }
    },
    {
      "name": "orderBook",
      "docs": [
        "Order book implemented as a Red-Black Tree"
      ],
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "index",
            "docs": [
              "Index identifying which leg of a multi-leg market this order book belongs to",
              "For regular markets, this is always 0"
            ],
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "market",
            "docs": [
              "The market this order book belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "orderCount",
            "docs": [
              "Number of active orders"
            ],
            "type": "u64"
          },
          {
            "name": "fillLog",
            "docs": [
              "Reference to the associated FillLog account (for fill tracking)"
            ],
            "type": "pubkey"
          },
          {
            "name": "ticks",
            "docs": [
              "Per-tick order ID counter"
            ],
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "orderTick"
                  }
                },
                999
              ]
            }
          },
          {
            "name": "orders",
            "docs": [
              "Red-Black Tree storing orders"
            ],
            "type": {
              "defined": {
                "name": "orderTree"
              }
            }
          }
        ]
      }
    },
    {
      "name": "orderCancelled",
      "docs": [
        "Emitted when an order is cancelled"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this order belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "The user who cancelled the order"
            ],
            "type": "pubkey"
          },
          {
            "name": "order",
            "docs": [
              "The order PDA"
            ],
            "type": "pubkey"
          },
          {
            "name": "side",
            "docs": [
              "YES or NO side"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "price",
            "docs": [
              "Price in basis points"
            ],
            "type": "u16"
          },
          {
            "name": "amount",
            "docs": [
              "Number of shares cancelled"
            ],
            "type": "u64"
          },
          {
            "name": "orderId",
            "docs": [
              "Order ID"
            ],
            "type": "u32"
          },
          {
            "name": "refundAmount",
            "docs": [
              "Amount refunded (USDC or shares)"
            ],
            "type": "u64"
          },
          {
            "name": "coveredBy",
            "docs": [
              "Whether backed by USDC or shares"
            ],
            "type": {
              "defined": {
                "name": "coveredBy"
              }
            }
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp of cancellation"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "orderPlaced",
      "docs": [
        "Emitted when a new limit order is placed"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this order belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "The user who placed the order"
            ],
            "type": "pubkey"
          },
          {
            "name": "order",
            "docs": [
              "The order PDA"
            ],
            "type": "pubkey"
          },
          {
            "name": "side",
            "docs": [
              "YES or NO side"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "price",
            "docs": [
              "Price in basis points (1-999)"
            ],
            "type": "u16"
          },
          {
            "name": "amount",
            "docs": [
              "Number of shares"
            ],
            "type": "u64"
          },
          {
            "name": "orderId",
            "docs": [
              "Order ID within the price tick"
            ],
            "type": "u32"
          },
          {
            "name": "coveredBy",
            "docs": [
              "Whether backed by USDC or shares"
            ],
            "type": {
              "defined": {
                "name": "coveredBy"
              }
            }
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp of the order"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "orderSide",
      "docs": [
        "Order side enum (YES or NO outcome, None for unresolved, Split for 50/50)"
      ],
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "yes"
          },
          {
            "name": "no"
          },
          {
            "name": "none"
          },
          {
            "name": "split"
          }
        ]
      }
    },
    {
      "name": "orderTick",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nextOrderId",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "orderTree",
      "docs": [
        "Red-Black Tree stored as raw bytes"
      ],
      "type": {
        "kind": "type",
        "alias": {
          "array": [
            "u8",
            16416
          ]
        }
      }
    },
    {
      "name": "peerConfig",
      "docs": [
        "PeerConfig PDAs store configuration for each remote chain",
        "For each remote chain, a PeerConfig PDA is created with the remote EID as part of the seed"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "peerAddress",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "enforcedOptions",
            "type": {
              "defined": {
                "name": "enforcedOptions"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this position belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "index",
            "docs": [
              "Index identifying which leg of a multi-leg market this position belongs to"
            ],
            "type": "u8"
          },
          {
            "name": "user",
            "docs": [
              "The user who owns this position"
            ],
            "type": "pubkey"
          },
          {
            "name": "side",
            "docs": [
              "The side of the position (Yes or No)"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "amount",
            "docs": [
              "The number of shares held"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "positionClaimed",
      "docs": [
        "Emitted when a position is claimed from a filled order"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this order belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "The user who owned the order"
            ],
            "type": "pubkey"
          },
          {
            "name": "order",
            "docs": [
              "The order PDA"
            ],
            "type": "pubkey"
          },
          {
            "name": "side",
            "docs": [
              "YES or NO side"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "price",
            "docs": [
              "Price in basis points"
            ],
            "type": "u16"
          },
          {
            "name": "claimedAmount",
            "docs": [
              "Number of shares claimed"
            ],
            "type": "u64"
          },
          {
            "name": "orderClosed",
            "docs": [
              "Whether the order is now fully claimed (closed)"
            ],
            "type": "bool"
          },
          {
            "name": "coveredBy",
            "docs": [
              "Whether backed by USDC (claims shares) or Shares (claims USDC)"
            ],
            "type": {
              "defined": {
                "name": "coveredBy"
              }
            }
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp of the claim"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "positionUpdated",
      "docs": [
        "Emitted when a position is updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this position belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "The user who owns the position"
            ],
            "type": "pubkey"
          },
          {
            "name": "side",
            "docs": [
              "YES or NO side"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "oldAmount",
            "docs": [
              "Previous amount"
            ],
            "type": "u64"
          },
          {
            "name": "newAmount",
            "docs": [
              "New amount"
            ],
            "type": "u64"
          },
          {
            "name": "delta",
            "docs": [
              "Change in amount (positive for increase, could track separately)"
            ],
            "type": "i64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp of the update"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "proposeResolutionParams",
      "docs": [
        "Parameters for proposing a resolution"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposedOutcome",
            "docs": [
              "Proposed outcome: 1 = Yes, 2 = No"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposedOutcome",
      "docs": [
        "Represents the proposed outcome (Yes or No)"
      ],
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "yes"
          },
          {
            "name": "no"
          }
        ]
      }
    },
    {
      "name": "resolutionProposal",
      "docs": [
        "Resolution proposal account for the two-tier resolution system",
        "Seeds: [\"resolution_proposal\", market.key(), index]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this proposal is for"
            ],
            "type": "pubkey"
          },
          {
            "name": "index",
            "docs": [
              "Index identifying which leg of a multi-leg market this proposal is for"
            ],
            "type": "u8"
          },
          {
            "name": "proposer",
            "docs": [
              "The proposer who submitted the initial resolution"
            ],
            "type": "pubkey"
          },
          {
            "name": "proposedOutcome",
            "docs": [
              "The proposed outcome (Yes or No)"
            ],
            "type": {
              "defined": {
                "name": "proposedOutcome"
              }
            }
          },
          {
            "name": "proposerBond",
            "docs": [
              "Bond amount deposited by proposer (in USDC base units)"
            ],
            "type": "u64"
          },
          {
            "name": "proposedAt",
            "docs": [
              "Timestamp when the proposal was submitted"
            ],
            "type": "i64"
          },
          {
            "name": "disputer",
            "docs": [
              "The disputer (if disputed), otherwise Pubkey::default()"
            ],
            "type": "pubkey"
          },
          {
            "name": "disputerBond",
            "docs": [
              "Bond amount deposited by disputer (in USDC base units)"
            ],
            "type": "u64"
          },
          {
            "name": "disputedAt",
            "docs": [
              "Timestamp when disputed (0 if not disputed)"
            ],
            "type": "i64"
          },
          {
            "name": "isSettled",
            "docs": [
              "Whether the resolution has been settled (UMA result received)"
            ],
            "type": "bool"
          },
          {
            "name": "bondsClaimed",
            "docs": [
              "Whether the bonds have been claimed by the winner"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "resolverType",
      "docs": [
        "Resolver type - determines how market resolution is handled"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "umaResolver"
          },
          {
            "name": "walletVoteResolver",
            "fields": [
              {
                "name": "voters",
                "docs": [
                  "List of wallet addresses that can vote (max 10)"
                ],
                "type": {
                  "vec": "pubkey"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "name": "resolvingState",
      "docs": [
        "Tracks resolution request state (separate from MarketStatus to allow trading during resolution)",
        "Two-tier system: Propose -> (Finalize | Dispute -> UMA -> Complete)"
      ],
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "notStarted"
          },
          {
            "name": "proposed"
          },
          {
            "name": "disputed"
          },
          {
            "name": "completed"
          }
        ]
      }
    },
    {
      "name": "setLzPeerConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "remoteEid",
            "type": "u32"
          },
          {
            "name": "config",
            "type": {
              "defined": {
                "name": "lzPeerConfigParam"
              }
            }
          }
        ]
      }
    },
    {
      "name": "sharesMerged",
      "docs": [
        "Emitted when shares are merged (redeemed for $1)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market where shares were merged"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "The user who merged shares"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "Number of share pairs merged"
            ],
            "type": "u64"
          },
          {
            "name": "usdcReceived",
            "docs": [
              "USDC received"
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp of the merge"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "trade",
      "docs": [
        "Emitted when a market buy or sell trade occurs"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market where the trade occurred"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "The user who initiated the trade"
            ],
            "type": "pubkey"
          },
          {
            "name": "index",
            "docs": [
              "The market leg index (0 for single-leg markets)"
            ],
            "type": "u8"
          },
          {
            "name": "side",
            "docs": [
              "YES or NO side"
            ],
            "type": {
              "defined": {
                "name": "orderSide"
              }
            }
          },
          {
            "name": "isBuy",
            "docs": [
              "Whether this was a buy or sell"
            ],
            "type": "bool"
          },
          {
            "name": "shares",
            "docs": [
              "Total shares traded"
            ],
            "type": "u64"
          },
          {
            "name": "usdcAmount",
            "docs": [
              "Total USDC amount"
            ],
            "type": "u64"
          },
          {
            "name": "avgPrice",
            "docs": [
              "Average price (in basis points, calculated as usdc_amount / shares / 1000)"
            ],
            "type": "u16"
          },
          {
            "name": "fillsCount",
            "docs": [
              "Number of orders matched"
            ],
            "type": "u32"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp of the trade"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "docs": [
        "Represents a single voter's vote"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "docs": [
              "The voter's wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "vote",
            "docs": [
              "Vote value: 0=not voted, 1=Yes, 2=No"
            ],
            "type": "u8"
          },
          {
            "name": "votedAt",
            "docs": [
              "Timestamp when the vote was cast (0 if not voted)"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "voteResolutionParams",
      "docs": [
        "Parameters for casting a vote"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vote",
            "docs": [
              "Vote value: 1 = Yes, 2 = No"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "voteState",
      "docs": [
        "Vote state account for WalletVoteResolver markets",
        "Tracks votes from authorized voters for market resolution",
        "Seeds: [\"vote_state\", market.key(), index]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "The market this vote state belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "index",
            "docs": [
              "Index identifying which leg of a multi-leg market this is for"
            ],
            "type": "u8"
          },
          {
            "name": "totalVoters",
            "docs": [
              "Total number of authorized voters"
            ],
            "type": "u8"
          },
          {
            "name": "yesVotes",
            "docs": [
              "Number of YES votes"
            ],
            "type": "u8"
          },
          {
            "name": "noVotes",
            "docs": [
              "Number of NO votes"
            ],
            "type": "u8"
          },
          {
            "name": "votes",
            "docs": [
              "Vote records for each voter (max 10)"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "voteRecord"
                }
              }
            }
          },
          {
            "name": "isFinalized",
            "docs": [
              "Whether voting has been finalized"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
