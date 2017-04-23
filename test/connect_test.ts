import { GenericGame } from "ts-turnbased";
import { Connect, Coordinate } from "../index";

import { assert } from "chai";

describe("Connect", () => {
  it("return the correct win line", function() {
    let game: Connect = new Connect({
        boardWidth: 3,
        boardHeight: 3,
        k: 3,
        p: 1,
        q: 1
    });
    game.playMove([{x: 0, y: 0}], 0);
    game.playMove([{x: 1, y: 1}], 1);
    game.playMove([{x: 0, y: 2}], 0);
    game.playMove([{x: 1, y: 0}], 1);
    game.playMove([{x: 0, y: 1}], 0);
    let winLine: Array<Coordinate> = game.getWinLine();
    assert.lengthOf(winLine, 3);
    assert.deepEqual(winLine[0], {x: 0, y: 0});
    assert.deepEqual(winLine[1], {x: 0, y: 1});
    assert.deepEqual(winLine[2], {x: 0, y: 2});
  });
});
