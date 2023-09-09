import React, { useState } from "react";

// Component props
interface UserInterfaceProps {
  regenerateMaze: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    boardSizeInput: number,
    boardRowsAndColumnsInput: number
  ) => void;
}

// User Interface with two input fields and a button to start the maze generater and maze solver
const UserInterface: React.FC<UserInterfaceProps> = ({ regenerateMaze }) => {
  // Use States for handling user for the fields input
  const [boardSizeInput, setBoardSizeInput] = useState<number>(200);
  const [boardRowsAndColumnsInput, setBoardRowsAndColumnsInput] =
    useState<number>(10);
  // Timeout useState to handle button spam
  const [buttomTimeout, setButtomTimeout] = useState<boolean>(false);

  // When user inputs new row and column numbers
  const handleBoardRowsAndColumnsInput = (input: number) => {
    setBoardRowsAndColumnsInput(input);
  };
  // When user inputs new board size
  const handleBoardSizeInput = (input: number) => {
    setBoardSizeInput(input);
  };

  // Prevents button spam
  const handleTimeout = () => {
    if (!buttomTimeout) {
      setButtomTimeout(true);

      setTimeout(() => {
        setButtomTimeout(false);
      }, 2000);
    }
  };

  return (
    <form className="relative bg-gray-500  w-80 h-80 flex flex-col z-20 ml-10 rounded-lg">
      <div className="bg-purple-500 m-5 relative h-16 flex items-center rounded-lg">
        <label className="text-xl m-4" htmlFor="boardSizeInput">
          Board Size:
        </label>
        <input
          id="boardSizeInput"
          className="text-2xl inset-y-0 right-0 items-center h-10 w-16 bg-transparent focus:outline-none "
          type="number"
          min="100"
          max="280"
          step="10"
          placeholder="Board size"
          value={boardSizeInput}
          onChange={(e) => handleBoardSizeInput(parseInt(e.target.value))}
        />
      </div>
      <div className="bg-purple-500 m-5 my-8 relative h-16 flex items-center rounded-lg">
        <label className="text-lg  m-4" htmlFor="boardSizeInput">
          Rows and Columns:
        </label>
        <input
          id="boardSizeInput"
          className="text-2xl inset-y-0 right-0 items-center h-10 w-16 bg-transparent focus:outline-none "
          type="number"
          min="5"
          max="20"
          placeholder="number of rows and columns"
          value={boardRowsAndColumnsInput}
          onChange={(e) =>
            handleBoardRowsAndColumnsInput(parseInt(e.target.value))
          }
        />
      </div>
      <div className="text-3xl bg-yellow-400 absolute inset-x-0 bottom-0 rounded-b-lg fs   ">
        <button
          className="bg-white w-full basis-32 h-16 right-0 text-blue-500 rounded-b-lg"
          onClick={(e) => {
            regenerateMaze(e, boardSizeInput, boardRowsAndColumnsInput);
            handleTimeout();
          }}
          disabled={buttomTimeout}
        >
          start
        </button>
      </div>
    </form>
  );
};

export default UserInterface;
