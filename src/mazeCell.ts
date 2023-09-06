import * as THREE from 'three';
import {Maze} from "./maze"
import { walls, cellObjects } from './interfaces/types';
import { Colours } from './interfaces/colours';

// This class handles the logic for each cell in the maze
export class MazeCell{
    private rowNumber: number;
    private columnNumber: number;
    private parentGrid: MazeCell[][];
    private parentGridSize: number;
    private scene: THREE.Scene;
    private nextCell: MazeCell | null;
    private previousCell: MazeCell | null;
    private connected: boolean;
    private highlighted: boolean;
    private greenColour: boolean;
    private greyColour: boolean;
    private yellowColour: boolean;
    private walls: walls;
    private cellObjects: cellObjects;
    private gscore: number;
    private fscore: number;

    constructor(rowNumber: number,columnNumber: number, parentGrid: MazeCell[][], parentGridSize: number, scene: THREE.Scene) {
      this.rowNumber = rowNumber;
      this.columnNumber = columnNumber;
      this.parentGrid = parentGrid;
      this.parentGridSize = parentGridSize;
      this.scene = scene
      this.nextCell = null;
      this.previousCell = null;
      // Green square
      this.connected = false;
      // Purple square
      this.highlighted = false;
      this.greenColour = false;
      this.greyColour = false;
      this.yellowColour = false;
      this.walls = {
        topWall: true,
        leftWall: true,
        rightWall: true,
        bottomWall: true,
      };
      this.cellObjects = {
        topWall: null,
        leftWall: null,
        rightWall: null,
        bottomWall: null,
        greenSquare: null,
        greySquare: null,
        yellowSquare: null
      };
      // Since g score and f score are unknown at first, make them infinite numbers
      this.gscore = 9999999999;
      this.fscore = 9999999999;
    }
    
    // Returns a random neighbour cell that hasnt isnt already connected
    checkNeighbours(){
      let grid = this.parentGrid;
      let row = this.rowNumber;
      let col = this.columnNumber
      
      let neighbours: MazeCell[] = []
      // Get the cells neighbours
      let top = row !== 0 ? grid[row - 1][col] : undefined
      let bottom = row !== grid.length - 1 ? grid[row + 1][this.columnNumber] : undefined
      let left = col !== 0 ? grid[row][col - 1] : undefined
      let right = col !== grid[row].length - 1 ? grid[row][col + 1] : undefined
  
      // If neighbour exists and isnt connected, add it to neighbours array
      if(top && !top.connected) neighbours.push(top)
      if(bottom && !bottom.connected) neighbours.push(bottom)
      if(left && !left.connected) neighbours.push(left)
      if(right && !right.connected) neighbours.push(right)
      
      // Randomely select a non connected neighbour
      if(neighbours.length !== 0) {
        let random = Math.floor(Math.random() * neighbours.length)
        return neighbours[random];
      } else {
        return undefined
      }
    }
    
