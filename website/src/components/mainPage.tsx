import MazeComponent from "./mazeComponent";
import React, { useState } from "react";
import UserInterface from "./userInterface";

// Main page of the react app, you see the background
function MainPage() {
  // UseStates for handling user inputs
  const [boardSize, setBoardSize] = useState<number>(200);
  const [boardRows, setBoardRow] = useState<number>(10);
  const [boardColumns, setBoardColumns] = useState<number>(10);
  const [generate, setGenerate] = useState<boolean>(true);

  // Call back function for 'start' button
  const regenerateMaze = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    boardSizeInput: number,
    boardRowsAndColumnsInput: number
  ) => {
    // Stops default behaviour (refreshing page) when hitting enter/send (submitting a form)
    e.preventDefault();
    // Updates board size used in the Three.js component
    setBoardSize(boardSizeInput);
    // Updates the number of rows and columns in the maze used in the Three.js component
    setBoardColumns(boardRowsAndColumnsInput);
    setBoardRow(boardRowsAndColumnsInput);
    // Triggers the regeneration of the maze
    setGenerate(!generate);
  };

  // Renders Three.js component and user interface component
  return (
    <div className="h-screen w-screen bg-space bg center bg-cover text-lime-300 z-0 items-center flex">
      <div className="absolute inset-0 z-10 bg-transparent  ">
        <MazeComponent
          boardSize={boardSize}
          boardRows={boardRows}
          boardColumns={boardColumns}
          width={window.innerWidth}
          height={window.innerHeight}
          generate={generate}
        />
      </div>
      <div className="">
        <UserInterface regenerateMaze={regenerateMaze} />
      </div>
    </div>
  );
}

export default MainPage;
