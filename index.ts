import { 
  AbstractStrategyGame,
  IllegalMoveError,
  InvalidMoveError,
  InvalidOptionsError,
  Status
} from "ts-turnbased";

export interface ConnectOptions {
  boardWidth: number,
  boardHeight: number,
  // Number of stones in a row to win
  k: number,
  // Number of stones placed per turn
  // Defaults to 1.
  p?: number,
  // Number of stones placed on the first turn
  // Defaults to p.
  q?: number,
  // If the game considers k+1 in a row a win or not.
  // Defaults to false.
  noOverlines?: boolean
  // TODO: Support the different Gomoku variations.
}

export interface Coordinate {
  x: number,
  y: number
}

function areEqual(c1: Coordinate, c2: Coordinate): boolean {
  return c1.x == c2.x && c1.y == c2.y;
}

export type ConnectMove = Coordinate|Array<Coordinate>;

function getCoordinates(move: ConnectMove): Array<Coordinate> {
  return Array.isArray(move) ? move : [move];
}

export class Connect extends AbstractStrategyGame<ConnectOptions, ConnectMove> {
  private board: Array<Array<number>>;
  // Once a winner is found, keep track of it so that we don't have to find them multiple times.
  private winner: number;
  // The line that ended the game.
  private winLine: Array<Coordinate>;

  constructor(options: ConnectOptions) {
    super(options);
    this.board = [];
    for (let i = 0; i < this.options.boardWidth; ++i) {
      this.board.push([]);
      for (let j = 0; j < this.options.boardHeight; ++j) {
        this.board[i].push(0);
      }
    }
    this.winner = 0;
    this.winLine = null;
  }

  protected sanitizeOptions(options: any): ConnectOptions {
    if (typeof options.boardWidth != "number" || options.boardWidth < 1) {
      throw new InvalidOptionsError(options, "boardWidth must be a number greater or equal to 1");
    }
    if (typeof options.boardHeight != "number" || options.boardHeight < 1) {
      throw new InvalidOptionsError(options, "boardHeight must be a number greater or equal to 1");
    }
    if (typeof options.k != "number" || options.k < 1) {
      throw new InvalidOptionsError(options, "k must be a number greater or equal to 1");
    }
    // p not being set is a valid value that will default to 1.
    if (options.p !== null && options.p !== undefined) {
      if (typeof options.p != "number" || options.p < 1) {
        throw new InvalidOptionsError(options, "p must be a number greater or equal to 1");
      }
    }
    // q not being set is a valid value that will default to p.
    if (options.q !== null && options.q !== undefined) {
      if (typeof options.q != "number" || options.q < 1) {
        throw new InvalidOptionsError(options, "q must be a number greater or equal to 1");
      }
    }
    // noOverlines not being set is a valid value that will default to false.
    if (options.noOverlines !== null && options.noOverlines !== undefined) {
      if (typeof options.noOverlines != "boolean") {
        throw new InvalidOptionsError(options, "noOverlines must be a boolean");
      }
    } 
    let sanitizedOptions: ConnectOptions = {
      boardWidth: Math.floor(options.boardWidth),
      boardHeight: Math.floor(options.boardHeight),
      k: Math.floor(options.k),
      p: options.p ? Math.floor(options.p) : 1,
      q: options.q ? Math.floor(options.q) : 0,
    };
    if (sanitizedOptions.q == 0) {
      sanitizedOptions.q = sanitizedOptions.p;
    }
    if (options.noOverlines) {
      sanitizedOptions.noOverlines = true;
    }
    return sanitizedOptions;
  }

  protected sanitizeMove(move: any): ConnectMove {
    if (Array.isArray(move)) {
      let coordinates: Array<Coordinate> = move.map(item => this.sanitizeCoordinate(item));
      // Assert that all coordinates are distinct.
      for (let i = 0; i < coordinates.length; ++i) {
        for (let j = i + 1; j < coordinates.length; ++j) {
          if (areEqual(coordinates[i], coordinates[j])) {
            throw new InvalidMoveError(move, "All positions must be distinct");    
          }
        }
      }
      return coordinates;
    } else {
      return this.sanitizeCoordinate(move);
    }
  }

  private sanitizeCoordinate(coordinate: any): Coordinate {
    if (typeof coordinate.x != "number" || coordinate.x < 0) {
      throw new InvalidMoveError(coordinate, "x must be a number greater or equal to 0");
    }
    if (typeof coordinate.y != "number" || coordinate.y < 0) {
      throw new InvalidMoveError(coordinate, "y must be a number greater or equal to 0");
    }
    return {
      x: Math.floor(coordinate.x),
      y: Math.floor(coordinate.y)
    }
  }

