import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { AxesHelper } from 'three';
import {Maze} from './maze.js';
import { AStarMazeSolver } from './aStarMazeSolver.js';
import KeyboardInputs from './keyboardInputs.js'

// MAIN

// GLOBAL CONSTANTS
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const boardSize = 200;
const rows = 10;
const columns = 10;
const spherical = new THREE.Spherical();


// STANDARD GLOBAL CONSTANTS AND VARIABLES
var scene: THREE.Scene;
var camera: THREE.PerspectiveCamera;
var renderer: THREE.WebGLRenderer;
var controls: OrbitControls; 
var keyboardInput: KeyboardInputs;
KeyboardInputs.initialize();

// CUSTOM GLOBAL CONSTANTS AND VARIABLES
var topCamera;
let solver: AStarMazeSolver;
let maze: Maze;
let ticktock: boolean

init();
animate();

// FUNCTIONS
function init() {
  scene = new THREE.Scene();

  // CAMERA
	var VIEW_ANGLE = 75, ASPECT = sizes.width / sizes.height, NEAR = 0.1, FAR = 20000;
  // camera 1
  camera = new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR
  );  
  
  camera.position.set(0,10,250);
  
  // RENDERER
  const canvasElement = document.querySelector('#bg') as HTMLCanvasElement;
  if (canvasElement) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
    });
  }
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);

  // EVENTS
  window.addEventListener("resize", () => {
    //update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //update cameras
    camera.aspect = sizes.width/sizes.height;
    camera.updateProjectionMatrix();

    //update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxAzimuthAngle = 0.5;
  controls.minAzimuthAngle = -0.5;
  controls.maxPolarAngle = 2.05;
  controls.minPolarAngle = 1.10;


  // LIGHT
  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(100,50,100);
  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(pointLight)
  //scene.add(ambientLight, pointLight)

  // HELPERS
  const lightHelper = new THREE.PointLightHelper(pointLight);
  const gridHelper = new THREE.GridHelper(200, 50);
  const axisHelper = new THREE.AxesHelper(100)
  //scene.add(lightHelper,  axisHelper);

  //Space background
  const spaceTexture = new THREE.TextureLoader().load('space.jpg');
  scene.background = spaceTexture;

  maze = new Maze(200, 10, 10,scene);
  maze.setup()
}

//Animate
function animate() {
  // Generate the maze
  if(maze.getMazeComplete() === false) {
    maze.createMaze()
  }
  else {
    // If maze is not currently being solved, initialize the solving setup function
    if(maze.getSolving() == false) {
      maze.setSolving(true);
      let mazeGrid = maze.getMazeGrid();
      let start = mazeGrid[0][0]
      let finish = mazeGrid[rows-1][columns-1]
      let mazeSizes = [boardSize, rows, columns]
      solver = new AStarMazeSolver(start,finish, mazeGrid, mazeSizes)
      solver.setup()
    }

    // recusively call
    else {
      if(solver.getSolved() == false) {
        solver.solveStep();
      } else if(solver.getBackTracking() == true) {
        solver.solveStep();
      }
    }
    
  }
  
  window.requestAnimationFrame(animate)
  render();
  update();
}

function update() {
  KeyboardInputs.update();
  controls.update();
}



function render() {
    renderer.render(scene, camera)
}