
module.exports = {
  name: "<Dealer>",

  processHand: function(hand, dealer, players, actions) {
    if(hand.value > 16) {
      actions.stay();
    } else {
      actions.hit();
    }
  },

  lose: function(amount) {
  },

  win: function(amount) {
  }
};