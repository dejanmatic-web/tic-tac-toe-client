'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useSearchParams } from 'next/navigation';

export interface PlayerIdentity {
  playerId: string;
  username: string;
  matchId: string;
  symbol: 'X' | 'O' | null;
  matchStatus: 'waiting' | 'playing' | 'finished';
}

let hasAttemptedAuth = false;

export const useAuth = () => {
  const { socket, isConnected } = useSocket();
  const searchParams = useSearchParams();
  const [player, setPlayer] = useState<PlayerIdentity | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const authenticate = useCallback(() => {
    if (!socket || !isConnected || hasAttemptedAuth) return;

    const matchId = searchParams.get('matchId');
    // Support both 'token' and 'matchToken' parameter names
    const token = searchParams.get('token') || searchParams.get('matchToken');

    if (!matchId || !token) {
      setAuthError('Missing matchId or token in URL');
      return;
    }

    hasAttemptedAuth = true;
    setIsAuthenticating(true);
    setAuthError(null);

    socket.emit('authenticate', { token, matchId });
  }, [socket, isConnected, searchParams]);

  useEffect(() => {
    if (!socket) return;

    const onAuthenticated = (data: PlayerIdentity) => {
      setPlayer(data);
      setIsAuthenticating(false);
      setAuthError(null);
    };

    const onAuthError = (error: { message: string }) => {
      setAuthError(error.message);
      setIsAuthenticating(false);
      hasAttemptedAuth = false;
    };

    socket.on('authenticated', onAuthenticated);
    socket.on('auth_error', onAuthError);

    return () => {
      socket.off('authenticated', onAuthenticated);
      socket.off('auth_error', onAuthError);
    };
  }, [socket]);

  // Auto-authenticate when connected
  useEffect(() => {
    if (isConnected && !player && !isAuthenticating && !hasAttemptedAuth) {
      // Use microtask to avoid setState in effect warning
      queueMicrotask(() => {
        authenticate();
      });
    }
  }, [isConnected, player, isAuthenticating, authenticate]);

  return {
    player,
    isAuthenticating,
    authError,
    authenticate,
  };
};
