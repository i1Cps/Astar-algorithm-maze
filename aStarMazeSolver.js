const greenColour = 0x39ff14;
const whiteColour = 0xffffff;
const yellowColour = 0xfbf10b;
const redColour = 0xff0000;
const blueColour = 0x0000ff;
const orangeColour = 0xffa500;
const purpleColour = 0x800080;
const greyColour = 0xb2beb5;

// Class using an A* algorithm to solve a maze
export class AStarMazeSolver{
    constructor(start,finish,maze,mazeSizes) {
      this.start = start;      
      this.finish = finish;
      this.maze = maze;
      this.distanceTravelled = 0;
      this.paths = [];
      this.chosenPaths = [];
      this.solved = false;
      this.backtracking = false;
      this.mazeSize = mazeSizes[0];
      this.mazeRows = mazeSizes[1];
      this.mazeColumns = mazeSizes[2];
      this.backtracked = false
      this.neighbourCounter = 0;
    }
  
    // Start algorithm from start cell
    setup() {
      this.paths.push(this.start)
      console.log("solver initiated")
      // Initialise G and F scores for the starting cell
      this.start.gscore = 0;
      this.start.fscore = this.getManhattanDistance(this.start, this.finish) + this.start.gscore;
    }

    // This function performs a step of the A* algorithm
    solveStep() {
      // Get previous path and remove the green square from its position
      // This nonsense is to make sure when A* solves the maze there are no random green squares left on the boad
      for(let i = 1; i<this.neighbourCounter+1; i++) {
        let previousPath = this.paths[this.paths.length -i]
        previousPath.removeCellColour(previousPath, greenColour)  
        previousPath.green_colour = false;
      }

      this.neighbourCounter = 0;

      if(this.paths.length > 0 && this.solved == false) {
        // Out of all the paths currently known get the one with lowest fscore
        let current = this.getLowestFscore(this.paths)        
        
        // If top cell in Path equals the finish cell, then maze is solved and we have the best path
        if (current === this.finish) {
          this.solved = true;
          this.solving == false;
          this.backtracking = true;
          this.finish = current;
          return
        }

        // Fill the cell with the best F score with grey
        current.fillCellColour(current.columnNumber,current.rowNumber,this.mazeSize,this.mazeColumns,this.mazeRows, greyColour,false)
        current.grey_colour = true
         
        // Remove current cell from queue/list/array/stack
        const index = this.paths.indexOf(current);
        if (index > -1) {
          this.paths.splice(index, 1); // 2nd parameter means remove one item only
        }
  
        // Search through neighbour cells of current to see if one has a better fscore
        let neighbourCells = this.getNeighbourCells(current, this.maze);
        for(let neighbour of neighbourCells) {
          let new_gscore = current.gscore + 1
          if(new_gscore < neighbour.gscore){
            // This is a better path than another path involving the neighbour cell so basically update gscore for neightbour
            neighbour.gscore = new_gscore
            neighbour.fscore = new_gscore + this.getManhattanDistance(neighbour,this.finish);
            neighbour.previousCell = current;
            current.nextCell = neighbour;

            // If path is not aleady stored, store it
            if(!this.paths.includes(neighbour)) {
              this.neighbourCounter++;
              this.paths.push(neighbour)
              
              // Place green square to show this cell is not the head of the best path
              neighbour.fillCellColour(neighbour.columnNumber, neighbour.rowNumber,this.mazeSize, this.mazeColumns, this.mazeRows, greenColour,false)
              neighbour.green_colour = true
            }
          }
        }
      }
      // Best path has been found and now its time to highlight it
      else if(this.backtracking == true){
        // Remove grey cells in the way
        this.finish.removeCellColour(this.finish,greyColour)
        // Show final path with purple lines
        this.finish.fillCellColour(
          this.finish.columnNumber,
          this.finish.rowNumber,
          this.mazeSize,
          this.mazeColumns,
          this.mazeRows,
          purpleColour,
          true)
          
        if(this.finish === this.start) {
          // Then we have rendered best path
          this.backtracking = false;
          console.log("solved")
        } else {
          // Else backtrack to connected cell on best path
          this.finish = this.finish.previousCell
        }
      }
    }
  
    getNeighbourCells(cell, maze) {
      let row = cell.rowNumber;
      let col = cell.columnNumber;
      let neighbourCells = []
      // If top wall dosnt exist it means cell above is a neighbour
      if(cell.walls.topWall === false) {
        neighbourCells.push(maze[row-1][col])
      }
      // If bottom wall dosnt exist it means cell below is a neighbour
      if(cell.walls.bottomWall === false) {
        neighbourCells.push(maze[row+1][col])
      }
      // If left wall dosnt exist it means cell on left is a neighbour
      if(cell.walls.leftWall === false) {
        neighbourCells.push(maze[row][col-1])
      }
      // If right wall dosnt exist it means cell on right is a neighbour
      if(cell.walls.rightWall === false) {
        neighbourCells.push(maze[row][col+1])
      }
      
      // return all neighbour paths found
      if(neighbourCells.length > 0) {
        return neighbourCells
      } else {
        return undefined
      }
    }
    
    // Returns the path with the lowest F score
    getLowestFscore(paths) {
      let lowest = []
      for (let path of paths) {
        if(lowest.length === 0) {
          lowest.push(path);
        }else if(path.fscore < lowest[0].fscore) {
          lowest = []
          lowest.push(path)
        }else if(path.fscore === lowest[0].fscore) {
          lowest.push(path);
        }
      }
      // If there exists multiple paths of the same fscore randomely pick a path
      if(lowest.length > 0) {
        let random = Math.floor(Math.random() * lowest.length)
        return lowest[random];
      } else {
        return undefined
      }  
    }
  
    // Heuristic function or fscore:  the actual distance between two given cells in a straight line (could be diagonal if that makes sense)
    getManhattanDistance(currentCell,finish) {
      let currentCell1X = currentCell.columnNumber;
      let currentCell1Y = currentCell.rowNumber;
  
      let finishX = finish.columnNumber;
      let finishY = finish.rowNumber;
  
      const horizontalDistance = Math.abs(currentCell1X-finishX);
      const verticalDistance = Math.abs(currentCell1Y-finishY);
  
      return horizontalDistance + verticalDistance;
    }
  }