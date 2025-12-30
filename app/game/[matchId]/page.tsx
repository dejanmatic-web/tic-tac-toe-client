'use client';

import { Suspense } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { AuthGuard } from '@/components/AuthGuard';
import { GameContainer } from '@/components/GameContainer';
import { StatusBar } from '@/components/StatusBar';
import { PlayerInfo } from '@/components/PlayerInfo';
import { TurnIndicator } from '@/components/TurnIndicator';
import { GameBoard } from '@/components/GameBoard';
import { WaitingScreen } from '@/components/WaitingScreen';
import { GameOverModal } from '@/components/GameOverModal';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useGameState } from '@/contexts/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

function GameContent() {
  const { state } = useGameState();
  const { socket } = useSocket();
  const { authError } = useAuth();
  const [socketError, setSocketError] = useState<string | null>(null);
  const [disconnectedPlayer, setDisconnectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onError = (error: { message: string }) => {
      setSocketError(error.message);
    };

    const onPlayerDisconnected = (data: { playerId: string }) => {
      setDisconnectedPlayer(data.playerId);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.opener) {
          window.close();
        }
      }, 3000);
    };

    socket.on('error', onError);
    socket.on('player_disconnected', onPlayerDisconnected);

    return () => {
      socket.off('error', onError);
      socket.off('player_disconnected', onPlayerDisconnected);
    };
  }, [socket]);

  return (
    <GameContainer>
      <ConnectionStatus />
      <StatusBar />
      <ErrorDisplay error={authError || socketError || (disconnectedPlayer ? 'Opponent disconnected. Match will be cancelled.' : null)} />

      {state.status === 'waiting' ? (
        <WaitingScreen />
      ) : (
        <>
          <PlayerInfo />
          <TurnIndicator />
          <GameBoard />
        </>
      )}

      <GameOverModal />
    </GameContainer>
  );
}

function GamePageContent() {
  const { player } = useAuth();

  return (
    <GameProvider playerId={player?.playerId || null}>
      <GameContent />
    </GameProvider>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <GameContainer>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </GameContainer>
    }>
      <AuthGuard>
        <GamePageContent />
      </AuthGuard>
    </Suspense>
  );
}
