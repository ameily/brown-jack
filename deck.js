
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
  deckCount = deckCount || 6;
  this.cardCount = 52 * deckCount;

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

  this.cards.forEach(function(card, i) {
    console.log("%s", card);
  });
}

DealingShoe.prototype.next = function() {
  var card = this.cards[this.position];
  this.position += 1;

  return card;
}


function canSplit(cards, inSplit) {
  if(inSplit || cards.length > 2) {
    return false;
  } else {
    return cards[0].face == cards[1].face;
  }
}


function Hand(cards, otherHand) {
  Object.defineProperties(this, {
    otherHand: {
      get: function() { return otherHand; }
    },
    cards: {
      get: function() { return cards.concat([]); }
    },
    canSplit: {
      get: function() {
        return canSplit(cards, otherHand != null);
      }
    },
    value: {
      get: function() {
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

        return value;
      }
    },
    isBusted: {
      get: function() {
        return this.value > 21;
      }
    }
  });
}


var deck = new DealingShoe();
