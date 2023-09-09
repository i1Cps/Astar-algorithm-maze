import { MazeCell } from "./mazeCell";
import { Colours } from "./interfaces/colours";

// Class using an A* algorithm to solve a maze
export class AStarMazeSolver {
  private start: MazeCell;
  private finish: MazeCell;
  private mazeGrid: MazeCell[][];
  private distanceTravelled: number;
  private paths: MazeCell[];
  private chosenPaths: [];
  private solved: boolean;
  private backtracking: boolean;
  private mazeSize: number;
  private mazeRows: number;
  private mazeColumns: number;
  private neighbourCounter: number;
  private solving: boolean;

  constructor(
    start: MazeCell,
    finish: MazeCell,
    mazeGrid: MazeCell[][],
    mazeSizes: number[]
  ) {
    this.start = start;
    this.finish = finish;
    this.mazeGrid = mazeGrid;
    this.distanceTravelled = 0;
    this.paths = [];
    this.chosenPaths = [];
    this.solved = false;
    this.backtracking = false;
    this.mazeSize = mazeSizes[0];
    this.mazeRows = mazeSizes[1];
    this.mazeColumns = mazeSizes[2];
    this.neighbourCounter = 0;
    this.solving = false;
  }

  // Start algorithm from start cell
  setup() {
    this.paths.push(this.start);
    this.solving = true;

    // Initialise G and F scores for the starting cell
    this.start.setGScore(0);
    this.start.setFScore(
      this.getManhattanDistance(this.start, this.finish) +
        this.start.getGScore()
    );
    console.log("solver initiated");
  }

  // This function performs a step of the A* algorithm
  solveStep() {
    // Get previous path and remove the active square colour from its position
    // This nonsense is to make sure when A* solves the maze there are no random squares with the active square colour left on the boad
    for (let i = 1; i < this.neighbourCounter + 1; i++) {
      let previousPath = this.paths[this.paths.length - i];
      previousPath.removeCellColour(previousPath, Colours.greenColour);
      previousPath.setActiveSquareColour(false);
    }
    this.neighbourCounter = 0;

    if (this.paths.length > 0 && this.solved === false) {
      // Out of all the paths currently known get the one with lowest fscore
      let current = this.getLowestFscore(this.paths);

      // If top cell in Path equals the finish cell, then maze is solved and we have the best path
      if (current === this.finish) {
        this.solved = true;
        this.solving = false;
        this.backtracking = true;
        this.finish = current;
        return;
      } else if (current == null) {
        return null;
      } else {
        // Fill the cell with the best F score with grey
        current.fillCellColour(
          current.getColumnNumber(),
          current.getRowNumber(),
          this.mazeSize,
          this.mazeColumns,
          this.mazeRows,
          Colours.greyColour,
          false
        );
        current.setGreyColour(true);

        // Remove current cell from queue/list/array/stack
        const index = this.paths.indexOf(current);
        if (index > -1) {
          this.paths.splice(index, 1); // 2nd parameter means remove one item only
        }
        // Search through neighbour cells of current to see if one has a better fscore
        let neighbourCells = this.getNeighbourCells(current, this.mazeGrid);
        if (neighbourCells) {
          for (let neighbour of neighbourCells) {
            let new_gscore = current?.getGScore() + 1;
            if (new_gscore < neighbour.getGScore()) {
              // This is a better path than another path involving the neighbour cell so basically update gscore for neightbour
              neighbour.setGScore(new_gscore);
              neighbour.setFScore(
                new_gscore + this.getManhattanDistance(neighbour, this.finish)
              );
              neighbour.setPreviousCell(current);
              current.setNextCell(neighbour);

              // If path is not aleady stored, store it
              if (!this.paths.includes(neighbour)) {
                this.neighbourCounter++;
                this.paths.push(neighbour);

                // Place active square to show this cell is not the head of the best path
                neighbour.fillCellColour(
                  neighbour.getColumnNumber(),
                  neighbour.getRowNumber(),
                  this.mazeSize,
                  this.mazeColumns,
                  this.mazeRows,
                  Colours.greenColour,
                  false
                );
                neighbour.setActiveSquareColour(true);
              }
            }
          }
        }
      }
    }
    // Best path has been found and now its time to highlight it
    else if (this.backtracking === true) {
      // Remove grey cells in the way
      this.finish.removeCellColour(this.finish, Colours.greyColour);
      this.finish.setGreyColour(false);
      // Show final path with purple lines
      this.finish.fillCellColour(
        this.finish.getColumnNumber(),
        this.finish.getRowNumber(),
        this.mazeSize,
        this.mazeColumns,
        this.mazeRows,
        Colours.purpleColour,
        true
      );

      if (this.finish === this.start) {
        // Then we have rendered best path
        this.backtracking = false;
        console.log("solved");
      } else {
        // Else backtrack to connected cell on best path
        // Below is just type checking becuase of .... typescript
        this.finish = this.finish.getPreviousCell() as MazeCell;
      }
    }
  }

  getNeighbourCells(cell: MazeCell, mazeGrid: MazeCell[][]): MazeCell[] | null {
    let row = cell.getRowNumber();
    let col = cell.getColumnNumber();
    let neighbourCells: MazeCell[] = [];
    // If top wall dosnt exist it means cell above is a neighbour
    if (cell.getWalls(1) === false) {
      neighbourCells.push(mazeGrid[row - 1][col]);
    }
    // If bottom wall dosnt exist it means cell below is a neighbour
    if (cell.getWalls(3) === false) {
      neighbourCells.push(mazeGrid[row + 1][col]);
    }
    // If left wall dosnt exist it means cell on left is a neighbour
    if (cell.getWalls(4) === false) {
      neighbourCells.push(mazeGrid[row][col - 1]);
    }
    // If right wall dosnt exist it means cell on right is a neighbour
    if (cell.getWalls(2) === false) {
      neighbourCells.push(mazeGrid[row][col + 1]);
    }

    // return all neighbour paths found
    if (neighbourCells.length > 0) {
      return neighbourCells;
    } else {
      return null;
    }
  }

  // Returns the path with the lowest F score
  getLowestFscore(paths: MazeCell[]) {
    let lowest = [];
    for (let path of paths) {
      if (lowest.length === 0) {
        lowest.push(path);
      } else if (path.getFScore() < lowest[0].getFScore()) {
        lowest = [];
        lowest.push(path);
      } else if (path.getFScore() === lowest[0].getFScore()) {
        lowest.push(path);
      }
    }
    // If there exists multiple paths of the same fscore randomely pick a path
    if (lowest.length > 0) {
      let random = Math.floor(Math.random() * lowest.length);
      return lowest[random];
    } else {
      return undefined;
    }
  }

  // Heuristic function or fscore:  the actual distance between two given cells in a straight line (could be diagonal if that makes sense)
  getManhattanDistance(cell1: MazeCell, cell2: MazeCell) {
    let cell1X = cell1.getColumnNumber();
    let cell1Y = cell1.getRowNumber();

    let cell2X = cell2.getColumnNumber();
    let cell2Y = cell2.getRowNumber();

    const horizontalDistance = Math.abs(cell1X - cell2X);
    const verticalDistance = Math.abs(cell1Y - cell2Y);

    return horizontalDistance + verticalDistance;
  }

  // Getters and Setters
  getSolved(): boolean {
    return this.solved;
  }

  getBackTracking(): boolean {
    return this.backtracking;
  }
}
