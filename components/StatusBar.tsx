'use client';

import { useSocket } from '@/hooks/useSocket';
import { useGameState } from '@/contexts/GameContext';

export function StatusBar() {
  const { isConnected } = useSocket();
  const { state } = useGameState();

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (state.status === 'waiting') return 'Waiting for opponent...';
    if (state.status === 'playing') return 'Game in progress';
    if (state.status === 'finished') return 'Game finished';
    return 'Connecting...';
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-100 text-red-800';
    if (state.status === 'waiting') return 'bg-yellow-100 text-yellow-800';
    if (state.status === 'playing') return 'bg-blue-100 text-blue-800';
    if (state.status === 'finished') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`px-4 py-2 rounded-lg ${getStatusColor()}`}>
      <p className="text-sm font-medium">{getStatusText()}</p>
    </div>
  );
}



