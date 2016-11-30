


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

DealingShoe.prototype.resuffle = function() {
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

  for(var a = 0; a < this.deckCount; ++a) {
    suits.forEach(function(suit, i) {
      faces.forEach(function(value, j) {
        builder[(a * 52) + (i * 13) + j] = new Card(suit, value);
      });
    });
  }

  var orig = builder.concat([]);

  for(var i = 0; i < 1000000; ++i) {
    var src = Math.floor(Math.random() * this.cardCount);
    var dest = Math.floor(Math.random() * this.cardCount);
    var temp = builder[dest];

    builder[dest] = builder[src];
    builder[src] = temp;
  }

  this.cards = builder;
  this.position = 0;

  var totalDistance = 0;

  orig.forEach(function(current, i) {
    var j = i + 1;
    if(j == orig.length) {
      return;
    }

    var next = orig[j];
    var currentIndex;
    var nextIndex;
    builder.forEach(function(card, bldrIndex) {
      if(card.suit == current.suit && card.face == current.face) {
        currentIndex = bldrIndex;
      } else if(card.suit == next.suit && card.face == next.face) {
        nextIndex = bldrIndex;
      }
    });

    totalDistance += Math.abs(nextIndex - currentIndex);
  });

  console.log("distance: %s", (totalDistance / (orig.length - 1)).toString());
  console.log("total: %d", totalDistance)
  console.log("length: %d", orig.length);
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
    value: engineHand.value,
    toString: function() {
      return engineHand.toString();
    }
  };
}

function makeTable(players, dealerCards) {
  var tbl = [];
  players.forEach(function(player) {
    tbl.push(player.hand.cards.concat([]));
  });

  tbl = tbl.concat(dealerCards)

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
        return this.cards.length == 2 && this.value == 21;
      }
    }
  });
}

EngineHand.prototype.toString = function() {
  return this.cards.join(', ') + ' [' + this.value.toString() + ']';
};



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
exports.DealingShoe = DealingShoe;
exports.EngineHand = EngineHand;
exports.Card = Card;
exports.makePlayerHand = makePlayerHand;
exports.makeTable = makeTable;
