
var colors = require('colors');
var makeLogger = require('./log');
var logger = makeLogger('<engine>', colors.red);
var _ = require('underscore');
var deck = require('./deck');
var DealingShoe = deck.DealingShoe;
var makeTable = deck.makeTable;
var EngineHand = deck.EngineHand;
var Actions = deck.Actions;
var util = require('util');
var Player = require('./player');


function BlackjackEngine(options) {
  this.deckCount = options.deckCount || 6;
  this.playerStartingCash = options.playerStartingCash || 1000;
  this.ante = options.ante || 20;
  this.profiles = options.profiles || [];
  this.roundCount = options.roundCount || 1000000;
}


/**
 * Run a single round of play. Each player will be dealt cards and allowed
 * the option to hit/stand
 */
BlackjackEngine.prototype.runRound = function(dealer, players, shoe) {
  var self = this;
  var actions = new Actions();

  dealer.hand = new EngineHand();

  players.forEach(function(player) {
    //
    // Setup each player by calling the onRoundBegin hook and getting the
    // player's ante and additional bet.
    //
    player.hand = new EngineHand();
    player.roundBegin();
    player.bet = player.getBet(self.ante);
  });

  for(var i = 0; i < 2; ++i) {
    //
    // Deal each player two cards.
    //
    players.forEach(function(player) {
      var card = shoe.next();
      //player.log("dealt %s", card);
      player.hand.push(card);
    });

    dealer.hand.push(shoe.next());
  }

  if(!dealer.hand.isBlackjack) {
    //
    // We only allow players an action if the dealer does not have blackjack.
    //
    dealer.log("shows %s", dealer.hand.cards[1]);

    players.forEach(function(player) {
      // Let each player run
      var table = makeTable(players, dealer.hand.cards[1]);
      var done = false;
      var action;

      logger("action moves to %s", player.profile.name);
      while(!done) {
        // Let the profile choose what action to perform
        player.log("shows %s", player.hand);
        action = player.getAction(player.bet, table, dealer.hand[1], actions);
        if(action == 'stand') {
          // Player wants to stand; finish player's round
          done = true;
        } else if(action == 'hit') {
          // player wants to hit
          var card = shoe.next();
          player.hand.push(card);

          player.log("dealt %s (%s)", card, player.hand);

          if(player.hand.value > 21) {
            // The player busted; finish player's round
            done = true;
            player.log("hand busted: %s", player.hand);
          }
        }
      }
    });
  }

  dealer.log("reveals hand %s", dealer.hand);

  if(dealer.hand.value < 16) {
    while(dealer.hand.value < 16) {
      var card = shoe.next();
      dealer.log("hit: %s", card);
      dealer.hand.push(card);

      if(dealer.hand.value > 21) {
        dealer.log("bust");
      } else if(dealer.hand.value >= 16) {
        dealer.log("stand");
      }
    }
  } else {
    dealer.log("stand");
  }

  dealer.log("final hand %s", dealer.hand);

  players.forEach(function(player) {
    // Let each player know whether they won or lost
    var result;
    var winnings;
    if(player.hand.value > 21) {
      result = 'bust';
      winnings = 0 - player.bet;
      // a bust log message is already printed
    } else if(player.hand.value > dealer.hand.value || dealer.hand.value > 21) {
      result = 'win';
      winnings = player.bet;

      if(player.hand.isBlackjack) {
        winnings += Math.floor(player.bet * 0.5);
      } else {
        //winnings += player.bet;
      }

      player.log("hand beats dealer's, won $%d", winnings);
    } else if(player.hand.value == dealer.hand.value) {
      result = 'push';
      winnings = 0;
      player.log("hand ties dealer's")
    } else {
      result = 'loss';
      winnings = 0 - player.bet;
      player.log("hand loses to dealer's, lost $%d", player.bet);
    }

    player.roundEnd(result, player.bet, winnings, makeTable(players, dealer.hand.cards));

    player.log("end of round cash: %d", this.cash, winnings, this.hand);
  });
};

BlackjackEngine.prototype.runGame = function() {
  var self = this;
  var shoe = new DealingShoe(this.deckCount);
  var done = false;
  var round;
  var dealer = {
    hand: null,
    log: makeLogger("<dealer>", colors.yellow)
  };

  var players = this.profiles.map(function(profile) {
    return new Player(profile, self.playerStartingCash, makeLogger(profile.name, colors.green));
  });

  var activePlayers = players.concat([]);

  players.forEach(function(player) {
    logger("player: %s; %d", player.profile.name, player.cash);
    player.gameBegin(players.length, player.cash);
  });

  for(round = 1; round <= this.roundCount; ++round) {
    this.runRound(dealer, activePlayers, shoe);

    activePlayers = activePlayers.filter(function(player) {
      var hasMoney = player.cash > 0;
      if(!hasMoney) {
        player.log("has been eliminated in round %d", round);
      }

      return hasMoney;
    });

    if(activePlayers.length == 0) {
      logger("all players eliminated");
      break;
    }
  }

  players.forEach(function(player) {
    player.gameEnd(player.cash, round);
  });

  var standings = players.concat([]);
  standings.sort(function(a, b) {
    // first sort on stats.lastRound
    if(a.stats.lastRound < b.lastRound) {
      return 1;
    } else if(a.stats.lastRound > b.lastRound) {
      return -1;
    // Next, sort on remaining cash
    } else if(a.stats.cash < b.stats.cash) {
      return 1;
    } else if(a.stats.cash > b.stats.cash) {
      return -1;
    // finally sort on max cash
    } else if(a.stats.maxCash < b.stats.maxCash) {
      return 1;
    } else if(a.stats.maxCash > b.stats.maxCash) {
      return -1;
    } else {
      // everything is equal
      return 0;
    }
  });

  logger("game has ended after %d rounds", round);
  standings.forEach(function(player, rank) {
    player.log("rank %d: $%d, average hand value per round: %s",
               rank + 1, player.cash,
               player.stats.averageHandValue.toFixed(2));
    player.log("stats: %s", util.inspect(player.stats));
  });
};

module.exports = BlackjackEngine;