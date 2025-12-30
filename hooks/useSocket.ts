'use client';

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';

// Store for socket state
let socketInstance: Socket | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return socketInstance;
}

function initSocket() {
  if (!socketInstance) {
    socketInstance = getSocket();
    listeners.forEach(l => l());
  }
  return socketInstance;
}

export const useSocket = () => {
  const socket = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [isConnected, setIsConnected] = useState(() => {
    // Initialize with current socket state
    const s = initSocket();
    return s?.connected ?? false;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = initSocket();

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onError = (err: Error) => {
      setError(err.message);
      setIsConnected(false);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onError);
    };
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    socketInstance = null;
    listeners.forEach(l => l());
    setIsConnected(false);
  }, []);

  return {
    socket,
    isConnected,
    error,
    disconnect,
  };
};
