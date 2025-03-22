enum CardType {
  Heart = "♥",
  Diamond = "♦",
  Spade = "♠",
  Club = "♣",
}

type CardLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type CardSymbol = "6" | "7" | "8" | "9" | "10" | "В" | "Д" | "К" | "Т";

interface Card {
  level: CardLevel;
  symbol: CardSymbol;
  type: CardType;
}
const symbols: CardSymbol[] = ["6", "7", "8", "9", "10", "В", "Д", "К", "Т"];
const levels: CardLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const cardsPack: Card[] = [];
for (let i = 0; i < 36; i++) {
  const level: CardLevel = levels[i % 9];
  const symbol: CardSymbol = symbols[i % 9];
  const type =
    i < 9
      ? CardType.Club
      : i < 18
      ? CardType.Heart
      : i < 27
      ? CardType.Diamond
      : CardType.Spade;
  cardsPack.push({
    level,
    symbol,
    type,
  });
}

function shuffleArray(array: Card[]): Card[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

class Player {
  order: number;
  cards: Card[] = [];
  name: string;
  attacking: boolean = false;
  defending: boolean = false;
  protectionBroken: boolean = false;

  addCard(card: Card) {
    this.cards.push(card);
  }
  removeCard(card: Card) {
    this.cards = this.cards.filter((c) => c !== card);
  }
  constructor(name: string, order: number) {
    this.name = name;
    this.order = order;
  }
}

class Game {
  cards: Card[] = shuffleArray(cardsPack);
  cardsOnTable: Card[] = [];
  players: Player[];
  kingCardType: CardType = this.cards[0].type;
  kingCard: Card = this.cards[0];

  constructor(playerNames: string[]) {
    if (playerNames.length < 2) throw "Minimum 2 players required";
    if (playerNames.length > 4) throw "Maximum 4 players required";
    this.players = playerNames.map((name, i) => new Player(name, i));
    for (let player of this.players) {
      this.getFullHand(player);
    }
    let smallestLevel = 10;
    let firstAttacker: Player =
      this.players[Math.floor(Math.random() * this.players.length - 1)];
    this.players.forEach((player) => {
      player.cards.forEach((card) => {
        if (card.type === this.kingCardType && smallestLevel > card.level) {
          smallestLevel = card.level;
          firstAttacker = player;
        }
      });
    });
    firstAttacker.attacking = true;
    console.log(firstAttacker);
    this.players[(firstAttacker.order + 1) % this.players.length].defending =
      true;
  }
  getNewCard(player: Player) {
    const card = this.cards.pop();
    if (card) player.addCard(card);
  }
  move(card: Card, player: Player) {
    if (this.isPossibleMove(card, player)) {
      player.removeCard(card);
      this.cardsOnTable.push(card);
    } else {
      throw "Invalid move";
    }
  }
  getFullHand(player: Player) {
    const needCardCount = 6 - player.cards.length;
    for (let i = 0; i < needCardCount; i++) {
      this.getNewCard(player);
    }
  }
  isPossibleMove(card: Card, player: Player): boolean {
    if (player.attacking) {
      if (
        this.cardsOnTable.length === 0 ||
        this.cardsOnTable.filter((c) => c.level === card.level).length
      ) {
        return true;
      }
    } else if (player.defending) {
      const attackingCard = this.cardsOnTable[this.cardsOnTable.length - 1];
      if (
        (card.type === attackingCard.type &&
          card.level > attackingCard.level) ||
        (card.type === this.kingCardType &&
          attackingCard.type !== this.kingCardType)
      ) {
        return true;
      }
    }
    return false;
  }
  bito(player: Player) {
    if (this.cardsOnTable.length > 0 && player.attacking) {
      const defendingPlayer = this.players.find((p) => p.defending);
      if (defendingPlayer.protectionBroken) {
        this.cardsOnTable.forEach((card) => defendingPlayer.addCard(card));
      }
      this.cardsOnTable = [];
      this.players.forEach((player) => this.getFullHand(player));
    }
    throw "Invalid bito";
  }
}

// const game = new Game(["Shamshod", "Sherali"]);
// console.log(game.players[0], game.players[1], game.kingCard);
