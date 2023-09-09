import * as THREE from "three";
import { MazeCell } from "./src/mazeCell";
import { Colours } from "./interfaces/colours";

// This class contains the logic for the maze itself
export class Maze {
  private size: number;
  private rows: number;
  private columns: number;
  private grid: MazeCell[][];
  private stack: MazeCell[];
  private mazeComplete: boolean;
  private current: MazeCell | null;
  private scene: THREE.Scene;
  private solving: boolean;
  private width: number;
  private height: number;
  private plane: THREE.Mesh | null;
  private mazeExist: boolean;

  constructor(size: number, rows: number, columns: number, scene: THREE.Scene) {
    this.size = size;
    this.rows = rows;
    this.columns = columns;
    this.grid = [];
    this.stack = [];
    this.mazeComplete = false;
    this.current = null;
    this.scene = scene;
    this.solving = false;
    this.width = size;
    this.height = size;
    this.plane = null;
    this.mazeExist = true;
  }

  // This creates a full grid based on size, rows and columns params
  setup() {
    // Creates cells and pushes them into grid using nested loop
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
        let cell = new MazeCell(r, c, this.grid, this.size, this.scene);
        row.push(cell);
      }
      this.grid.push(row);
    }
    // First cell in grid should be our starting point
    this.current = this.grid[0][0];
    this.current.setConnected(true);

    // Draws the grid with four walls around each cell
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].updateWalls(this.size, this.rows, this.columns);
      }
    }

    // CREATE MAZE BACKGROUND
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.size, this.size, 8, 8),
      new THREE.MeshBasicMaterial({
        color: Colours.whiteColour,
        side: THREE.DoubleSide,
      })
    );
    this.scene.add(this.plane);
  }

  // Create Maze
  createMaze() {
    if (!this.scene) {
      return;
    }
    if (this.current) {
      if (this.mazeComplete === false) {
        // Randomly choose neighbour as new cell
        let next = this.current.checkNeighbours();

        // remove active square colour highlight from "current" cell and add it to "next" cell
        this.current.removeCellColour(this.current, Colours.greenColour);

        // If neighbour cell was found
        if (next) {
          next.setConnected(true);
          // Put active coloured square in cell
          next.fillCellColour(
            next.getColumnNumber(),
            next.getRowNumber(),
            this.size,
            this.rows,
            this.columns,
            Colours.greenColour,
            false
          );
          this.stack.push(this.current);

          // Remove wall between given current cell and its neighbour cell 'next'
          this.current.removeWall(this.current, next);
          this.current = next;
        } else if (this.stack.length > 0) {
          // This part is basically backtracking if its hit a dead end
          // back tracks to the last cell in the stack that has a non connected neighbour
          let cell = this.stack.pop();
          if (cell) {
            this.current = cell;
            // Put active colour square in cell
            cell.fillCellColour(
              cell.getColumnNumber(),
              cell.getRowNumber(),
              this.size,
              this.rows,
              this.columns,
              Colours.greenColour,
              false
            );
          }
        }

        // If no neighbour cells are found and stack is empty the maze has been generated
        if (this.stack.length === 0) {
          console.log("Maze has been generated");
          // Remove active colour square since maze has been generated
          this.current.removeCellColour(this.current, Colours.greenColour);
          this.mazeComplete = true;
        }
        return;
      } else {
        console.log("Maze already generated");
      }
    } else {
      console.log("Setup function was not executed properly");
    }
  }

  // General function to remove objects from scene
  removeObject3D(object3D: THREE.Mesh | null): boolean {
    if (!(object3D instanceof THREE.Mesh)) {
      return false;
    }

    // For better memory management and performance
    if (object3D.geometry) {
      object3D.geometry.dispose();
    }

    if (object3D.material instanceof Array) {
      // For better memory management and performance
      object3D.material.forEach((material) => material.dispose());
    } else {
      // For better memory management and performance
      object3D.material.dispose();
    }
    // Default parent will be the scene so this good
    object3D.removeFromParent();
    return true;
  }

  // This function nicely cleans up all three js objects from the maze
  destroyMaze() {
    // First remove all 3D objects, then set properties to null
    if (this.mazeExist) {
      // All cells can be found in maze.grid
      for (const cellRow of this.grid) {
        for (const cell of cellRow) {
          // Handle each of the cells objects
          cell.removeAllCellObjects();
        }
      }
      this.removeObject3D(this.plane);
      this.mazeExist = false;
    }
  }

  // Getters and Setters
  isSolving(): boolean {
    return this.solving;
  }

  getMazeExist(): boolean {
    return this.mazeExist;
  }
  setSolving(value: boolean) {
    this.solving = value;
  }

  isMazeComplete(): boolean {
    return this.mazeComplete;
  }

  getMazeGrid(): MazeCell[][] {
    return this.grid;
  }
}