    // This function creates a wall on the top side of the cell
    drawTopWall(x: number,y: number, parentGridSize: number, columns: number,rows: number) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(parentGridSize/ columns,1,1),
        new THREE.MeshLambertMaterial({color: Colours.blueColour})
      );
      this.scene.add(wall)
      
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.topWall = wall;
      
      // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
      const initialX = -parentGridSize/2
      const initialY = parentGridSize/2 
  
      // Take the length of wall, half it then move it right so it dosnt hang off the canvas
      const wallAdjustment = parentGridSize/(2 * columns)
      
      // Initalize wall at top left
      wall.position.set(initialX + wallAdjustment,initialY,5)
  
      // Move wall to correct place based on x and y value
      wall.position.x += (x*parentGridSize/columns);
      wall.position.y -= (y*parentGridSize/rows);
    }
    
    // This function creates a wall on the left side of the cell
    drawLeftWall(x: number,y: number, parentGridSize: number, columns: number,rows: number) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(1,parentGridSize/rows,1),
        new THREE.MeshLambertMaterial({color: Colours.blueColour})
      );
      this.scene.add(wall)
  
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.leftWall = wall;
  
      // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
      const initialX = -parentGridSize/2
      const initialY = parentGridSize/2
  
      // Take the length of wall, half it then move it down so it dont hang off the canvas
      const wallAdjustment = parentGridSize/(2 * rows)
  
      // Initalize wall at the top left
      wall.position.set(initialX, initialY - wallAdjustment,5)
  
      // Move wall to corrent place based on given x and y values
      wall.position.x += (x*parentGridSize/columns);
      wall.position.y -= (y*parentGridSize/rows);
    }
    
    // This function creates a wall on the right side of the cell
    drawRightWall(x: number,y: number, parentGridSize: number, columns: number,rows: number) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(1,this.parentGridSize/ rows,1),
        new THREE.MeshLambertMaterial({color: Colours.blueColour})
      );
      this.scene.add(wall)
  
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.rightWall = wall;
  
      // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
      const initialX = -parentGridSize/2
      const initialY = parentGridSize/2
  
      // Take the length of wall, half it then move it down so it dont hang off the canvas
      const wallAdjustment = parentGridSize/(2 * rows)
  
      // Initalize wall at the top left 
      wall.position.set(initialX, initialY - wallAdjustment, 5)
  
      // Move wall to corrent place based on given x and y values. Add again to make sure wall is on the right side of the cell 
      wall.position.x += (x*parentGridSize/columns) + parentGridSize/columns;
      wall.position.y -= (y*parentGridSize/rows);
    }
    
    // This function creates a wall on the bottom side of the cell
    drawBottomWall(x: number,y: number, parentGridSize: number, columns: number,rows: number) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(this.parentGridSize/columns,1,1),
        new THREE.MeshLambertMaterial({color: Colours.blueColour})
      );
      this.scene.add(wall)
  
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.bottomWall = wall;
  
      // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
      const initialX = -parentGridSize/2
      const initialY = parentGridSize/2
  
      // Take the length of wall, half it then move it right so it dont hang off the canvas
      const wallAdjustment = parentGridSize/(2 * columns)
  
      // Initalize wall at the top left
      wall.position.set(initialX + wallAdjustment, initialY, 5)
  
      // Move wall to corrent place based on given x and y values minus again to make sure wall is on the bottom side of the cell +-
      wall.position.x += (x*parentGridSize/columns);
      wall.position.y -= (y*parentGridSize/rows) + parentGridSize/rows;
    }

    // When maze outputs the final path, we need to handle the direction of the lines
    fillBackTrackLine(lineType: number, x: number,y: number, parentGridSize: number, columns: number,rows: number, colour: number) {
      // 1 = vertical line
      // 2 = horizontal line
      // 3 = (bottom to right/right to bottom)
      // 4 = (bottom to left/left to bottom)
      // 5 = (top to right/right to top)
      // 6 = (top to left/left to top)
      
      // Visual properties of the Red line
      const depth = 1;
      const zpos = 5; 
      // Vertical Line
      if(lineType == 1) {
        const verticalLine = new THREE.Mesh(
        new THREE.BoxGeometry(this.parentGridSize/columns *0.2,this.parentGridSize/rows * 1,depth),
        new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(verticalLine);
        // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust line by taking the half the width and height so its centered about the cell
        const lineAdjustmentX = parentGridSize/(2*columns)
        const lineAdjustmentY = parentGridSize/(2*rows)
        // Initalize line at the top left
        verticalLine.position.set(initialX + lineAdjustmentX, initialY - lineAdjustmentY,zpos)
        // Move line to correct place based on given x and y values
        verticalLine.position.x += (x*parentGridSize/columns);
        verticalLine.position.y -= (y*parentGridSize/rows);
      }
      // Horizontal Line
      else if (lineType == 2) {
        const horizontalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *1,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(horizontalLine);
        // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust line by taking the half the width and height so its centered about the cell
        const lineAdjustmentX = parentGridSize/(2*columns)
        const lineAdjustmentY = parentGridSize/(2*rows)
        // Initalize line at the top left
        horizontalLine.position.set(initialX + lineAdjustmentX, initialY - lineAdjustmentY,zpos)
        // Move line to correct place based on given x and y values
        horizontalLine.position.x += (x*parentGridSize/columns);
        horizontalLine.position.y -= (y*parentGridSize/rows);
      } 
      // Corner: bottom to right/right to bottom
      else if (lineType == 3) {
        // Horizontal line
        const horizontalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const verticalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(horizontalLine, verticalLine);
        // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust horizontal line by centering along y-axis but moving it to right half of x-axis
        // Adjust vertical line by centering along x-axis but moving it to lower half of y-axis
        const horizontalLineAdjustmentX = 3*(parentGridSize/(4*columns));
        const horizontalLineAdjustmentY = parentGridSize/(2*rows);
        const verticalLineAdjustmentX = parentGridSize/(2*columns);
        const verticalLineAdjustmentY = 3*(parentGridSize/(4*rows));
        // Initalize lines at the top left
        horizontalLine.position.set(initialX + horizontalLineAdjustmentX, initialY - horizontalLineAdjustmentY,zpos)
        verticalLine.position.set(initialX + verticalLineAdjustmentX, initialY - verticalLineAdjustmentY,zpos)
        // Move lines to correct place based on given x and y values
        horizontalLine.position.x += (x*parentGridSize/columns);
        horizontalLine.position.y -= (y*parentGridSize/rows);
        verticalLine.position.x += (x*parentGridSize/columns);
        verticalLine.position.y -= (y*parentGridSize/rows);
      }
      // Corner: bottom to left/left to bottom
      else if(lineType == 4) {
        // Horizontal line
        const horizontalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const verticalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(horizontalLine, verticalLine);
        // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust horizontal line by centering along y-axis but moving it to left half of x-axis
        // Adjust vertical line by centering along x-axis but moving it to lower half of y-axis
        const horizontalLineAdjustmentX = parentGridSize/(4*columns);
        const horizontalLineAdjustmentY = parentGridSize/(2*rows);
        const verticalLineAdjustmentX = parentGridSize/(2*columns);
        const verticalLineAdjustmentY = 3*(parentGridSize/(4*rows));
        // Initalize lines at the top left
        horizontalLine.position.set(initialX + horizontalLineAdjustmentX, initialY - horizontalLineAdjustmentY,zpos)
        verticalLine.position.set(initialX + verticalLineAdjustmentX, initialY - verticalLineAdjustmentY,zpos)
        // Move square to correct place based on given x and y values
        horizontalLine.position.x += (x*parentGridSize/columns);
        horizontalLine.position.y -= (y*parentGridSize/rows);
        verticalLine.position.x += (x*parentGridSize/columns);
        verticalLine.position.y -= (y*parentGridSize/rows);
      }
      // Corner: top to right/right to top
      else if(lineType == 5) {
        // Horizontal line
        const horizontalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const verticalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(horizontalLine, verticalLine);
        // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust horizontal line by centering along y-axis but moving it to right half of x-axis
        // Adjust vertical line by centering along x-axis but moving it to upper half of y-axis
        const horizontalLineAdjustmentX = 3*(parentGridSize/(4*columns));
        const horizontalLineAdjustmentY = parentGridSize/(2*rows);
        const verticalLineAdjustmentX = parentGridSize/(2*columns);
        const verticalLineAdjustmentY = parentGridSize/(4*rows);

        // Initalize lines at the top left
        horizontalLine.position.set(initialX + horizontalLineAdjustmentX, initialY - horizontalLineAdjustmentY,zpos)
        verticalLine.position.set(initialX + verticalLineAdjustmentX, initialY - verticalLineAdjustmentY,zpos)
        // Move lines to correct place based on given x and y values
        horizontalLine.position.x += (x*parentGridSize/columns);
        horizontalLine.position.y -= (y*parentGridSize/rows);
        verticalLine.position.x += (x*parentGridSize/columns);
        verticalLine.position.y -= (y*parentGridSize/rows);
      }
      // Corner: top to left/left to top
      else if(lineType == 6) {
        // Horizontal line
        const horizontalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const verticalLine = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columns *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(horizontalLine, verticalLine);
        // Trust the math: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust horizontal line by centering along y-axis but moving it to left half of x-axis
        // Adjust vertical line by centering along x-axis but moving it to upper half of y-axis
        const horizontalLineAdjustmentX = (parentGridSize/(4*columns));
        const horizontalLineAdjustmentY = parentGridSize/(2*rows);
        const verticalLineAdjustmentX = parentGridSize/(2*columns);
        const verticalLineAdjustmentY = parentGridSize/(4*rows);

        // Initalize lines at the top left
        horizontalLine.position.set(initialX + horizontalLineAdjustmentX, initialY - horizontalLineAdjustmentY,zpos)
        verticalLine.position.set(initialX + verticalLineAdjustmentX, initialY - verticalLineAdjustmentY,zpos)
        // Move lines to correct place based on given x and y values
        horizontalLine.position.x += (x*parentGridSize/columns);
        horizontalLine.position.y -= (y*parentGridSize/rows);
        verticalLine.position.x += (x*parentGridSize/columns);
        verticalLine.position.y -= (y*parentGridSize/rows);
      }
    }
    
    // Function
    fillCellColour(x: number, y: number, parentGridSize: number, columms: number ,rows: number, colour: number, backtrack: boolean) {
      // If its backtracking !!!!! Complicated for no reason just because i want corner pieces
      if(backtrack) {
        // This means this is the start cell (perspective is now from the end of the maze)
        if(this.previousCell == null) {
          // If next cell was to the right put horizontal line
          if(this.nextCell?.rowNumber == y) {
            this.fillBackTrackLine(2,x,y,parentGridSize,columms,rows,colour);
            return
          }
          else {
            // If next cell was below put vertical line
            this.fillBackTrackLine(1,x,y,parentGridSize,columms,rows,colour);
            return
          }
        }
        // Stop cell from getting attatched to an explored node thats not part of the optimal path
        if(this.nextCell !== null && this.previousCell.nextCell != this) {
          this.previousCell.nextCell = this
        }

        // If next cell is equal to null this means this is the FINISH cell so just do a straight line
        if(this.nextCell == null) {
          if(x == this.previousCell.columnNumber) {
            // Create a vertical line
            this.fillBackTrackLine(1,x,y,parentGridSize,columms,rows,colour);
          } else {
            // Create horizontal line
            this.fillBackTrackLine(2,x,y,parentGridSize,columms,rows,colour);
          }
        }

        // Below are conditions to figure out the combination of lines to create a backtracking piece

        // Check if connected cell is adjacent horizontally or vertically (above/below or left/right)
        else if(x == this.previousCell.columnNumber) {
          // Check if it needs to be a corner peices
          if(x == this.nextCell.columnNumber) {
            // No corner piece needed, keep it vertically straight
            this.fillBackTrackLine(1,x,y,parentGridSize,columms,rows,colour);
          }
          else{
            if(this.nextCell == null) {
              // If equal to null means this is the finish cell so just do a straight line
              this.fillBackTrackLine(1,x,y,parentGridSize,columms,rows,colour);
            }
            else if(this.nextCell != null && x < this.nextCell.columnNumber) {
              // Path is going (right to top/top to right) or (right to bottom/bottom to right)
              if( y < this.previousCell.rowNumber) {
                // (right to bottom/bottom to right)
                this.fillBackTrackLine(3,x,y,parentGridSize,columms,rows,colour);
              }
              else {
                // (right to top/top to right)
                this.fillBackTrackLine(5,x,y,parentGridSize,columms,rows,colour);
              }
            }
            else{
              // Path is going (left to up/up to left) or (left to down/down to left)
              if(y > this.previousCell.rowNumber) {
                // (left to top/top to left)
                this.fillBackTrackLine(6,x,y,parentGridSize,columms,rows,colour);
              }
              else {
                // (left to bottom/bottom to left)
                this.fillBackTrackLine(4,x,y,parentGridSize,columms,rows,colour);
              }
            }
          }
        }
        else if(y == this.previousCell.rowNumber) {
          // Check if it needs to be a corner peices
          if(this.nextCell != null && y == this.nextCell.rowNumber) {
            // No corner piece needed, keep it hoizontally straight
            this.fillBackTrackLine(2,x,y,parentGridSize,columms,rows,colour);
          }
          else if(this.nextCell != null && y < this.nextCell.rowNumber) {
            // Path is going (bottom to right/right to bottom) or (bottom to left/left to bottom)
            if( x < this.previousCell.columnNumber) {
              // (bottom to right/right to bottom)
              this.fillBackTrackLine(3,x,y,parentGridSize,columms,rows,colour);
            }
            else {
              // (bottom to left/left to bottom)
              this.fillBackTrackLine(4,x,y,parentGridSize,columms,rows,colour);
            }
          }
          else{
            // Path is going (top to left/left to top) or (top to right/right to top)
            if(x < this.previousCell.columnNumber) {
              // (top to right/right to top)
              this.fillBackTrackLine(5,x,y,parentGridSize,columms,rows,colour);
            }
            else {
              // (top to left/left to top)
              this.fillBackTrackLine(6,x,y,parentGridSize,columms,rows,colour);
            }
          }
        } 
      }
      else {
        // Create coloured square
        const square = new THREE.Mesh(
          new THREE.BoxGeometry(this.parentGridSize/columms + 0.7,this.parentGridSize/rows + 0.7,1),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(square)
    
        // Store square object so it can be deleted/removed from scene later
        if(colour == Colours.greenColour) {
          this.cellObjects.greenSquare = square;
        } else if(colour == Colours.greyColour) {
          this.cellObjects.greySquare = square;
        }
    
        // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
    
        // Adjust square by taking the half the width and height so its centered about the cell
        const squareAdjustmentX = parentGridSize/(2*columms)
        const squareAdjustmentY = parentGridSize/(2*rows)
    
        // Initalize square at the top left
        square.position.set(initialX + squareAdjustmentX, initialY - squareAdjustmentY,3)

        // Move square to correct place based on given x and y values
        square.position.x += (x*parentGridSize/columms);
        square.position.y -= (y*parentGridSize/rows);
      }
    }
    
    // Function removes walls, is used when generating the maze
    removeWall(cell1: MazeCell, cell2: MazeCell) {
      // Use this to get order of cells, (which one is on the left/right or which one is on above/below)
      let x = (cell1.columnNumber - cell2.columnNumber)
      let y = (cell1.rowNumber - cell2.rowNumber)
      
      // Cell 1 is right of cell 1
      if( x == 1) {
        // Remove cell 1's left wall and cell 2's right wall
        cell1.walls.leftWall = false;
        cell2.walls.rightWall = false;
  
        // Remove respective wall object 
        let obj = cell1.cellObjects.leftWall;
        this.removeObject3D(obj)
        obj = cell2.cellObjects.rightWall;
        this.removeObject3D(obj)
      }
      // Cell 1 is left of cell 2
      else if(x == -1) {
        // Remove cell 2's left wall and cell 1's right wall
        cell1.walls.rightWall = false;
        cell2.walls.leftWall = false;
  
        // Remove respective wall object 
        let obj = cell1.cellObjects.rightWall
        this.removeObject3D(obj)
        obj = cell2.cellObjects.leftWall
        this.removeObject3D(obj)
      }
      // Cell 1 is above cell 2
      if(y == 1) {
        // Remove cell 1's bottom wall and cell 2's top wall
        cell1.walls.topWall = false;
        cell2.walls.bottomWall = false;
  
        // Remove respective wall object 
        let obj = cell1.cellObjects.topWall
        this.removeObject3D(obj)
        obj = cell2.cellObjects.bottomWall
        this.removeObject3D(obj)
      }
      // Cell 1 is below cell 2
      else if(y == -1) {
        // Remove cell 1's top wall and ecll 2's bottom wall
        cell1.walls.bottomWall = false;
        cell2.walls.topWall = false;
  
        // Remove respective wall object 
        let obj = cell1.cellObjects.bottomWall
        this.removeObject3D(obj);
        obj = cell2.cellObjects.topWall
        this.removeObject3D(obj)
      }
    }
  
    // Probably should extend functionality of this function, but its just not needed
    removeCellColour(cell: MazeCell,colour: number) {
      if (colour === Colours.greenColour) {
         let obj = cell.cellObjects.greenSquare;
         this.removeObject3D(obj);
      }else if (colour === Colours.greyColour) {
        cell.highlighted = false;
        cell.greyColour = false;
        let obj = cell.cellObjects.greySquare;
        this.removeObject3D(obj);
      }
    }
  
    // Checks to see if cell needs walls updated, used when generating maze
    updateWalls(size: number,rows: number,columns: number) {
      if (this.walls.topWall)
        this.drawTopWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.walls.bottomWall)
        this.drawBottomWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.walls.leftWall)
        this.drawLeftWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.walls.rightWall)
        this.drawRightWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.connected)
        this.fillCellColour(this.columnNumber,this.rowNumber, size, columns,rows, Colours.greenColour,false)
      if (this.highlighted)
        this.fillCellColour(this.columnNumber,this.rowNumber, size, columns, rows, Colours.greyColour,false)
    }

    // General function to remove objects from scene 
    removeObject3D(object3D: THREE.Mesh | null): boolean {
        if (!(object3D instanceof THREE.Mesh)) {
          return false;
        }

        // For better memory management and performance
        if(object3D.geometry) {
          object3D.geometry.dispose();
        }
        
        if (object3D.material instanceof Array) {
            // For better memory management and performance
            object3D.material.forEach(material => material.dispose());
        } else {
            // For better memory management and performance
            object3D.material.dispose();
        }
        // Default parent will be the scene so this good
        object3D.removeFromParent(); 
        return true;
    }

    // Getters and Setters -------------------------------------------------------------------------------------------
    setConnected(value:boolean) {
      this.connected = value;
    }

    getColumnNumber():number {
      return this.columnNumber;
    }

    getRowNumber():number {
      return this.rowNumber
    }

    setGScore(value:number){
      this.gscore = value;
    }

    setFScore(value:number){
      this.fscore = value;
    }

    getGScore():number{
      return this.gscore;
    }

    getFScore():number{
      return this.fscore;
    }

    setNextCell(value:MazeCell){
      this.nextCell = value;
    }

    getNextCell():MazeCell | null{
      return this.nextCell;
    }

    setPreviousCell(value: MazeCell){
      this.previousCell = value;
    }

    getPreviousCell():MazeCell | null{
      
      return this.previousCell;
    }

    setGreenColour(value:boolean){
      this.greenColour = value;
    }

    setGreyColour(value:boolean){
      this.greyColour = value;
    }

    setWalls(wall: number, value: boolean) {
      // 1: Top wall
      // 2: Right wall
      // 3: Bottom wall
      // 4: Left wall
      if(wall == 1) {
        this.walls.topWall = value;
      } else if(wall == 2) {
        this.walls.rightWall = value;
      } else if(wall == 3) {
        this.walls.bottomWall = value;
      } else if(wall == 4) {
        this.walls.leftWall = value;
      } else {
        console.log("wall param is invalid")
      }
    }

    getWalls(wall: number): boolean | null{
      // 1: Top wall
      // 2: Right wall
      // 3: Bottom wall
      // 4: Left wall
      if(wall == 1) {
        return this.walls.topWall;
      } else if(wall == 2) {
        return this.walls.rightWall;
      } else if(wall == 3) {
        return this.walls.bottomWall;
      } else if(wall == 4) {
        return this.walls.leftWall;
      } else {
        console.log("wall param is invalid")
        return null;
      }
    }
  }