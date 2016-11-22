
module.exports = {
  name: "<Dealer>",

  step: function(cards, dealerCards, table, actions) {
    if(hand.value >= 16) {
      return actions.stay;
    } else {
      return actions.hit;
    }
  },

  lose: function(amount) {
  },

  win: function(amount) {
  }
};