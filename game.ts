enum CardType {
    Heart = "♥",
    Diamond = "♦",
    Spade = "♠",
    Club = "♣",
  }
  
  type CardLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  type CardSymbol = "6" | "7" | "8" | "9" | "10" | "В" | "Д" | "К" | "Т";
  
  export interface Card {
    level: CardLevel;
    symbol: CardSymbol;
    type: CardType;
  }
  const symbols: CardSymbol[] = ["6", "7", "8", "9", "10", "В", "Д", "К", "Т"];
  const cardsPack: Card[] = [];
  
  Object.values(CardType).forEach((cardType: CardType) => {
    symbols.forEach((symbol, index) => {
      cardsPack.push({
        level: (index + 1) as CardLevel,
        symbol,
        type: cardType,
      });
    });
  });
  
  function shuffleArray(array: Card[]): Card[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }
  
  export class Player {
    order: number;
    cards: Card[] = [];
    name: string;
    attacking: boolean = false;
    defending: boolean = false;
    protectionBroken: boolean = false;
    turn: boolean = false;
    game: Game;
  
    addCard(card: Card) {
      this.cards.push(card);
    }
    removeCard(card: Card) {
      this.cards = this.cards.filter((c) => c !== card);
    }
    move(card: Card) {
      this.game.move(card, this);
    }
    constructor(name: string, order: number, game: Game) {
      this.name = name;
      this.order = order;
      this.game = game;
    }
  }
  
 export class Game {
    cards: Card[] = shuffleArray(cardsPack);
    cardsOnTable: Card[] = [];
    players: Player[];
    kingCardType: CardType = this.cards[0].type;
    kingCard: Card = this.cards[0];
    winners: (Player | Player[])[] = [];
  
    constructor(playerNames: string[]) {
      if (playerNames.length < 2) throw "Minimum 2 players required";
      if (playerNames.length > 4) throw "Maximum 4 players required";
      this.players = playerNames.map((name, i) => new Player(name, i, this));
      for (let player of this.players) {
        this.getFullHand(player);
      }
      let smallestLevel = 10;
      let firstAttacker: Player =
        this.players[Math.floor(Math.random() * this.players.length)];
      this.players.forEach((player) => {
        player.cards.forEach((card) => {
          if (card.type === this.kingCardType && smallestLevel > card.level) {
            smallestLevel = card.level;
            firstAttacker = player;
          }
        });
      });
      firstAttacker.attacking = true;
      firstAttacker.turn = true;
      this.players[(firstAttacker.order + 1) % this.players.length].defending =
        true;
    }
    getNewCard(player: Player) {
      const card = this.cards.pop();
      if (card) player.addCard(card);
    }
    getAttackingPlayer(): Player {
      return this.players.find((p) => p.attacking) as Player;
    }
    getDefendingPlayer(): Player {
      return this.players.find((p) => p.defending) as Player;
    }
    move(card: Card, player: Player) {
      if (this.isPossibleMove(card, player)) {
        player.removeCard(card);
        this.cardsOnTable.push(card);
        if (player.defending) {
          this.changePlayersTurn(this.players.find((p) => p.attacking) as Player);
        } else {
          if (!(this.players.find((p) => p.defending ) as Player).protectionBroken) {
            this.changePlayersTurn(this.players.find((p) => p.defending) as Player);
          }
        }
      } else {
        return "Invalid move";
      }
    }
    getFullHand(player: Player) {
      const needCardCount = 6 - player.cards.length;
      for (let i = 0; i < needCardCount; i++) {
        this.getNewCard(player);
      }
    }
    isPossibleMove(card: Card, player: Player): boolean {
      if (!player.turn) return false;
      if (!player.cards.some((c) => c === card)) return false;
      if (player.attacking) {
        if (
          this.cardsOnTable.length === 0 ||
          this.cardsOnTable.some((c) => c.level === card.level)
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
        const defendingPlayer = this.getDefendingPlayer() as Player;
        const nextDefendingPlayer =
          this.players[(defendingPlayer.order + 1) % this.players.length];
        defendingPlayer.attacking = true;
        defendingPlayer.defending = false;
        player.attacking = false;
        nextDefendingPlayer.defending = true;
        if (defendingPlayer.protectionBroken) {
          this.cardsOnTable.forEach((card) => defendingPlayer.addCard(card));
          nextDefendingPlayer.attacking = true;
          nextDefendingPlayer.defending = false;
          defendingPlayer.defending = false;
          defendingPlayer.attacking = false;
          defendingPlayer.protectionBroken = false;
          this.players[
            (nextDefendingPlayer.order + 1) % this.players.length
          ].defending = true;
          if(this.cards.length < 1 && player.cards.length < 1){
            this.winners.push(player);
            this.players = this.players.filter((p) => p !== player);
          }
          this.changePlayersTurn(nextDefendingPlayer);
        }else{
          this.changePlayersTurn(defendingPlayer)
          if(this.cards.length < 1  && player.cards.length < 1 && defendingPlayer.cards.length < 1){
          this.winners.push([player, defendingPlayer]);
          this.players = this.players.filter((p) => p !== player);
          this.players = this.players.filter((p) => p !== defendingPlayer);
          }else if(this.cards.length < 1  && player.cards.length < 1){
            this.winners.push(player);
            this.players = this.players.filter((p) => p !== player);
          }
        }
        this.cardsOnTable = [];
        
        this.players.forEach((player) => this.getFullHand(player));
      } else {
        return "Invalid bito";
      }
    }
    missAttack(player: Player) {
      if (player.defending) {
        player.protectionBroken = true;
      }
      const attackingPlayer = this.getAttackingPlayer();
      this.changePlayersTurn(attackingPlayer)
      return "Invalid Protection broken";
    }
    changePlayersTurn(player: Player) {
      this.players.forEach((player) => (player.turn = false));
      player.turn = true;
    }
  }
  
  