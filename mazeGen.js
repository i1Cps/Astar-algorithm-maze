import "./style.css";
import * as THREE from "three";
import {MazeCell} from "./mazeCell"

// Colours
const greenColour = 0x39ff14;
const whiteColour = 0xffffff;
const yellowColour = 0xfbf10b;
const redColour = 0xff0000;
const blueColour = 0x0000ff;
const orangeColour = 0xffa500;
const purpleColour = 0x800080;
const greyColour = 0xb2beb5;

// This class generates the maze
export class MazeGen {
    constructor(size, rows, columns, scene) {
        this.size = size;
        this.rows = rows;
        this.columns = columns;
        this.grid = [];
        this.stack = [];
        this.mazeComplete = false;
        this.current = 0;
        this.scene = scene;
        this.solving = false;
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
        this.current.connected = true;

        // Draws the grid with four walls around each cell
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                let grid = this.grid;
                grid[r][c].updateWalls(this.size, this.rows, this.columns);
            }
        }

        MazeGen.width = this.size;
        MazeGen.height = this.size;

        // CREATE MAZE BACKGROUND
        var plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size, 8, 8),
            new THREE.MeshBasicMaterial({
                color: whiteColour,
                side: THREE.DoubleSide,
            })
        );
        this.scene.add(plane);
    }

    // Create Maze
    createMaze() {
        if (this.mazeComplete == false) {
            // Randomly choose neighbour as new cell
            let next = this.current.checkNeighbours();

            // remove green highlight from "current" cell and add it to "next" cell
            this.current.removeCellColour(this.current, greenColour);

            // If neighbour cell was found
            if (next) {
                next.connected = true;
                // Put green square in cell
                next.fillCellColour(
                    next.columnNumber,
                    next.rowNumber,
                    this.size,
                    this.rows,
                    this.columns,
                    greenColour,
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
                this.current = cell;
                // Put green square in cell
                cell.fillCellColour(
                    cell.columnNumber,
                    cell.rowNumber,
                    this.size,
                    this.rows,
                    this.columns,
                    greenColour,
                    false
                );
            }
            
            // If no neighbour cells are found and stack is empty the maze has been generated
            if (this.stack.length == 0) {
                console.log("Maze has been generated");
                // Remove green square since maze has been generated
                this.current.removeCellColour(this.current, greenColour);
                this.mazeComplete = true;
            }
            return;
        } else {
            console.log("Maze already generated");
        }
    }
}
