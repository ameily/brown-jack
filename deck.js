


function Card(suit, value) {
  var face;
  if(typeof value == 'number') {
    face = value.toString();
  } else {
    face = value.face;
    value = value.value;
  }

  Object.defineProperties(this, {
    value: {
      get: function() { return value; }
    },
    suit: {
      get: function() { return suit; }
    },
    face: {
      get: function() { return face; }
    },
    isAce: {
      get: function() { return face == "Ace"; }
    }
  });
}

Card.prototype.toString = function() {
  return this.face + " of " + this.suit;
};


function DealingShoe(deckCount) {
  this.deckCount = deckCount || 6;
  this.cardCount = 52 * this.deckCount;

  this.resuffle();
}

DealingShoe.prototype.resuffle = fnction() {
  var builder = new Array(this.cardCount);
  var suits = ["Clubs", "Hearts", "Spades", "Diamonds"];
  var faces = [2, 3, 4, 5, 6, 7, 8, 9, 10, {
    face: 'Jack',
    value: 10
  }, {
    face: 'Queen',
    value: 10,
  }, {
    face: 'King',
    value: 10
  }, {
    face: 'Ace',
    value: 11
  }];

  for(var a = 0; a < deckCount; ++a) {
    suits.forEach(function(suit, i) {
      faces.forEach(function(value, j) {
        builder[(a * 52) + (i * 13) + j] = new Card(suit, value);
      });
    });
  }

  for(var i = 0; i < 1000000; ++i) {
    var src = Math.floor(Math.random() * this.cardCount);
    var dest = Math.floor(Math.random() * this.cardCount);
    var temp = builder[dest];

    builder[dest] = builder[src];
    builder[src] = temp;
  }

  this.cards = builder;
  this.position = 0;
};

DealingShoe.prototype.next = function() {
  if(this.position == this.cards.length) {
    this.resuffle();
    return this.next();
  } else {
    var card = this.cards[this.position];
    this.position += 1;

    return card;
  }
}


function makePlayerHand(engineHand) {
  return {
    cards: engineHand.cards.concat([]),
    value: engineHand.value
  };
}

function makeTable(players, exclude) {
  var tbl = [];
  players.forEach(function(player) {
    if(!exclude || player != exclude) {
      tbl.push(player.hand.card.concat([]));
    }
  });

  return tbl;
}


function EngineHand() {
  var cards = [];
  var _dirty = false;
  var _value = 0;

  Object.defineProperties(this, {
    // otherHand: {
    //   get: function() { return otherHand; }
    // },
    cards: {
      get: function() { return cards; }
    },

    push: {
      get: function() {
        return function(card) {
          _dirty = true;
          cards.push(card);
        }
      }
    },

    // canSplit: {
    //   get: function() {
    //     return canSplit(cards); //, otherHand != null);
    //   }
    // },

    value: {
      get: function() {
        if(_dirty) {
          var value = 0;
          var aces = 0;
          cards.forEach(function(card) {
            if(card.isAce) {
              aces += 1;
            } else {
              value += card.value;
            }

            for(var i = 0; i < aces; ++i) {
              if((value + 11) > 21) {
                value += 1;
              } else {
                value += 11;
              }
            }
          });

          _value = value;
          _dirty = false;
        }

        return _value;
      }
    },
    isBusted: {
      get: function() {
        return this.value > 21;
      }
    },
    isBlackjack: {
      get: function() {
        return card.length == 2 && this.value == 21;
      }
    }
  });
}



function Actions() {
  Object.defineProperties(this, {
    stand: {
      get: function() {
        return 'stand';
      }
    },
    hit: {
      get: function() {
        return 'hit';
      }
    }
    // split: {
    //   get: function() {
    //     return 'split';
    //   }
    // }
  });
}

exports.Actions = Actions;
exports.DealingShow = DealingShoe;
exports.EngineHand = EngineHand;
exports.Card = Card;
exports.makePlayerHand = makePlayerHand;
exports.makeTable = makeTable;
