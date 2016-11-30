module.exports = {
  name: "printer",

  /**
   * Called when a round begins.
   *
   * @param {Number} cash the amount of cash the player has on hand to bet.
   */
  onRoundBegin: function(cash) {
    this.log("round begin, I have $%d", cash);
  },

  /**
   * Called after a round has ended.
   *
   * @param {String} result the result of the hand, one of 'win', 'loss',
   *  'bust', 'push'.
   * @param {PlayerHand} hand your current hand.
   * @param {Number} cash the amount of cash you have on hand.
   * @param {Number} winnings the amount of winnings, or losses, resulting
   *  from the round (will be negative if the round was lost).
   * @param {Array} table the table's cards shown at the end of the
   *  round, includes the dealers and your cards. Each item in the Array
   *  is an array of cards representing a single player's hand.
   */
  onRoundEnd: function(result, hand, cash, winnings, table) {
    this.log("round end: my hand %s", hand);
    this.log("round result: %s (%s$%d), I now have $%d", result, winnings < 0 ? "-" : "+", winnings, cash);
    this.log("table cards (including mine and dealers): %s", table.join(', '));
  },

  /**
   * Called once a new game begins.
   *
   * @param {Number} playerCount number of active players
   * @param {Number} cash the amount of cash you start with.
   */
  onGameBegin: function(playerCount, cash) {
    this.log("game begin with %d players and $%d", playerCount, cash);
  },

  /**
   * Called once a game has completed.
   *
   * @param {Number} cash the amount of cash you have remaining, which can be 0.
   * @param {Number} rounds the number of rounds executed.
   */
  onGameEnd: function(cash, rounds) {
    this.log("game has ended after %d rounds, I'm left with $%d", rounds, cash);
  },

  /**
   * Place a bet in addition to the ante.
   *
   * @param {Number} ante the base ante already taken.
   */
  getBet: function(cash, ante) {
    this.log("What's my bet? I've got $%d and the ante (minimum bet) is $%d", cash, ante);
    return ante <= cash ? ante : cash;
  },

  /**
   * Process a hand, will be called continually until one of the following
   * happens:
   *
   *  - You return `actions.stand` to stop receiving more cards.
   *  - You reach 21 after a hit.
   *  - Your hand is busted by going over 21.
   *
   * @param {PlayerHand} hand your current hand
   * @param {Number} bet your current bet, including the ante
   * @param {PlayerHand} dealer the dealer's hand
   * @param {Actions} actions your available actions
   */
  getAction: function(hand, bet, dealer, table, actions) {
    var self = this;

    this.log("what should i do? my hand is: %s", hand);
    hand.cards.forEach(function(card, index) {
      self.log("card %d: %s of %s [value: %d]", index, card.face, card.suit, card.value);
    });

    if(hand.value >= 16) {
      this.log("my hand value is %d, I'll stand", hand.value);
      return actions.stand;
    } else {
      this.log("my hand value is %d, I'll hit", hand.value);
      return actions.hit;
    }
  }
};