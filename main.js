import './style.css'
import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { AxesHelper } from 'three';
import {MazeGen} from './mazeGen.js';
import { AStarMazeSolver } from './aStarMazeSolver';
import KeyboardInputs from './keyboardInputs'

// MAIN

// GLOBAL CONSTANTS
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// STANDARD GLOBAL VARIABLES
var scene, camera, renderer, controls;
var clock = new THREE.Clock();
KeyboardInputs.initialize();

// CUSTOM GLOBAL VARIABLES
var topCamera;
let solver;
let maze;
//CUSTOM GLOBAL CONSTANTS
const yhhhhhhMan = "getslikethat"


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
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
  });
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

  maze = new MazeGen(200, 10, 10,scene);
  maze.setup()
  //maze.createMaze()
}

//Animate
function animate() {
  // Generate the maze
  if(maze.mazeComplete === false) {
    maze.createMaze()
  }
  else {
    // If maze is not currently being solved, initialize the solving setup function
    if(maze.solving == false) {
      maze.solving = true;
      let start = maze.grid[0][0]
      let finish = maze.grid[maze.rows-1][maze.columns-1]
      let mazeSizes = [maze.size, maze.rows, maze.columns]

      solver = new AStarMazeSolver(start,finish, maze.grid, mazeSizes)
      solver.setup()
    }

    // recusively call
    else {
      if(solver.solved == false) {
        solver.solveStep();
      } else if(solver.backtracking == true) {
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