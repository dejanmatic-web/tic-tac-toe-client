'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { useSearchParams } from 'next/navigation';

export interface PlayerIdentity {
  playerId: string;
  username: string;
  matchId: string;
  symbol: 'X' | 'O' | null;
  matchStatus: 'waiting' | 'playing' | 'finished';
}

export const useAuth = () => {
  const { socket, isConnected } = useSocket();
  const searchParams = useSearchParams();
  const [player, setPlayer] = useState<PlayerIdentity | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const hasAttemptedAuth = useRef(false);
  const wasConnected = useRef(false);

  // Reset auth state on reconnect
  useEffect(() => {
    if (isConnected && !wasConnected.current) {
      // Just connected (or reconnected)
      console.log('[Auth] Socket connected, resetting auth state');
      hasAttemptedAuth.current = false;
    }
    wasConnected.current = isConnected;
  }, [isConnected]);

  const authenticate = useCallback(() => {
    if (!socket || !isConnected || hasAttemptedAuth.current) return;

    const matchId = searchParams.get('matchId');
    // Support both 'token' and 'matchToken' parameter names
    const token = searchParams.get('token') || searchParams.get('matchToken');

    // Log full URL and params for debugging
    console.log('[Auth] 🌐 Current URL:', window.location.href);
    console.log('[Auth] 📋 URL Params:');
    console.log('   → matchId:', matchId);
    console.log('   → token:', token ? `${token.substring(0, 30)}... (length: ${token.length})` : 'null');
    console.log('   → All params:', Object.fromEntries(searchParams.entries()));

    if (!matchId || !token) {
      setAuthError('Missing matchId or token in URL');
      return;
    }

    console.log('[Auth] Authenticating...', { matchId, hasToken: !!token });
    console.log('[Auth] 📤 Emitting "authenticate" event to server');
    console.log('   → Payload: { matchId: "' + matchId + '", token: "' + token.substring(0, 20) + '..." }');
    hasAttemptedAuth.current = true;
    setIsAuthenticating(true);
    setAuthError(null);

    socket.emit('authenticate', { token, matchId });
  }, [socket, isConnected, searchParams]);

  useEffect(() => {
    if (!socket) return;

    const onAuthenticated = (data: PlayerIdentity) => {
      console.log('[Auth] ✅ Authenticated!');
      console.log('   → playerId:', data.playerId);
      console.log('   → username:', data.username);
      console.log('   → matchId:', data.matchId);
      console.log('   → symbol:', data.symbol);
      console.log('   → matchStatus:', data.matchStatus);
      console.log('   → Full response:', JSON.stringify(data, null, 2));
      setPlayer(data);
      setIsAuthenticating(false);
      setAuthError(null);
    };

    const onAuthError = (error: { message: string }) => {
      console.error('[Auth] Auth error:', error);
      setAuthError(error.message);
      setIsAuthenticating(false);
      hasAttemptedAuth.current = false; // Allow retry on error
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
    if (isConnected && !player && !isAuthenticating && !hasAttemptedAuth.current) {
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
