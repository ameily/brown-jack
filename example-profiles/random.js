
module.exports = {
  name: "random",

  /**
   * Place a bet in addition to the ante.
   *
   * @param {Number} ante the base ante already taken.
   */
  getBet: function(cash, ante) {
    if(cash <= ante) {
      return ante;
    } else {
      var choice = Math.random();
      if(choice >= 0.5) {
        // we raise
        var multiplier = Math.floor((choice - 0.5) * 6.0) + 1;
        var bet = ante + (ante * multiplier);
        this.log('betting big');
        return bet <= cash ? bet : cash;
      } else {
        this.log('betting small');
        return ante;
      }
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
    if(hand.value == 21) {
      return actions.stand;
    } else if(hand.value >= 16) {
      // we hit 25% of the time when we are over 16
      return Math.floor(Math.random() * 4.0) >= 3 ? actions.hit : actions.stand;
    } else {
      // we hit 50% of the time when we are under 16
      return Math.floor(Math.random() * 2.0) >= 1 ? actions.hit : actions.stand;
    }
  }

};