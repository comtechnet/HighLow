import { logging, PersistentDeque, PersistentVector, storage, Context, u128, RNG } from "near-sdk-as"
import { ContractPromiseBatch, PersistentMap } from "near-sdk-core"

/*

HighLow is a simple card game derived from an old English card game, which itself
is derived from "snap".  Game series is 1 or more decks of ammended playing cards
with ace,2,3,4,5,6,7,8,9,10,Jack,Queen,King,Joker (each card deck has 4 jokers also),
having a card value of 1 through 14 respectively.
Game series is funding by the house with X $.
Each series game "play" instance requires a minimum bet amount by the player.
Game starts with createGame and the required minimum bet.  Game play can be blind.
Game continues through two rounds and then ends with endGame
Round 1 is played as a random card is turned over from the deck "shuttle"

Player then places a Round 2 bet (subject to maximum betting rules) along with a 
guess/option declaring the player's belief of the 2nd card's relative value to the 1st card
turned over from the card deck "shuttle", stating "Higher" or "Lower" than the 1st card.

Game ends with endGame, where the game draws the 2nd random card (value 1 through 14).
Player wins the pot of money (initial minimum bet + the 2nd Round's high/low choice bet amount, 
upto the maximum choice bet for that Game "instance"),
Otherwise - the house gets the funds that were bet - including on any ties

Check Game status after each Round and after endGame with whatIsGameStatus (gameId required)
 
*/
enum GameSate {
  Created,
  Joined,
  Ended
}

// HighLow game class
@nearBindgen
export class HighLow {
  gameId: u32
  player: string
  choiceHigh: bool
  winner: string
  initialAmount: u128 //House Funds Game Instance for this "game series"
  initBetAmount: u128 //Required Initial bet for Game Instance 
  betAmount: u128 //Bet amount after seeing 1st card and calling high or low
  gameState: GameSate
  gameRound: string
  maxBet: u128
  cardInstance1st: u32
  cardInstance2nd: u32
  gameInstanceWinnings: i64
  playerWins: bool

  constructor() {
    const rng = new RNG<u32>(1, u32.MAX_VALUE)
    const gameInstance = rng.next()
    this.gameId = gameInstance
    this.player = "None"
    this.choiceHigh = false
    this.initialAmount = Context.attachedDeposit
    this.gameState = GameSate.Created
    this.winner = Context.sender
    this.maxBet
    this.initBetAmount
    this.betAmount
    this.gameRound = "Start"
  }
}

const games = new PersistentVector<HighLow>("h")
const gameMap = new PersistentMap<u32, HighLow>("gh")

export function createGame(_initBet: u128): u32{
  const highLow = new HighLow()
  //games.push(highLow)
  highLow.initialAmount = Context.attachedDeposit
  highLow.initBetAmount = _initBet
  gameMap.set(highLow.gameId, highLow)
  return highLow.gameId
}

export function round1Game(_gameId: u32): bool {
  const game = gameMap.getSome(_gameId)
  game.cardInstance1st = 0
  game.cardInstance2nd = 0
  const rng = new RNG<u32>(1, 14)
  //const cardInstance1st = rng.next()
  game.gameRound = "1"
  game.cardInstance1st = rng.next()
  game.gameState = GameSate.Joined
  gameMap.set(_gameId, game)
  return true
}

export function round2Game(_gameId: u32, _choiceHigh: boolean, _betAmount: u128): bool {
  const game = gameMap.getSome(_gameId)
  game.gameRound = "2"
  game.choiceHigh = _choiceHigh
  game.player = Context.sender
  game.betAmount = _betAmount
  gameMap.set(_gameId, game)
  return true
}

