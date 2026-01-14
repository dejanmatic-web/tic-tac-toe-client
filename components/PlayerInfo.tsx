'use client';

import { useGameState } from '@/contexts/GameContext';
import { motion } from 'framer-motion';

export function PlayerInfo() {
  const { state } = useGameState();

  return (
    <div className="flex justify-around gap-4 mb-4">
      {state.players.map((player, index) => {
        const isActive = player.symbol === state.currentPlayer;
        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex-1 p-4 rounded-lg text-center ${
              isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="font-bold text-sm mb-1">{player.username}</p>
            <p className="text-2xl font-bold">{player.symbol || '?'}</p>
          </motion.div>
        );
      })}
    </div>
  );
}



