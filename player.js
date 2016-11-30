
var _ = require('underscore');
var makePlayerHand = require('./deck').makePlayerHand;

var PlayerProfileStub = {
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
   * Place a bet in addition to the ante.
   *
   * @param {Number} ante the base ante already taken.
   */
  getBet: function(cash, ante) {
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
    if(hand.value >= 16) {
      return actions.stand;
    } else {
      return actions.hit;
    }
  }
};


function Player(profile, cash, log) {
  this.profile = _.defaults({}, {
    log: log
  }, profile, PlayerProfileStub);

  this.cash = cash;
  this.log = log;
  this.stats = {
    hands: 0,
    wins: 0,
    losses: 0,
    busts: 0,
    pushes: 0,
    totalValue: 0,
    maxCash: cash,
    startingCash: cash,
    lastRound: 0
  };
  this.hand = null;

  Object.defineProperties(this.stats, {
    averageHandValue: {
      get: function() {
        return this.totalValue / this.hands;
      }
    }
  });
}

Player.prototype.getBet = function(ante) {
  var bet;
  try {
    bet = this.profile.getBet(this.cash, ante);
  } catch(e) {
    // getBet threw an exception.
    this.log("error: bet() threw exception: %s", e);
  }

  if(!_.isNumber(bet) || _.isNaN(bet) || bet <= 0) {
    // getBet() didn't return a number.
    this.log("error: bet() did not return a valid number: %s", bet);
    bet = ante;
  }

  if(bet > this.cash) {
    this.log("error: bet amount of %d greater than cash on hand: %d",
               bet, this.cash);
    bet = this.cash;
  } else if(bet < ante) {
    bet = ante > this.cash ? this.cash : ante;
  }

  this.log("bet $%d (+$%d ante)", bet, bet > ante ? bet - ante : 0);

  return bet;
};


Player.prototype.getAction = function(bet, table, dealerCard, actions) {
  var action;

  try {
    action = this.profile.getAction(
      makePlayerHand(this.hand), bet, table, dealerCard, actions
    );
  } catch(e) {
    this.log("error: getAction() threw exception: %s", e);
  }

  if(!action) {
    this.log("error: getAction() did not return an action; assuming 'stand'");
    action = 'stand';
  }

  if(['hit', 'stand'].indexOf(action) < 0) {
    this.log("error: getAction() returned an invalid action (%s); assuming 'stand'", action);
    action = 'stand';
  }

  this.log(action);
  return action;
};

Player.prototype.gameBegin = function(playerCount) {
  try {
    this.profile.onGameBegin(playerCount, this.cash);
  } catch(e) {
    //TODO
  }
};

Player.prototype.gameEnd = function(round) {
  try {
    this.profile.onGameEnd(round, this.cash);
  } catch(e) {
    //TODO
  }
};

Player.prototype.roundBegin = function() {
  try {
    this.profile.onRoundBegin(this.cash);
  } catch(e) {
    //TODO
  }
};

Player.prototype.roundEnd = function(result, bet, winnings, table) {
  try {
    this.profile.onRoundEnd(result, makePlayerHand(this.hand), this.cash, bet, winnings, table);
  } catch(e) {
    //TODO
  }

  //this.log('cash += %d', winnings);
  this.cash += winnings;

  if(result == 'win') {
    this.stats.wins += 1;
  } else if(result == 'loss') {
    this.stats.losses += 1;
  } else if(result == 'bust') {
    this.stats.busts += 1;
  } else if(result == 'push') {
    this.stats.pushes += 1;
  }

  if(this.cash > this.stats.maxCash) {
    this.stats.maxCash = this.cash;
  }

  this.stats.totalValue += this.hand.value;

  this.stats.hands += 1;
  this.stats.lastRound += 1;
};

module.exports = Player;