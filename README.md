# `HighLow is a Near Card Game / It is sourced originally from the near-sdk-as` Starter Kit

This project is a AssemblyScript project for the Near blockchain.

HighLow is a simple card game derived from an old English card game, which itself
is derived from "snap".  Game series is 1 or more decks of ammended playing cards
with ace,2,3,4,5,6,7,8,9,10,Jack,Queen,King,Joker (each card deck has 4 jokers also),
having a card value of 1 through 14 respectively.
Game series is funded by the house with X $.

Each series game "play" instance requires a minimum bet amount by the player.
Game starts with createGame and the required minimum bet.  Game play can be blind.
Game continues through two rounds and then ends with endGame.

Round 1 is played as a random card is turned over from the deck "shuttle"

Player then places a Round 2 bet (subject to maximum betting rules) along with a 
guess/option declaring the player's belief of the 2nd card's relative value to the 1st card
turned over from the card deck "shuttle", stating "Higher" or "Lower" than the 1st card.

Game ends with endGame, where the game draws the 2nd random card (value 1 through 14).
Player wins the pot of money (initial minimum bet + the 2nd Round's high/low choice bet amount, 
upto the maximum choice bet for that Game "instance"),
Otherwise - the house gets the funds that were bet - including on any ties

Check Game status after each Round and after endGame with whatIsGameStatus (gameId required)
 
HighLow uses AssemblyScript contracts in this project, in their own folder:

- **simple** in the `src/simple` folder

HighLow's AssemblyScript contract is written via it's `index.ts` file (the contract entry point)
that includes a series of exported functions.

In this case, all exported functions become public contract methods.

```ts
// create the HighLow game instance 
export function createGame(_initBet: u128): u32{}

// play the first round of HighLow
export function round1Game(_gameId: u32): bool {}

// play the second round of HighLow, making the second round bet and choosing High or Low
export function round2Game(_gameId: u32, _choiceHigh: boolean, _betAmount: u128): bool {}

// end (finish) the game instance, determing whether the player or the house wins / pay player on a "win"
export function endGame(_gameId: u32): string {}
```

HighLow's AssemblyScript also has a single exported class, HighLow that is decorated with `@nearBindgen`.

All methods on the HighLow class become public contract methods unless marked `private`.  Also, all instance variables are stored as a serialized instance of the class under a special storage key named `STATE`.  AssemblyScript uses JSON for storage serialization (as opposed to Rust contracts which use a custom binary serialization format called borsh).

```ts
@nearBindgen
export class HighLow {}

```
## Usage

Play the HighLow game by 1) creating the game 2) playing round 1, then 3) playing round 2, and then 3) ending the game

You can monitor the game status after each play step (create game, round 1, round 2 and end game) via ...

export function whatIsGameStatus(_gameId: u32): string {}

### Getting started

(see below for video recordings of each of the following steps)

1. clone this repo to a local folder
2. run `yarn`
3. run `./scripts/1.dev-deploy.sh`  (which deploys the contract)
3. run `./scripts/2.use-contract.sh` (ignore)
4. run `./scripts/2.use-contract.sh` (ignore)
5. run `./scripts/3.cleanup.sh`
6. run the following "play" commands from the terminal (found in `./scripts/4.createnrunHL.sh`

REPLACE contract name with your contract name from ./scripts/1.dev-deploy.sh and REPLACE _gameId with your _gameId from create game

REPLACE --accountId name with your NEAR accountId value (usually a NEAR testnet account)

REPLACE your _betAmount value

near call dev-1636061228659-36397651617537 createGame '{"_initBet":"10"}' --amount 100 --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 round1Game '{"_gameId":1913854565}' --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 round2Game '{"_gameId":1913854565, "_choiceHigh":true, "_betAmount":"20"}' --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 whatIsGameStatus '{"_gameId":1913854565}' --accountId comtechnet.testnet

near call dev-1636061228659-36397651617537 endGame '{"_gameId":1913854565}' --accountId comtechnet.testnet

## The HighLow file system only uses the simple directory

```sh
├── README.md                          # this file
├── as-pect.config.js                  # configuration for as-pect (AssemblyScript unit testing)
├── asconfig.json                      # configuration for AssemblyScript compiler (supports multiple contracts)
├── package.json                       # NodeJS project manifest
├── scripts
│   ├── 1.dev-deploy.sh                # helper: build and deploy contracts
│   ├── 2.use-contract.sh              # helper: call methods on ContractPromise
│   ├── 3.cleanup.sh                   # helper: delete build and deploy artifacts
│   └── README.md                      # documentation for helper scripts
├── src
│   ├── as_types.d.ts                  # AssemblyScript headers for type hints
│   ├── simple                         # Contract 1: "Simple example"
│   │   ├── __tests__
│   │   │   ├── as-pect.d.ts           # as-pect unit testing headers for type hints
│   │   │   └── index.unit.spec.ts     # unit tests for contract 1
│   │   ├── asconfig.json              # configuration for AssemblyScript compiler (one per contract)
│   │   └── assembly
│   │       └── index.ts               # contract code for contract 1
│   ├── singleton                      # Contract 2: "Singleton-style example"
│   │   ├── __tests__
│   │   │   ├── as-pect.d.ts           # as-pect unit testing headers for type hints
│   │   │   └── index.unit.spec.ts     # unit tests for contract 2
│   │   ├── asconfig.json              # configuration for AssemblyScript compiler (one per contract)
│   │   └── assembly
│   │       └── index.ts               # contract code for contract 2
│   ├── tsconfig.json                  # Typescript configuration
│   └── utils.ts                       # common contract utility functions
└── yarn.lock                          # project manifest version lock
```

You may clone this repo to get started OR create everything from scratch.

Please note that, in order to create the AssemblyScript and tests folder structure, you may use the command `asp --init` which will create the following folders and files:

```
./assembly/
./assembly/tests/
./assembly/tests/example.spec.ts
./assembly/tests/as-pect.d.ts
```
