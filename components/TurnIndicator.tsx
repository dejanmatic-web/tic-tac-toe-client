'use client';

import { useGameState } from '@/contexts/GameContext';

export function TurnIndicator() {
  const { state } = useGameState();

  if (state.status !== 'playing') return null;

  const isMyTurn = state.currentPlayer === state.mySymbol;

  return (
    <div className="text-center mb-4">
      <p className={`text-lg font-bold ${isMyTurn ? 'text-blue-600' : 'text-gray-500'}`}>
        {isMyTurn ? 'Your turn!' : "Waiting for opponent's turn..."}
      </p>
    </div>
  );
}



