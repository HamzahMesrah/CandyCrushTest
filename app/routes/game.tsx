import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

const GRID_SIZE = 8;
const ITEM_TYPES = ['🍎', '🍇', '🍊', '🍋', '🍒', '🍓'];
const POINTS_PER_MATCH = 10;

export async function loader() {
  const initialGrid = generateGrid();
  return json({ initialGrid });
}

function generateGrid() {
  const grid = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const currentRow = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      currentRow.push(ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)]);
    }
    grid.push(currentRow);
  }
  return grid;
}

export default function Game() {
  const { initialGrid } = useLoaderData<typeof loader>();
  const [grid, setGrid] = useState(initialGrid);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    checkMatches();
  }, [grid]);

  const handleClick = (row: number, col: number) => {
    if (isAnimating) return;

    if (!selected) {
      setSelected([row, col]);
    } else {
      const [selectedRow, selectedCol] = selected;
      if ((Math.abs(selectedRow - row) === 1 && selectedCol === col) ||
          (Math.abs(selectedCol - col) === 1 && selectedRow === row)) {
        swapItems(selectedRow, selectedCol, row, col);
        setSelected(null);
      } else {
        setSelected([row, col]);
      }
    }
  };

  const swapItems = (row1: number, col1: number, row2: number, col2: number) => {
    setIsAnimating(true);
    const newGrid = [...grid];
    [newGrid[row1][col1], newGrid[row2][col2]] = 
      [newGrid[row2][col2], newGrid[row1][col1]];
    setGrid(newGrid);

    setTimeout(() => {
      if (!checkMatches()) {
        [newGrid[row1][col1], newGrid[row2][col2]] = 
          [newGrid[row2][col2], newGrid[row1][col1]];
        setGrid([...newGrid]);
      }
      setIsAnimating(false);
    }, 300);
  };

  const checkMatches = () => {
    let matchesFound = false;
    const newGrid = [...grid];

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        if (newGrid[row][col] && 
            newGrid[row][col] === newGrid[row][col + 1] &&
            newGrid[row][col] === newGrid[row][col + 2]) {
          matchesFound = true;
          setScore(prev => prev + POINTS_PER_MATCH);
          for (let i = 0; i < 3; i++) {
            newGrid[row][col + i] = '';
          }
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        if (newGrid[row][col] && 
            newGrid[row][col] === newGrid[row + 1][col] &&
            newGrid[row][col] === newGrid[row + 2][col]) {
          matchesFound = true;
          setScore(prev => prev + POINTS_PER_MATCH);
          for (let i = 0; i < 3; i++) {
            newGrid[row + i][col] = '';
          }
        }
      }
    }

    if (matchesFound) {
      setTimeout(() => {
        fillEmptySpaces(newGrid);
        setGrid([...newGrid]);
      }, 300);
    }

    return matchesFound;
  };

  const fillEmptySpaces = (grid: string[][]) => {
    for (let col = 0; col < GRID_SIZE; col++) {
      let emptyRow = GRID_SIZE - 1;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (grid[row][col]) {
          [grid[row][col], grid[emptyRow][col]] = 
            [grid[emptyRow][col], grid[row][col]];
          emptyRow--;
        }
      }
      for (let row = emptyRow; row >= 0; row--) {
        grid[row][col] = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-white">Match 3 Puzzle Game</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="grid gap-1" style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 50px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 50px)`
        }}>
          {grid.map((row, rowIndex) => 
            row.map((item, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`flex items-center justify-center text-3xl rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 ${
                  selected && selected[0] === rowIndex && selected[1] === colIndex
                    ? 'ring-4 ring-blue-500'
                    : 'bg-gray-700'
                }`}
                onClick={() => handleClick(rowIndex, colIndex)}
              >
                {item}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-8 text-2xl font-semibold text-white">
        Score: {score}
      </div>
    </div>
  );
}
