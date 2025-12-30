'use client';

import { useGameState } from '@/contexts/GameContext';
import { GameCell } from './GameCell';
import { motion } from 'framer-motion';

export function GameBoard() {
  const { state, makeMove } = useGameState();

  const handleCellClick = (row: number, col: number) => {
    if (
      state.status !== 'playing' ||
      state.currentPlayer !== state.mySymbol ||
      state.board[row][col] !== ''
    ) {
      return;
    }
    makeMove(row, col);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-3 gap-3 bg-blue-500 p-3 rounded-lg"
    >
      {state.board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            disabled={
              state.status !== 'playing' ||
              state.currentPlayer !== state.mySymbol ||
              cell !== ''
            }
          />
        ))
      )}
    </motion.div>
  );
}

