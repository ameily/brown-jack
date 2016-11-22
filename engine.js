
var colors = require('colors');
var makeLogger = require('./log');
var logger = makeLogger('<engine>', colors.red);
var _ = require('underscore');


function BlackJackEngine(options) {
  this.deckCount = options.deckCount || 6;
  this.startingAmount = options.startingAmount || 1000;
  this.ante = options.ante || 20;
  this.profiles = options.profiles || [];
  this.roundCount = options.roundCount || 1000000;
}

BlackJackEngine.prototype._getPlayerBet = function(player) {
  var bet;
  try {
    bet = player.profile.bet(player.cash, this.ante);
  } catch(e) {
    bet = this.ante;
    player.profile.log("error: bet() threw exception: %s", e);
  }

  if(!_.isNumber(bet)) {
    player.profile.log("error: bet() did not return a number: %s", bet);
    bet = this.ante;
  }

  if(bet > player.cash) {
    player.profile.log("error: bet amount of %d greater than cash on hand: %d",
                       bet, player.cash);
    bet = player.cash;
  } else if(bet < this.ante) {
    bet = this.ante > player.cash ? player.cash : this.ante;
  }

  return bet;
};

BlackJackEngine.prototype._getPlayerAction = function(player, table, dealerCard, actions) {
  var action;

  try {
    action = player.step(
      PlayerHand(player.hand), player.bet, dealerCard, table, actions
    );
  } catch(e) {
    //TODO log
  }

  if(!action) {
    //TODO log message
    console.log('no action specified, assuming stand');
    action = 'stand';
  }

  if(['hit', 'stand'].indexOf(action) < 0) {
    //TODO
    action = 'stand';
  }

  // if(action == 'split' && !player.hand.canSplit) {
  //   //TODO
  //   action = 'stand';
  // }

  return action;
};

BlackJackEngine.prototype.runRound = function(players, shoe) {
  /*
   * Run a single round. Each player will run.
   */

  var self = this;
  var dealerHand = new EngineHand();
  var actions = new Actions();

  players.forEach(function(player) {
    //
    // Setup each player by calling the onRoundBegin hook and getting the
    // player's ante and additional bet.
    //
    player.hand = new EngineHand();
    player.profile.onRoundBegin(player.cash);
    player.bet = self._getPlayerBet(player);
    player.log("bet: %d", player.bet);
  });

  for(var i = 0; i < 2; ++i) {
    //
    // Deal each player two cards.
    //
    players.forEach(function(player) {
      player.hand.push(shoe.next());
    });
    dealerHand.push(shoe.next());
  }

  if(dealer.hand.isBlackjack) {
    //
    // The dealer has blackjack, end the round immediately.
    //
    players.forEach(function(player) {
      // Check if any player has blackjack as well. Players with blackjack will
      // not lose any money.
      if(player.hand.isBlackjack) {
        // Player has blackjack, push their chips.
        player.bet = 0;
      } else {
        // Player does not have blackjack, take their money.
        player.cash -= player.bet;
      }

      player.profile.onRoundEnd(player.bet);
    });

    return;
  }

  players.forEach(function(player) {
    // Let each player run
    var table = makeTable(players, player);
    var done = false;
    var action;
    while(!done) {
      // Let the profile choose what action to perform
      action = self._getPlayerAction(player,table, dealerHand[1], actions);
      if(action == 'stand') {
        // Player wants to stand; finish player's round
        done = true;
      } else if(action == 'hit') {
        // player wants to hit
        player.hand.push(show.next());
        if(player.hand.value >= 21) {
          // The player busted; finish player's round
          done = true;
          player.profile.onBust(player.bet);
        }
      }
    }
  });

  players.forEach(function(player) {
    // Let each player know whether they won or lost
    if(player.hand.value > 21) {
      player.losses += 1;
    } else if(player.hand.value > dealerHand.value || dealerHand.value > 21) {
      player.wins += 1;
      if(player.hand.isBlackajack) {
        player.cash += player.bet + Math.floor(player.bet * 1.5);
      } else {
        player.cash += player.bet * 2;
      }
    } else if(player.value == dealerHand.value) {
      player.ties += 1;
      player.cash += player.bet;
    } else {
      player.losses += 1;
    }
  })
};

BlackJackEngine.prototype.runGame = function() {
  var self = this;
  var shoe = new DealingShoe(this.deckCount);
  var done = false;
  var round;

  var players = this.profiles.map(function(profile) {
    return {
      profile: profile,
      cash: self.playerStartingCash,
      hard: null,
      wins: 0,
      losses: 0,
      ties: 0
    };
  });

  var activePlayers = players.concat([]);

  players.forEach(function(player) {
    player.onGameBegin(players.length, player.cash);
  });

  for(round = 0; round < this.maxRoundCount; ++round) {
    this.runRound(activePlayer, shoe);

    active = active.filter(function(player) {
      var hasMoney = player.cash > 0;
      if(!hasMoney) {
        player.eliminationRound = round;
      }
    });

    if(active.length == 0) {
      break;
    }
  }

  players.forEach(function(player) {
    player.profile.onGameEnd(player.cash, round);
  });
};

