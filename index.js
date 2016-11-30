
var BlackjackEngine = require('./engine');
var randomProfile = require('./example-profiles/random');
var dealerProfile = require('./example-profiles/dealer');
var printerProfile = require('./example-profiles/printer');

var engine = new BlackjackEngine({
  roundCount: 10,
  deckCount: 6,
  profiles: [
    randomProfile,
    dealerProfile,
    printerProfile
    // randomProfile,
    // dealerProfile,
    // randomProfile,
    // dealerProfile
  ]
});

engine.runGame();


