# Iteration 2: Socket Client Integration

This iteration covers setting up the Socket.io client library and creating the useSocket hook for managing connections.

---

## Step 1: Create Socket Client Library

Create `lib/socket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

**Key Points:**
- Singleton pattern ensures only one socket connection
- Supports both websocket and polling transports
- Automatic reconnection with 5 attempts
- URL configured via environment variable

---

## Step 2: Create useSocket Hook

Create `hooks/useSocket.ts`:

```typescript
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
```

**Key Points:**
- Uses `useSyncExternalStore` for React 18+ compatibility
- Tracks connection state (`isConnected`)
- Handles connection errors
- Provides disconnect function
- Proper cleanup of event listeners

---

## Step 3: Create ConnectionStatus Component

Create `components/ConnectionStatus.tsx`:

```tsx
'use client';

import { useSocket } from '@/hooks/useSocket';

export function ConnectionStatus() {
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center justify-center gap-2 text-sm mb-4">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}
```

---

## Step 4: Test Socket Connection

To test the socket connection, you can temporarily add logging to the hook.

Update `hooks/useSocket.ts` to add console logs (remove in production):

```typescript
const onConnect = () => {
  console.log('[Socket] Connected');
  setIsConnected(true);
  setError(null);
};

const onDisconnect = () => {
  console.log('[Socket] Disconnected');
  setIsConnected(false);
};

const onError = (err: Error) => {
  console.log('[Socket] Error:', err.message);
  setError(err.message);
  setIsConnected(false);
};
```

---

## Understanding the Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Socket Connection Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Component mounts                                        │
│     ↓                                                       │
│  2. useSocket() called                                      │
│     ↓                                                       │
│  3. initSocket() creates connection to backend              │
│     ↓                                                       │
│  4. Socket.io attempts connection (websocket first)         │
│     ↓                                                       │
│  5. On success: 'connect' event fires                       │
│     - isConnected = true                                    │
│     ↓                                                       │
│  6. On failure: 'connect_error' event fires                 │
│     - error state set                                       │
│     - Retry logic kicks in (5 attempts)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Socket Events Reference

### Events we'll emit (client → server):
- `authenticate` - Send JWT token and match ID
- `make_move` - Send move coordinates

### Events we'll listen for (server → client):
- `authenticated` - Authentication successful
- `auth_error` - Authentication failed
- `match_started` - Match is ready to play
- `game_state` - Current game state
- `move_made` - A move was made
- `game_finished` - Game ended
- `player_disconnected` - Other player left
- `error` - General error

---

## Verification

After completing this iteration, you should have:
- ✅ Socket client library created
- ✅ useSocket hook implemented
- ✅ ConnectionStatus component created
- ✅ Connection state tracking working

**Test the connection:**

1. Start the backend server (from server iterations)
2. Start the frontend: `npm run dev`
3. Open browser console
4. You should see `[Socket] Connected` log

**Next:** Proceed to [Iteration 3: Authentication System](./ITERATION_03_AUTHENTICATION.md)

