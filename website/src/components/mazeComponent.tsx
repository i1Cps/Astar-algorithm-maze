import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Maze } from "./maze/maze";
import { AStarMazeSolver } from "./maze/aStarMazeSolver";

interface ThreeCanvasProps {
  boardSize: number;
  boardRows: number;
  boardColumns: number;
  width: number;
  height: number;
  generate: boolean;
}

// Three.js component that accesses the maze logic
const MazeComponent: React.FC<ThreeCanvasProps> = ({
  width,
  height,
  generate,
  boardSize,
  boardRows,
  boardColumns,
}) => {
  // Standard global constants and variables
  const mountRef = useRef<HTMLDivElement | null>(null);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  const scene = new THREE.Scene();
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controls = useRef<OrbitControls | null>(null);
  // Custom constants and variables

  // Hook handles scene creation and animation loop
  useEffect(() => {
    // RENDERER
    // Attach renderer's DOM element
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    renderer.setClearColor(0x000000, 0); // Transparent background

    // CAMERA
    // Camera variables
    var VIEW_ANGLE = 75,
      ASPECT = width / height,
      NEAR = 0.1,
      FAR = 20000;
    // First Camera
    cameraRef.current = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR
    );
    cameraRef.current.position.set(0, 10, 200);

    // CONTROLS
    controls.current = new OrbitControls(
      cameraRef.current,
      renderer.domElement
    );

    controls.current.maxAzimuthAngle = 0.87;
    controls.current.minAzimuthAngle = -0.87;
    controls.current.maxPolarAngle = 2.25;
    controls.current.minPolarAngle = 0.9;
    controls.current.enableZoom = false;

    // LIGHT
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(100, 50, 100);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(pointLight, ambientLight);

    // Instance of maze class
    const maze = new Maze(boardSize, boardRows, boardColumns, scene);
    var solver: AStarMazeSolver | null = null;
    // Setup the important maze properties before generating it
    maze.setup();

    // Animation loop
    const animate = () => {
      // Generate Maze
      if (maze.isMazeComplete() === false) {
        maze.createMaze();
      } else {
        // If maze is not currently being solved, create and initialise the solver setup function
        if (maze.isSolving() === false) {
          maze.setSolving(true);
          let mazeGrid = maze.getMazeGrid();
          let start = mazeGrid[0][0];
          let finish = mazeGrid[boardColumns - 1][boardRows - 1];
          let mazeSizes = [boardSize, boardColumns, boardRows];
          solver = new AStarMazeSolver(start, finish, mazeGrid, mazeSizes);
          solver.setup();
        }
        // If maze is currently solving, keep calling the solve step until maze is solved
        else {
          if (solver) {
            // If solver hasnt solved the maze
            if (solver.getSolved() === false) {
              solver.solveStep();
            }
            // If the solver has solved the maze, start the backTracking (outputs final maze path)
            else if (solver.getBackTracking() === true) {
              solver.solveStep();
            } else {
            }
          }
        }
      }

      // Update your scene and camera here
      renderer.render(scene, cameraRef.current!);
      controls.current?.update();
      requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();

    // Clean-up logic (This is called when the useEffect hook refreshes)
    return () => {
      // Remove all objects created by maze
      if (maze.getMazeExist()) {
        maze.destroyMaze();
      }
      renderer.clear();
      cameraRef.current?.clear();
      scene.clear();
      controls.current?.dispose();

      // Remove current renderer from mount so new one can be generated and appended
      mountRef.current?.replaceChildren();
    };
    // Below are the useEffect dependency array variables, if one of these change throught the react app, useEffect hook is reloaded
  }, [boardSize, boardRows, boardColumns, height, width, generate]);

  // returns the mountref element
  return <div className="h-full w-full overflow-hidden" ref={mountRef}></div>;
};

export default MazeComponent;
