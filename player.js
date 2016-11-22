
var _ = require('underscore');

var PlayerStub = {
  name: "<PlayerStub>",

  /**
   * Called when a round begins.
   *
   * @param {Number} cash the amount of cash the player has on hand to bet.
   */
  onRoundBegin: function(cash) {
  },

  /**
   * Called after a round has ended.
   *
   * @param {Number} cash the amount of cash you have on hand.
   * @param {Number} winnings the amount of winnings, or losses, resulting
   *  from the round (will be negative if the round was lost).
   * @param {Array} table the table's cards shown at the end of the
   *  round, includes the dealers and your cards. Each item in the Array
   *  is an array of cards representing a single player's hand.
   */
  onRoundEnd: function(cash, winnings, table) {
  },

  /**
   * Called once a new game begins.
   *
   * @param {Number} playerCount number of active players
   * @param {Number} cash the amount of cash you start with.
   */
  onGameBegin: function(playerCount, cash) {
  },

  /**
   * Called once a game has completed.
   *
   * @param {Number} cash the amount of cash you have remaining, which can be 0.
   * @param {Number} rounds the number of rounds executed.
   */
  onGameEnd: function(cash, rounds) {
  },

  /**
   * Called when your current hand has gone above 21.
   */
  onBust: function(bet) {
  },


  /**
   * Place a bet in addition to the ante.
   *
   * @param {Number} ante the base ante already taken.
   */
  bet: function(ante) {
    return 0;
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
  step: function(hand, bet, dealer, table, actions) {
    if(hand.value >= 16) {
      return actions.stand;
    } else {
      return actions.hit;
    }
  }
};



