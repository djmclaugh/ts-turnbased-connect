import { Game } from "ts-turnbased";
import { Connect, tictactoeOptions } from "../index";

import { assert } from "chai";

let game: Connect;

describe("Tictactoe", function() {
  beforeEach(() => {
    game = new Connect(tictactoeOptions());
    game.start();
  });

  it("should throw an error if I try to play outside the board", function() {
    assert.throws(() => {
      game.playMove([{x: 4, y: 1}], 0);
    });
  });

  it("should throw an error if I try to play in an non-empty position", function() {
    game.playMove([{x: 1, y: 1}], 0);
    assert.throws(() => {
      game.playMove([{x: 1, y: 1}], 1);
    });
  });

  it("should be able to play a simple game", function() {
    game.playMove([{x: 0, y: 0}], 0);
    game.playMove([{x: 1, y: 0}], 1);
    game.playMove([{x: 2, y: 0}], 0);
    game.playMove([{x: 0, y: 1}], 1);
    game.playMove([{x: 1, y: 1}], 0);
    game.playMove([{x: 2, y: 1}], 1);
    game.playMove([{x: 0, y: 2}], 0);
    assert.equal(game.getPlayersToPlay().size, 0);
    assert.equal(game.getLatestUpdate().winners.length, 1);
    assert.include(game.getLatestUpdate().winners, 0);
  });

  it("should be able to detect a draw", function() {
    game.playMove([{x: 0, y: 0}], 0);
    game.playMove([{x: 1, y: 0}], 1);
    game.playMove([{x: 2, y: 0}], 0);
    game.playMove([{x: 1, y: 1}], 1);
    game.playMove([{x: 0, y: 1}], 0);
    game.playMove([{x: 2, y: 1}], 1);
    game.playMove([{x: 1, y: 2}], 0);
    game.playMove([{x: 0, y: 2}], 1);
    game.playMove([{x: 2, y: 2}], 0);
    assert.equal(game.getPlayersToPlay().size, 0);
    assert.equal(game.getLatestUpdate().winners.length, 0);
  });
});
