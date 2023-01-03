import './style.css'
import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { AxesHelper } from 'three';
import {mazeGen} from './mazeGen.js';

// MAIN

// GLOBAL CONSTANTS
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// STANDARD GLOBAL VARIABLES
var scene, camera, renderer, controls;
var clock = new THREE.Clock();
var keyboard = new KeyboardState()

// CUSTOM GLOBAL VARIABLES
var topCamera;
let newMaze;
let solver;

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
  //camera.position.setX(80);
  //camera.position.setZ(80);
  camera.position.set(0,10,250);
  //camera.position.setX(100);
  
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

  newMaze = new mazeGen.Maze(200, 10, 10,scene);
  newMaze.setup()
  newMaze.draw()
}

//Animate
function animate() {
  // Generate the maze
  if(newMaze.mazeComplete === false) {
   newMaze.draw()
  }
  else {
    // If maze is not currently being solved, initialize the solving setup function
    if(newMaze.solving == false) {
      newMaze.solving = true;
      let start = newMaze.grid[0][0]
      let finish = newMaze.grid[newMaze.rows-1][newMaze.columns-1]
      let parentGridSizes = [newMaze.size, newMaze.rows, newMaze.columns]

      solver = new mazeGen.MazeSolver(start,finish, newMaze.grid, parentGridSizes)
      solver.setup()
    }
    // Now recursively draw code finding the best path
    else {
      if(solver.solved == false) {
        solver.draw();
      } else if(solver.backtracking == true) {
        solver.draw();
      }
    }
  }
  
  window.requestAnimationFrame(animate)
  render();
  update();
}

function update() {
  keyboard.update();
  controls.update();
}

function render() {
    renderer.render(scene, camera)
}