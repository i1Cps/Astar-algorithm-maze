import './style.css'
import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { AxesHelper } from 'three';

// Colours
const greenColour = 0x39FF14;
const whiteColour = 0xffffff;
const yellowColour = 0xfbf10b;
const redColour = 0xff0000;
const blueColour = 0x0000ff;
const orangeColour = 0xffa500;
const purpleColour = 0x800080;
const greyColour = 0xB2BEB5;

export const mazeGen = (function() {
  class Maze{
    constructor(size,rows,columns,scene) {
      this.size = size;
      this.rows = rows;
      this.columns = columns;
      this.grid =  [];
      this.stack = [];
      this.mazeComplete = false;
      this.current = 0;
      this.scene = scene;
      this.solving = false;
    }
  
    setup() {
      // create cells and push them into grid using nested loop
      for(let r = 0; r < this.rows; r++) {
        let row = [];
        for(let c = 0; c < this.columns; c++) {
          let cell = new Cell(r,c,this.grid,this.size,this.scene)
          row.push(cell)
        }
        this.grid.push(row)
      }
      // First cell in grid is where we start akh
      this.current = this.grid[0][0]
      this.current.visited = true;

      // Draw grid with all the walls in place
      for(let r = 0; r < this.rows;r++) {
        for( let c = 0; c < this.columns; c++) {
          let grid = this.grid;
          grid[r][c].updateWalls(this.size,this.rows,this.columns)
        }
      } 
      
      Maze.width = this.size;
      Maze.height = this.size;

      // CREATE MAZE BACKGROUND
      var plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(this.size, this.size, 8,8 ),
        new THREE.MeshBasicMaterial({ color: whiteColour, side: THREE.DoubleSide })
      );
      this.scene.add(plane);
    }
  
    // draw grid
    draw() {
      if(this.mazeComplete == false) {
        // randomly choose neighbour as new cell
        let next = this.current.checkNeighbours();
    
        // remove green highlight from "current" cell and add it to "next" cell
        // "current" is a cell akh so....
        this.current.removeCellColour(this.current, greenColour);
    
        if(next) {
          next.visited = true;
          // Put green square in cell
          next.fillCellColour(next.columnNumber,next.rowNumber,this.size,this.rows,this.columns, greenColour,false)
          this.stack.push(this.current);
          // Remove wall between given cells
          this.current.removeWall(this.current, next);
          this.current = next
        } else if(this.stack.length > 0) {
          // This part is basically backtracking if its hit a dead end my g
          // back tracks to the last cell that had a neighbour that hasnt been visited (check "checkNeighbour" function)
          let cell = this.stack.pop();
          this.current = cell;
          // Put green square in cell
          cell.fillCellColour(cell.columnNumber,cell.rowNumber,this.size,this.rows,this.columns, greenColour,false)
        }
    
        if(this.stack.length == 0) {
          console.log("Maze has been generated")
          // Remove green square since maze has been generated
          this.current.removeCellColour(this.current, greenColour);
          this.mazeComplete = true;
        }
        return 
      }
      else {
        console.log("Maze already generated")
      }
    }
  }
  
  class Cell{
    constructor(rowNumber,columnNumber, parentGrid, parentGridSize, scene) {
      this.rowNumber = rowNumber;
      this.columnNumber = columnNumber;
      this.parentGrid = parentGrid;
      this.parentGridSize = parentGridSize;
      this.scene = scene
      this.nextCell = null;
      this.previousCell = null;
      // green square
      this.visited = false;
      // purple square
      this.highlighted = false;
      this.green_colour = false;
      this.grey_colour = false;
      this.yellow_colour = false;
      this.walls = {
        topWall: true,
        leftWall: true,
        rightWall: true,
        bottomWall: true,
      };
      this.cellObjects = {
        topWall: 1,
        leftWall: 2,
        rightWall: 3,
        bottomWall: 4,
        greenSquare: 5,
        greySquare: 6,
        yellowSquare: 7
      };
      // Since g score and f score are unknown at first, make them infinite numbers
      this.gscore = 9999999999;
      this.fscore = 9999999999;
    }
  
    checkNeighbours(){
      let grid = this.parentGrid;
      let row = this.rowNumber;
      let col = this.columnNumber
      
      let neighbours = []
      // Get cells neighbours
      let top = row !== 0 ? grid[row - 1][col] : undefined
      let bottom = row !== grid.length - 1 ? grid[row + 1][this.columnNumber] : undefined
      let left = col !== 0 ? grid[row][col - 1] : undefined
      let right = col !== grid[row].length - 1 ? grid[row][col + 1] : undefined
  
      // If neighbours exists and hasnt been visited, add it to neighbours array
      if(top && !top.visited) neighbours.push(top)
      if(bottom && !bottom.visited) neighbours.push(bottom)
      if(left && !left.visited) neighbours.push(left)
      if(right && !right.visited) neighbours.push(right)
      
      // Randomely select a neighbour that hasnt been generated
      if(neighbours.length !== 0) {
        let random = Math.floor(Math.random() * neighbours.length)
        return neighbours[random];
      } else {
        return undefined
      }
    }
  
    drawTopWall(x,y,parentGridSize, columns,rows) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxBufferGeometry(parentGridSize/ columns,1,1),
        new THREE.MeshLambertMaterial({color: blueColour})
      );
      this.scene.add(wall)
      
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.topWall = wall;
      
      // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
      const initialX = -parentGridSize/2
      const initialY = parentGridSize/2 
  
      // Take the length of wall, half it then move it right so it dosnt hang off the canvas
      const wallAdjustment = parentGridSize/(2 * columns)
      
      // initalize wall at top left
      wall.position.set(initialX + wallAdjustment,initialY,5)
  
      // Move wall to correct place based on x and y value
      wall.position.x += (x*parentGridSize/columns);
      wall.position.y -= (y*parentGridSize/rows);
    }
  
    drawLeftWall(x,y,parentGridSize, columns,rows) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1,parentGridSize/rows,1),
        new THREE.MeshLambertMaterial({color: blueColour})
      );
      this.scene.add(wall)
  
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.leftWall = wall;
  
      // Trust the math g: // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
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
  
    drawRightWall(x,y, parentGridSize,columns,rows) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1,this.parentGridSize/ rows,1),
        new THREE.MeshLambertMaterial({color: blueColour})
      );
      this.scene.add(wall)
  
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.rightWall = wall;
  
      // Trust the math g: Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
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
  
    drawBottomWall(x,y, parentGridSize, columns,rows) {
      // Create wall object
      const wall = new THREE.Mesh(
        new THREE.BoxBufferGeometry(this.parentGridSize/columns,1,1),
        new THREE.MeshLambertMaterial({color: blueColour})
      );
      this.scene.add(wall)
  
      // Store wall object so it can be deleted/removed from scene later
      this.cellObjects.bottomWall = wall;
  
      // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
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

    fillBackTrackLine(number,x,y,parentGridSize,columms,rows,colour) {
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
      if(number == 1) {
        const line = new THREE.Mesh(
        new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.2,this.parentGridSize/rows * 1,depth),
        new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(line);
          // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
          const initialX = -parentGridSize/2
          const initialY = parentGridSize/2
          // Adjust line by taking the half the width and height so its centered about the cell
          const lineAdjustmentX = parentGridSize/(2*columms)
          const lineAdjustmentY = parentGridSize/(2*rows)
          // Initalize line at the top left
          line.position.set(initialX + lineAdjustmentX, initialY - lineAdjustmentY,zpos)
          // Move line to correct place based on given x and y values
        line.position.x += (x*parentGridSize/columms);
        line.position.y -= (y*parentGridSize/rows);
      }
      // Horizontal Line
      else if (number == 2) {
        const line = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *1,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(line);
        // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust line by taking the half the width and height so its centered about the cell
        const lineAdjustmentX = parentGridSize/(2*columms)
        const lineAdjustmentY = parentGridSize/(2*rows)
        // Initalize line at the top left
        line.position.set(initialX + lineAdjustmentX, initialY - lineAdjustmentY,zpos)
        // Move line to correct place based on given x and y values
        line.position.x += (x*parentGridSize/columms);
        line.position.y -= (y*parentGridSize/rows);
      } 
      // Corner: bottom to right/right to bottom
      else if (number == 3) {
        // Horizontal line
        const line1 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const line2 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(line1, line2);
        // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust line1 by centering along y-axis but moving it to right half of x-axis
        // Adjust line2 by centering along x-axis but moving it to lower half of y-axis
        const line1AdjustmentX = 3*(parentGridSize/(4*columms));
        const line1AdjustmentY = parentGridSize/(2*rows);
        const line2AdjustmentX = parentGridSize/(2*columms);
        const line2AdjustmentY = 3*(parentGridSize/(4*rows));
        // Initalize lines at the top left
        line1.position.set(initialX + line1AdjustmentX, initialY - line1AdjustmentY,zpos)
        line2.position.set(initialX + line2AdjustmentX, initialY - line2AdjustmentY,zpos)
        // Move lines to correct place based on given x and y values
        line1.position.x += (x*parentGridSize/columms);
        line1.position.y -= (y*parentGridSize/rows);
        line2.position.x += (x*parentGridSize/columms);
        line2.position.y -= (y*parentGridSize/rows);
      }
      // Corner: bottom to left/left to bottom
      else if(number == 4) {
        // Horizontal line
        const line1 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const line2 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(line1, line2);
        // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust line1 by centering along y-axis but moving it to left half of x-axis
        // Adjust line2 by centering along x-axis but moving it to lower half of y-axis
        const line1AdjustmentX = parentGridSize/(4*columms);
        const line1AdjustmentY = parentGridSize/(2*rows);
        const line2AdjustmentX = parentGridSize/(2*columms);
        const line2AdjustmentY = 3*(parentGridSize/(4*rows));
        // Initalize lines at the top left
        line1.position.set(initialX + line1AdjustmentX, initialY - line1AdjustmentY,zpos)
        line2.position.set(initialX + line2AdjustmentX, initialY - line2AdjustmentY,zpos)
        // Move square to correct place based on given x and y values
        line1.position.x += (x*parentGridSize/columms);
        line1.position.y -= (y*parentGridSize/rows);
        line2.position.x += (x*parentGridSize/columms);
        line2.position.y -= (y*parentGridSize/rows);
      }
      // Corner: top to right/right to top
      else if(number == 5) {
        // Horizontal line
        const line1 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const line2 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(line1, line2);
        // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust line1 by centering along y-axis but moving it to right half of x-axis
        // Adjust line2 by centering along x-axis but moving it to upper half of y-axis
        const line1AdjustmentX = 3*(parentGridSize/(4*columms));
        const line1AdjustmentY = parentGridSize/(2*rows);
        const line2AdjustmentX = parentGridSize/(2*columms);
        const line2AdjustmentY = parentGridSize/(4*rows);

        // Initalize lines at the top left
        line1.position.set(initialX + line1AdjustmentX, initialY - line1AdjustmentY,zpos)
        line2.position.set(initialX + line2AdjustmentX, initialY - line2AdjustmentY,zpos)
        // Move lines to correct place based on given x and y values
        line1.position.x += (x*parentGridSize/columms);
        line1.position.y -= (y*parentGridSize/rows);
        line2.position.x += (x*parentGridSize/columms);
        line2.position.y -= (y*parentGridSize/rows);

      }
      // Corner: top to left/left to top
      else if(number == 6) {
        // Horizontal line
        const line1 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.5,this.parentGridSize/rows * 0.2,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        // Vertical line
        const line2 = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms *0.2,this.parentGridSize/rows * 0.5,depth),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(line1, line2);
        // Trust the math g: take the size of grid and amount of rows and columns and calculate inital position
        const initialX = -parentGridSize/2
        const initialY = parentGridSize/2
        // Adjust line1 by centering along y-axis but moving it to left half of x-axis
        // Adjust line2 by centering along x-axis but moving it to upper half of y-axis
        const line1AdjustmentX = (parentGridSize/(4*columms));
        const line1AdjustmentY = parentGridSize/(2*rows);
        const line2AdjustmentX = parentGridSize/(2*columms);
        const line2AdjustmentY = parentGridSize/(4*rows);

        // Initalize lines at the top left
        line1.position.set(initialX + line1AdjustmentX, initialY - line1AdjustmentY,zpos)
        line2.position.set(initialX + line2AdjustmentX, initialY - line2AdjustmentY,zpos)
        // Move lines to correct place based on given x and y values
        line1.position.x += (x*parentGridSize/columms);
        line1.position.y -= (y*parentGridSize/rows);
        line2.position.x += (x*parentGridSize/columms);
        line2.position.y -= (y*parentGridSize/rows);
      }
    }
  
    fillCellColour(x,y, parentGridSize, columms ,rows, colour, backtrack) {
      // If its backtracking !!!!!!!!!!! Complicated for no reason just because i want corner pieces aHKKKK
      if(backtrack) {
        if(this.previousCell == null) {
          // This means this is the start cell
          if(this.nextCell.rowNumber == y) {
            // If next cell was to the right put vertical line
            this.fillBackTrackLine(2,x,y,parentGridSize,columms,rows,colour);
            return
          }
          else {
            // If next cell was below put horizontal line
            this.fillBackTrackLine(1,x,y,parentGridSize,columms,rows,colour);
            return
          }
        }
        // brooo just trust a man, stop cell from getting attatched to a explored node thats not the optimal path
        if(this.nextCell !== null && this.previousCell.nextCell != this) {
          this.previousCell.nextCell = this
        }
        if(this.nextCell == null) {
          // finish cell, check if previous is above or to the left of it
          if(x == this.previousCell.columnNumber) {
            //means its above it, so just put vertical line
            // If equal to null means this is the finish cell so just do a straight line
            this.fillBackTrackLine(1,x,y,parentGridSize,columms,rows,colour);
          } else {
            // put horizontal line
            // If equal to null means this is the finish cell so just do a straight line
            this.fillBackTrackLine(2,x,y,parentGridSize,columms,rows,colour);
          }
        }
        else if(x == this.previousCell.columnNumber) {
          // check if connected cell is adjacent horizontally or vertically (above/below or left/right)
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
              // path is going (right to top/top to right) or (right to bottom/bottom to right)
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
              // path is going (left to up/up to left) or (left to down/down to left)
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
            // path is going (bottom to right/right to bottom) or (bottom to left/left to bottom)
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
            // path is going (top to left/left to top) or (top to right/right to top)
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
        // create coloured square
        const square = new THREE.Mesh(
          new THREE.BoxBufferGeometry(this.parentGridSize/columms + 0.7,this.parentGridSize/rows + 0.7,1),
          new THREE.MeshLambertMaterial({color: colour})
        );
        this.scene.add(square)
    
        // Store square object so it can be deleted/removed from scene later
        if(colour == greenColour) {
          this.cellObjects.greenSquare = square;
        } else if(colour == greyColour) {
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
  
    removeWall(cell1, cell2) {
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
        removeObject3D(obj)
        obj = cell2.cellObjects.rightWall;
        removeObject3D(obj)
      }
      // Cell 1 is left of cell 2
      else if(x == -1) {
        // Remove cell 2's left wall and cell 1's right wall
        cell1.walls.rightWall = false;
        cell2.walls.leftWall = false;
  
        // Remove respective wall object 
        let obj = cell1.cellObjects.rightWall
        removeObject3D(obj)
        obj = cell2.cellObjects.leftWall
        removeObject3D(obj)
      }
      // Cell 1 is above cell 2
      if(y == 1) {
        // Remove cell 1's bottom wall and cell 2's top wall
        cell1.walls.topWall = false;
        cell2.walls.bottomWall = false;
  
        // Remove respective wall object 
        let obj = cell1.cellObjects.topWall
        removeObject3D(obj)
        obj = cell2.cellObjects.bottomWall
        removeObject3D(obj)
      }
      // Cell 1 is below cell 2
      else if(y == -1) {
        // Remove cell 1's top wall and ecll 2's bottom wall
        cell1.walls.bottomWall = false;
        cell2.walls.topWall = false;
  
        // Remove respective wall object 
        let obj = cell1.cellObjects.bottomWall
        removeObject3D(obj);
        obj = cell2.cellObjects.topWall
        removeObject3D(obj)
      }
    }
  
    // Probably should extend functionality of this function, but its just not needed
    removeCellColour(cell,colour) {
      if (colour === greenColour) {
         let obj = cell.cellObjects.greenSquare;
         removeObject3D(obj);
      }else if (colour === greyColour) {
        cell.highlighted = false;
        cell.grey = false;
        let obj = cell.cellObjects.greySquare;
        removeObject3D(obj);
      }
    }
  
    // checks to see if cell needs walls updated
    updateWalls(size,rows,columns) {
      if (this.walls.topWall)
        this.drawTopWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.walls.bottomWall)
        this.drawBottomWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.walls.leftWall)
        this.drawLeftWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.walls.rightWall)
        this.drawRightWall(this.columnNumber,this.rowNumber, size, columns, rows) 
      if (this.visited)
        this.fillCellColour(this.columnNumber,this.rowNumber, size, columns,rows, greenColour,false)
      if (this.highlighted)
        this.fillCellColour(this.columnNumber,this.rowNumber, size, columns, rows, greyColour,false)
    }
  }

  class MazeSolver{
    constructor(start,finish,parentGrid,parentGridSizes) {
      this.start = start;      
      this.finish = finish;
      this.parentGrid = parentGrid;
      this.distanceTravelled = 0;
      this.paths = [];
      this.chosenPaths = [];
      this.solved = false;
      this.backtracking = false;
      this.parentGridSize = parentGridSizes[0];
      this.parentGridRows = parentGridSizes[1];
      this.parentGridColumns = parentGridSizes[2];
      this.backtracked = false
      this.neighbourCounter = 0;
    }
  
    setup() {
      // start algorithm from start cell
      this.paths.push(this.start)
      console.log("solver initiated")
      // common sense
      this.start.gscore = 0;
      this.start.fscore = this.getManhattanDistance(this.start, this.finish);
    }

    draw() {
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
        
        // Done
        if (current === this.finish) {
          this.solved = true;
          this.solving == false;
          this.backtracking = true;
          this.finish = current;
          return
        }

        // Fill the cell with the best fscore with grey
        current.fillCellColour(current.columnNumber,current.rowNumber,this.parentGridSize,this.parentGridColumns,this.parentGridRows, greyColour,false)
        current.grey_colour = true
         
        // remove "next" from queue/list/array/stack
        const index = this.paths.indexOf(current);
        if (index > -1) {
          this.paths.splice(index, 1); // 2nd parameter means remove one item only
        }
  
        // Search through neighbour paths of current to see if you can assign a better fscore and gscore
        let neighbourPaths = this.getNeighbourPaths(current, this.parentGrid);
        for(let neighbour of neighbourPaths) {
          let new_gscore= current.gscore + 1
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
              
              // Output grey square to show this cell has been explored
              neighbour.fillCellColour(neighbour.columnNumber, neighbour.rowNumber,this.parentGridSize, this.parentGridColumns, this.parentGridRows, greenColour,false)
              neighbour.green_colour = true
            }
          }
        }
      } 
      // Best path has been found and not its time to highlight it
      else if(this.backtracking == true){
        // Remove grey cells in the way
        this.finish.removeCellColour(this.finish,greyColour)
        // Show final path with purple lines
        this.finish.fillCellColour(this.finish.columnNumber, this.finish.rowNumber,this.parentGridSize, this.parentGridColumns, this.parentGridRows, purpleColour, true)
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
  
    getNeighbourPaths(cell, parentGrid) {
      let row = cell.rowNumber;
      let col = cell.columnNumber;
      let grid = parentGrid;
      let neighbourPaths = []
      // If top wall dosnt exist it means cell above is a neighbour
      if(cell.walls.topWall === false) {
        neighbourPaths.push(grid[row-1][col])
      }
      // If bottom wall dosnt exist it means cell below is a neighbour
      if(cell.walls.bottomWall === false) {
        neighbourPaths.push(grid[row+1][col])
      }
      // If left wall dosnt exist it means cell on left is a neighbour
      if(cell.walls.leftWall === false) {
        neighbourPaths.push(grid[row][col-1])
      }
      // If right wall dosnt exist it means cell on right is a neighbour
      if(cell.walls.rightWall === false) {
        neighbourPaths.push(grid[row][col+1])
      }
      
      // return all neighbour paths found
      if(neighbourPaths.length > 0) {
        return neighbourPaths
      } else {
        return undefined
      }
    }
  
    getLowestFscore(paths) {
      // Loop through array of paths and find store ones with lowest score
      let lowest = []
      for (let i of paths) {
        if(lowest.length === 0) {
          lowest.push(i);
        }else if(i.fscore < lowest[0].fscore) {
          lowest = []
          lowest.push(i)
        }else if(i.fscore === lowest[0].fscore) {
          lowest.push(i);
        }
      }
  
      // If there exists path of the same fscore randomely pick a path
      if(lowest.length > 0) {
        let random = Math.floor(Math.random() * lowest.length)
        return lowest[random];
      } else {
        return undefined
      }  
    }
  
    // Heuristic function or fscore:  the actual distance between to given cells in a straight line (could be diagonal if that makes sense)
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
  
  return {
    Maze: Maze,
    Cell: Cell,
    MazeSolver: MazeSolver
  };

  // Removes the object 
  function removeObject3D(object3D) {
    if (!(object3D instanceof THREE.Object3D)){ 
      return false;
    }

    // for better memory management and performance
    object3D.geometry.dispose();
    if (object3D.material instanceof Array) {
        // for better memory management and performance
        object3D.material.forEach(material => material.dispose());
    } else {
        // for better memory management and performance
        object3D.material.dispose();
    }
    // default parent will be the scene so this good
    object3D.removeFromParent(); 
    return true;
  }
})();