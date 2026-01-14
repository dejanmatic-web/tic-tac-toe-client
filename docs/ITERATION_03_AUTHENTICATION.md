# Iteration 3: Authentication System

This iteration covers implementing the authentication hook and AuthGuard component to handle player authentication via JWT tokens.

---

## Step 1: Create useAuth Hook

Create `hooks/useAuth.ts`:

```typescript
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

    if (!matchId || !token) {
      setAuthError('Missing matchId or token in URL');
      return;
    }

    console.log('[Auth] Authenticating...', { matchId, hasToken: !!token });
    hasAttemptedAuth.current = true;
    setIsAuthenticating(true);
    setAuthError(null);

    socket.emit('authenticate', { token, matchId });
  }, [socket, isConnected, searchParams]);

  useEffect(() => {
    if (!socket) return;

    const onAuthenticated = (data: PlayerIdentity) => {
      console.log('[Auth] Authenticated!', data);
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
```

**Key Points:**
- Extracts `matchId` and `token` from URL params
- Supports both `token` and `matchToken` parameter names
- Handles authentication success/failure events
- Auto-authenticates when socket connects
- Prevents duplicate authentication attempts
- Re-authenticates on reconnect

---

## Step 2: Create AuthGuard Component

Create `components/AuthGuard.tsx`:

```tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { player, isAuthenticating, authError } = useAuth();

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700">{authError}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticating || !player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

**Key Points:**
- Shows loading state while authenticating
- Displays error message on authentication failure
- Only renders children when authenticated

---

## Step 3: Create ErrorDisplay Component

Create `components/ErrorDisplay.tsx`:

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-center text-sm"
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Understanding the Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Platform redirects player to:                           │
│     /game/[matchId]?matchId=xxx&token=yyy                   │
│     ↓                                                       │
│  2. AuthGuard mounts                                        │
│     ↓                                                       │
│  3. useAuth() extracts matchId and token from URL           │
│     ↓                                                       │
│  4. Socket connects                                         │
│     ↓                                                       │
│  5. Emit 'authenticate' event with { token, matchId }       │
│     ↓                                                       │
│  6. Server validates token with platform SDK                │
│     ↓                                                       │
│  7a. Success: Server emits 'authenticated'                  │
│      - player state set                                     │
│      - Children render                                      │
│                                                             │
│  7b. Failure: Server emits 'auth_error'                     │
│      - authError state set                                  │
│      - Error message displayed                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 4: URL Structure

The platform redirects players to the game with these URL parameters:

```
https://your-frontend.com/game/[matchId]?matchId=xxx&token=yyy
```

| Parameter | Description |
|-----------|-------------|
| `matchId` | Unique match identifier (also in URL path) |
| `token` | JWT token for authentication |
| `matchToken` | Alternative name for token (legacy support) |

---

## Verification

After completing this iteration, you should have:
- ✅ useAuth hook implemented
- ✅ AuthGuard component created
- ✅ ErrorDisplay component created
- ✅ URL parameter extraction working
- ✅ Authentication event handling

**Authentication Events:**
- `authenticate` (client → server)
- `authenticated` (server → client)
- `auth_error` (server → client)

**Test the authentication:**

You'll need a valid token from the platform to fully test. For now, verify:
1. AuthGuard shows "Authenticating..." when loading
2. Missing token shows error message
3. Console logs show authentication attempts

**Next:** Proceed to [Iteration 4: Game State Management](./ITERATION_04_GAME_STATE.md)


