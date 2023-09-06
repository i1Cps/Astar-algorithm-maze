import * as THREE from "three";
import {MazeCell} from "./mazeCell"
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

    constructor(size: number, rows: number, columns: number, scene:THREE.Scene) {
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
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(this.size, this.size, 8, 8),
            new THREE.MeshBasicMaterial({
                color: Colours.whiteColour,
                side: THREE.DoubleSide,
            })
        );
        this.scene.add(plane);
    }

    // Create Maze
    createMaze() {
        if(this.current){
            if (this.mazeComplete == false) {
                    // Randomly choose neighbour as new cell
                    let next = this.current.checkNeighbours();

                    // remove green highlight from "current" cell and add it to "next" cell
                    this.current.removeCellColour(this.current, Colours.greenColour);

                    // If neighbour cell was found
                    if (next) {
                        next.setConnected(true);
                        // Put green square in cell
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
                    if(cell) {
                        this.current = cell;
                        // Put green square in cell
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
                if (this.stack.length == 0) {
                    console.log("Maze has been generated");
                    // Remove green square since maze has been generated
                    this.current.removeCellColour(this.current, Colours.greenColour);
                    this.mazeComplete = true;
                }
                return;
            } else {
                console.log("Maze already generated");
            }
        } else {
            console.log("Setup function was not executed properly")
        }
    }

    // Getters and Setters
    getSolving():boolean{
        return this.solving;
    }

    setSolving(value:boolean) {
        this.solving = value;
    }

    getMazeComplete():boolean{
        return this.mazeComplete;
    }

    getMazeGrid():MazeCell[][]{
        return this.grid;
    }
}
