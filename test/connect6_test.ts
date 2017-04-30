import { Game } from "ts-turnbased";
import { Connect, connect6Options } from "../index";

import { assert } from "chai";

let game: Game;

describe("Connect6", function() {
  beforeEach(() => {
    game = new Connect(connect6Options());
    game.start();
  });

  it("should throw an error if I try to play outside the board", function() {
    assert.throws(() => {
      game.playMove([{x: 20, y: 1}], 0);
    });
  });

  it("should throw an error if I try to play the same place twice in a single move", function() {
    game.playMove([{x: 0, y: 0}], 0);
    assert.throws(() => {
      game.playMove([{x: 1, y: 1}, {x: 1, y: 1}], 1);
    });
  });

  it("should throw an error if I try to place two stones on the first turn", function() {
    assert.throws(() => {
      game.playMove([{x: 1, y: 1}, {x: 1, y: 1}], 0);
    });
  });

  it("should throw an error if I try to place only one stone NOT on the first turn", function() {
    game.playMove([{x: 0, y: 0}], 0);
    assert.throws(() => {
      game.playMove([{x: 1, y: 1}], 1);
    });
  });
 
  it("should throw an error if I try to play in an non-empty position", function() {
    game.playMove([{x: 0, y: 0}], 0);
    assert.throws(() => {
      game.playMove([{x: 0, y: 0}, {x: 1, y: 1}], 1);
    });
  });

  it("should be able to play a simple game", function() {
    game.playMove([{x: 0, y: 0}], 0);
    game.playMove([{x: 1, y: 0}, {x: 1, y: 1}], 1);
    game.playMove([{x: 0, y: 1}, {x: 0, y: 2}], 0);
    game.playMove([{x: 1, y: 2}, {x: 1, y: 3}], 1);
    game.playMove([{x: 0, y: 3}, {x: 0, y: 4}], 0);
    game.playMove([{x: 1, y: 4}, {x: 1, y: 5}], 1);
    assert.equal(game.getPlayersToPlay().size, 0);
    assert.equal(game.getWinners().size, 1);
    assert.isTrue(game.getWinners().has(1));
  });

  it("should be able to play a full game", function() {
    // game taken from http://java.csie.nctu.edu.tw/~icwu/connect6/connect6.html#Ref_record
    game.playMove([{x: 9 , y: 9}], 0);
    game.playMove([{x: 9 , y: 10}, {x: 9 , y: 8 }], 1);
    game.playMove([{x: 10, y: 10}, {x: 8 , y: 8 }], 0);
    game.playMove([{x: 6 , y: 6 }, {x: 12, y: 12}], 1);
    game.playMove([{x: 10, y: 8 }, {x: 8 , y: 10}], 0);
    game.playMove([{x: 10, y: 9 }, {x: 8 , y: 9 }], 1);
    game.playMove([{x: 11, y: 7 }, {x: 11, y: 6 }], 0);
    game.playMove([{x: 7 , y: 11}, {x: 12, y: 6 }], 1);
    game.playMove([{x: 11, y: 9 }, {x: 11, y: 8 }], 0);
    game.playMove([{x: 11, y: 10}, {x: 11, y: 5 }], 1);
    game.playMove([{x: 12, y: 8 }, {x: 13, y: 7 }], 0);
    game.playMove([{x: 9 , y: 11}, {x: 15, y: 5 }], 1);
    game.playMove([{x: 9 , y: 7 }, {x: 8 , y: 6 }], 0);
    game.playMove([{x: 13, y: 11}, {x: 7 , y: 5 }], 1);
    game.playMove([{x: 8 , y: 7 }, {x: 10, y: 7 }], 0);
    game.playMove([{x: 7 , y: 7 }, {x: 12, y: 7 }], 1);
    game.playMove([{x: 9 , y: 6 }, {x: 8 , y: 5 }], 0);
    game.playMove([{x: 7 , y: 4 }, {x: 8 , y: 4 }], 1);
    game.playMove([{x: 13, y: 10}, {x: 12, y: 9 }], 0);
    assert.equal(game.getPlayersToPlay().size, 0);
    assert.equal(game.getWinners().size, 1);
    assert.isTrue(game.getWinners().has(0));
  });
});