  protected assertMoveIsLegal(move: ConnectMove, player: number): void {
    let coordinates: Array<Coordinate> = getCoordinates(move);
    // Check that the move places the correct number of stones.
    if (this.moves.length == 0) {
      if (coordinates.length != this.options.q) {
        throw new IllegalMoveError(move, player,
            `The first play should place exactly ${this.options.q} stones`);
      }
    } else {
      // If the board has less than p empty positions, then we make an exeption and we allow the
      // player to fill the board as the game's last move.
      if (coordinates.length != Math.min(this.options.p, this.numberOfEmptyPositionsLeft())) {
        throw new IllegalMoveError(move, player,
            `Except for the first move, each move should place exactly ${this.options.p} stones`);
      }
    }
    // For each stone placed...
    for (let c of coordinates) {
      // check that the stone is on the board.
      if (c.x >= this.options.boardWidth || c.y >= this.options.boardHeight) {
        throw new IllegalMoveError(move, player, "Playing outside the board");
      }
      // check that the stone is played on an unoccupied position.
      if (this.board[c.x][c.y] != 0) {
        throw new IllegalMoveError(move, player, "Position is already occupied");
      }
    }
  }

  protected processMove(move: ConnectMove): void {
    let coordinates: Array<Coordinate> = getCoordinates(move);
    let stoneColour: number = 1 + (this.moves.length % 2);
    for (let c of coordinates) {
      this.board[c.x][c.y] = stoneColour;
    }
    for (let c of coordinates) {
      this.winLine = this.getWinLineAtCoordinate(c);
      if (this.winLine) {
        this.winner = stoneColour;
        break;
      }
    }
  }

  protected getStatus(): Status {
    if (this.winner != 0) {
      return this.winner == 1 ? Status.P1_WIN : Status.P2_WIN;
    }
    return this.numberOfEmptyPositionsLeft() == 0 ? Status.DRAW : Status.IN_PROGRESS;
  }

  private numberOfEmptyPositionsLeft(): number {
    let total: number = this.options.boardWidth * this.options.boardHeight;
    if (this.moves.length > 0) {
      total -= this.options.q;
      total -= this.options.p * (this.moves.length - 1);
    }
    // The last move might have been less than p if it filled the board.
    // So take the max of 0 and total in case we overcounted the number of played stones.
    return Math.max(0, total);
  }

  private getWinLineAtCoordinate(c: Coordinate): Array<Coordinate> {
    let winLine: Array<Coordinate>;
    winLine = this.getWinLineWithDirection(c, {x: 1, y: 0});
    if (winLine) {
      return winLine
    }
    winLine = this.getWinLineWithDirection(c, {x: 0, y: 1});
    if (winLine) {
      return winLine
    }
    winLine = this.getWinLineWithDirection(c, {x: 1, y: 1});
    if (winLine) {
      return winLine
    }
    winLine = this.getWinLineWithDirection(c, {x: 1, y: -1});
    if (winLine) {
      return winLine
    }
    return null;
  }

  private getWinLineWithDirection(c: Coordinate, direction: Coordinate): Array<Coordinate> {
    let colour: number = this.board[c.x][c.y];
    if (colour == 0) {
      return null;
    }
    let length: number = 1;
    let start: Coordinate = {x: c.x, y: c.y};
    let end: Coordinate = {x: c.x, y: c.y};
    let next: Coordinate;

    next = {x: c.x - direction.x, y: c.y - direction.y};
    while (next.x >= 0 && next.x < this.options.boardWidth
        && next.y >= 0 && next.y < this.options.boardHeight
        && this.board[next.x][next.y] == colour) {
      start.x = next.x;
      start.y = next.y;
      next.x -= direction.x;
      next.y -= direction.y;
      length += 1;
    }
    next = {x: c.x + direction.x, y: c.y + direction.y};
    while (next.x >= 0 && next.x < this.options.boardWidth
        && next.y >= 0 && next.y < this.options.boardHeight
        && this.board[next.x][next.y] == colour) {
      end.x = next.x;
      end.y = next.y;
      next.x += direction.x;
      next.y += direction.y;
      length += 1;
    }
    if (length == this.options.k || (length > this.options.k && !this.options.noOverlines)) {
      return [start, end];
    }
    return null;
  }

  // Since this is an abstract strategy game, the turn events are exactly the moves. So the game
  // itself can be used to process and replay turn events and might therefore be used by clients.
  // Clients might want to highligth the winning move, the following method will allows them to
  // avoid rewritting line detection.
  getWinLine(): Array<Coordinate> {
    if (this.winLine) {
      return [
          {x: this.winLine[0].x, y: this.winLine[0].y},
          {x: this.winLine[0].x, y: this.winLine[0].y}
      ];
    }
    return null;
  }
}

export class Tictactoe extends Connect {
  constructor() {
    super({
      boardWidth: 3,
      boardHeight: 3,
      k: 3
    });
  }
}

export interface Connect6Options {
  boardWidth?: number,
  boardHeight?: number
}

export class Connect6 extends Connect {
  constructor(options: Connect6Options) {
    super({
      boardWidth: options.boardWidth ? options.boardWidth : 19,
      boardHeight: options.boardHeight ? options.boardHeight : 19,
      k: 6,
      p: 2,
      q: 1
    });
  }
}