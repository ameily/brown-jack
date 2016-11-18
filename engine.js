

function BlackJackEngine(options) {
  this.players = options.players;
  this.deckCount = options.deckCount || 6;
  this.startingAmount = options.startingAmount || 1000;
  this.ante = options.ante || 20;
}

BlackJackEngine.prototype.runGame = function() {

};