export function endGame(_gameId: u32): string {
  const game = gameMap.getSome(_gameId)
  const rng = new RNG<u32>(1, 14)
  game.playerWins = false
  //const cardInstance2nd = rng.next()
  game.cardInstance2nd = rng.next()
  if (game.cardInstance2nd > game.cardInstance1st) {
    if (game.choiceHigh) {
      game.playerWins = true
    } else {}
  }
  if (game.cardInstance2nd < game.cardInstance1st) {
    if(!game.choiceHigh) {
      game.playerWins = true
    } else {}
  }
  
  game.gameState = GameSate.Ended
  game.gameRound = "Over"
  gameMap.set(_gameId, game)

  if (game.playerWins) {
  const to_beneficiary = ContractPromiseBatch.create(game.winner)
  //game.gameInstanceWinnings = game.betAmount + game.initBetAmount
  //to_beneficiary.transfer(u128.add(game.betAmount, game.initialAmount))
  //to_beneficiary.transfer(u128.add(changetype<u128>(game.betAmount), changetype<u128>(game.initBetAmount)))
  to_beneficiary.transfer(u128.add(game.betAmount, game.initBetAmount))
 
  return game.winner
  } else return "house wins!"
}

// return the string info below with Context and game fields (Near system fields) "filled in"
export function whatIsGameStatus(_gameId: u32): string {
  const game = gameMap.getSome(_gameId)
  let choiceTxt = "Lower"
  if (game.choiceHigh) {choiceTxt = "Higher"}
  return `My game is ${Context.contractName}
          Game Round is ${game.gameRound}
          1st Card was ${game.cardInstance1st}
          2nd Card was ${game.cardInstance2nd}
          Player X bet that 2nd Card would be ${choiceTxt}
          Initial Bet was ${game.initBetAmount}
          Round   Bet was ${game.betAmount}
          Status is ${game.gameState}
          Winner was ${game.winner}
          Was Player the Game Winner? ${game.playerWins}
          Sender by ${Context.sender}`
}

/* export function changetype<u128>(_incomingX: i64): u128 {
  let X = new u128
  X = _incomingX
} */

/* @inline
static fromI256(value: I256): u128 {
  return changetype<u128>(U128.fromI256(value));
} */

// return the string 'hello world'
export function helloWorld(): string {
  logging.log("helloWorld() was called")
  return 'hello CTN'
}

// return a string with passed arg to the function
export function helloSomeone(name: string): string {
  return 'hello ' + name + "!"
}

// return a string with context.sender function
export function sayMyName(): string {
  logging.log("sayMyName() was called")
  return 'hello from context, ' + Context.sender + "!"
}

// set a string with context.sender function
export function saveMyName(): void {
  logging.log("saveMyName() was called")
  storage.setString("last_sender", Context.sender)
}

// return true and send a non blank message unction
export function saveMyMessage(message: string): bool {
  logging.log("saveMyMessage() was called")
  assert(message.length > 0, "Message can not be blank!")
  const messages = new PersistentDeque<string>("messages")
  messages.pushFront(Context.sender + " says " + message) 
  return true
}

// return all messages and send a non blank message function
export function getAllMessages(): Array<string> {
  logging.log("getAllMessages() was called")
  const messages = new PersistentDeque<string>("messages")
  let results = new Array<string>()
  while (!messages.isEmpty) {
    results.push(messages.popBack())
  }
  return results
  logging.log("Number of Messages is/was " + messages.length) 
}

// return a string with passed arg of array of strings to the function
export function helloPeoples(names: Array<string>): string {
  return names.map<string>(name => 'hello ' + name).join(`\n`)
}

// return the string below with 3 Context fields (Near system fields) "filled in"
export function whatsYourName(): string {
  return `My name is ${Context.contractName}
          I received a call from ${Context.predecessor}
          The call was initiated (originally signed and sent) by ${Context.sender}`
}

// read the given key from account (contract) storage
export function read(key: string): string {
  if (storage.hasKey(key)) {
    return `✅ Key [ ${key} ] has value [ ${storage.getString(key)!} ]`
  } else {
    return `🚫 Key [ ${key} ] not found in storage. ( ${storageReport()} )`
  }
}

// write the given value at the given key to account (contract) storage
export function write(key: string, value: string): string {
  storage.set(key, value)
  return `✅ Data saved. ( ${storageReport()} )`
}

// private helper method used by read() and write() above
function storageReport(): string {
  return `storage [ ${Context.storageUsage} bytes ]`
}

// private showMeTheMoney
export function showMeTheMoney(): string {
  return `I just received storage ${Context.attachedDeposit} attached to this call
          and now my balance is ${Context.accountBalance}`
}
