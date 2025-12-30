'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/contexts/GameContext';
import { useState } from 'react';

export function GameOverModal() {
  const { state } = useGameState();
  const [dismissed, setDismissed] = useState(false);

  const isOpen = state.status === 'finished' && !dismissed;

  const getMessage = () => {
    if (!state.winner) {
      return "It's a draw!";
    }
    if (state.winner === state.mySymbol) {
      return '🎉 You won!';
    }
    const winnerPlayer = state.players.find((p) => p.symbol === state.winner);
    return `😔 ${winnerPlayer?.username || 'Opponent'} won!`;
  };

  const handleClose = () => {
    setDismissed(true);
    
    if (typeof window === 'undefined') return;
    
    // Try to notify parent window (GamerStake iframe)
    try {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'GAME_FINISHED', winner: state.winner }, '*');
      }
    } catch (e) {
      // Ignore cross-origin errors
    }
    
    // Try multiple ways to close/redirect
    setTimeout(() => {
      // If opened as popup, try to close
      if (window.opener) {
        window.close();
        return;
      }
      
      // If in iframe, try to redirect parent or self
      try {
        // Try to go back in history
        if (window.history.length > 1) {
          window.history.back();
          return;
        }
      } catch (e) {
        // Ignore
      }
      
      // Last resort: redirect to GamerStake
      window.location.href = 'https://dev.gamerstake.io';
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-4">Game Over</h2>
              <p className="text-lg md:text-xl text-gray-700 mb-6">{getMessage()}</p>
              <button
                onClick={handleClose}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Return to Games
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
