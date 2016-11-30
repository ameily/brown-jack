
module.exports = {
  name: "simple-dealer",

  /**
   * Place a bet in addition to the ante.
   *
   * @param {Number} ante the base ante already taken.
   */
  getBet: function(cash, ante) {
    // we return double the ante if we have enough money for 20 more
    // rounds.
    if(cash >= (20 * ante)) {
      return ante * 2;
    } else {
      return ante;
    }
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
    if(hand.value >= 16) {
      return actions.stand;
    } else {
      return actions.hit;
    }
  }

};