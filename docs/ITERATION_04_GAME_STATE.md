# Iteration 4: Game State Management

This iteration covers implementing the GameContext with a reducer for managing game state and handling socket events.

---

## Step 1: Create GameContext

Create `contexts/GameContext.tsx`:

```tsx
'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '@/hooks/useSocket';
import { GameState, GamePlayer } from '@/types/game';

interface GameContextType {
  state: GameState;
  socket: Socket | null;
  makeMove: (row: number, col: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: 'MATCH_STARTED'; payload: { matchId: string; players: GamePlayer[]; currentPlayer: 'X' | 'O' } }
  | { type: 'GAME_STATE'; payload: { board: string[][]; currentPlayer: 'X' | 'O'; players: GamePlayer[] } }
  | { type: 'MOVE_MADE'; payload: { board: string[][]; currentPlayer: 'X' | 'O' } }
  | { type: 'GAME_FINISHED'; payload: { winner: string | null; board: string[][] } }
  | { type: 'SET_MY_SYMBOL'; payload: { symbol: 'X' | 'O' } };

const initialState: GameState = {
  matchId: null,
  players: [],
  board: [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ],
  currentPlayer: null,
  mySymbol: null,
  status: 'waiting',
  winner: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MATCH_STARTED':
      return {
        ...state,
        matchId: action.payload.matchId,
        players: action.payload.players,
        currentPlayer: action.payload.currentPlayer,
        status: 'playing',
      };
    case 'GAME_STATE':
      return {
        ...state,
        board: action.payload.board,
        currentPlayer: action.payload.currentPlayer,
        players: action.payload.players,
        status: 'playing',
      };
    case 'MOVE_MADE':
      return {
        ...state,
        board: action.payload.board,
        currentPlayer: action.payload.currentPlayer,
      };
    case 'GAME_FINISHED':
      return {
        ...state,
        status: 'finished',
        winner: action.payload.winner,
        board: action.payload.board,
      };
    case 'SET_MY_SYMBOL':
      return {
        ...state,
        mySymbol: action.payload.symbol,
      };
    default:
      return state;
  }
}

export function GameProvider({ children, playerId }: { children: ReactNode; playerId: string | null }) {
  const { socket } = useSocket();
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Use ref to always have access to latest playerId in callbacks
  const playerIdRef = useRef(playerId);
  playerIdRef.current = playerId;

  useEffect(() => {
    if (!socket) return;

    const onMatchStarted = (data: { matchId: string; players: GamePlayer[]; currentPlayer: 'X' | 'O'; yourSymbol?: 'X' | 'O' }) => {
      console.log('[Game] Match started:', data);
      dispatch({ type: 'MATCH_STARTED', payload: data });

      // Use yourSymbol directly if provided (server sends it individually to each player)
      if (data.yourSymbol) {
        console.log('[Game] Setting my symbol from yourSymbol:', data.yourSymbol);
        dispatch({ type: 'SET_MY_SYMBOL', payload: { symbol: data.yourSymbol } });
      } else {
        // Fallback: try to find by ID
        const currentPlayerId = playerIdRef.current;
        const myPlayer = data.players.find((p) => String(p.id) === String(currentPlayerId));
        if (myPlayer?.symbol) {
          console.log('[Game] Setting my symbol from players array:', myPlayer.symbol);
          dispatch({ type: 'SET_MY_SYMBOL', payload: { symbol: myPlayer.symbol } });
        } else {
          console.warn('[Game] Could not determine my symbol. Players:', data.players, 'My ID:', currentPlayerId);
        }
      }
    };

    const onGameState = (data: { board: string[][]; currentPlayer: 'X' | 'O'; players: GamePlayer[]; yourSymbol?: 'X' | 'O' }) => {
      console.log('[Game] Game state:', data);
      dispatch({ type: 'GAME_STATE', payload: data });

      // Use yourSymbol directly if provided (for reconnecting players)
      if (data.yourSymbol) {
        console.log('[Game] Setting my symbol from game_state yourSymbol:', data.yourSymbol);
        dispatch({ type: 'SET_MY_SYMBOL', payload: { symbol: data.yourSymbol } });
      } else {
        // Fallback: find by ID
        const currentPlayerId = playerIdRef.current;
        const myPlayer = data.players.find((p) => String(p.id) === String(currentPlayerId));
        if (myPlayer?.symbol) {
          dispatch({ type: 'SET_MY_SYMBOL', payload: { symbol: myPlayer.symbol } });
        }
      }
    };

    const onMoveMade = (data: { board: string[][]; currentPlayer: 'X' | 'O' }) => {
      dispatch({ type: 'MOVE_MADE', payload: data });
    };

    const onGameFinished = (data: { winner: string | null; board: string[][] }) => {
      dispatch({ type: 'GAME_FINISHED', payload: data });
    };

    socket.on('match_started', onMatchStarted);
    socket.on('game_state', onGameState);
    socket.on('move_made', onMoveMade);
    socket.on('game_finished', onGameFinished);

    return () => {
      socket.off('match_started', onMatchStarted);
      socket.off('game_state', onGameState);
      socket.off('move_made', onMoveMade);
      socket.off('game_finished', onGameFinished);
    };
  }, [socket]); // Remove playerId from deps - we use ref instead

  const makeMove = (row: number, col: number) => {
    // Check all conditions before allowing move
    if (!socket || !state.mySymbol || state.status !== 'playing' || state.currentPlayer !== state.mySymbol) {
      console.log('[Game] Move blocked:', {
        hasSocket: !!socket,
        mySymbol: state.mySymbol,
        status: state.status,
        currentPlayer: state.currentPlayer
      });
      return;
    }
    console.log('[Game] Making move:', { row, col, mySymbol: state.mySymbol });
    socket.emit('make_move', { row, col });
  };

  return (
    <GameContext.Provider value={{ state, socket, makeMove }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}
```

---

## Step 2: Understanding the State

### GameState Interface

```typescript
interface GameState {
  matchId: string | null;      // Current match ID
  players: GamePlayer[];       // Both players in the match
  board: string[][];           // 3x3 game board
  currentPlayer: 'X' | 'O' | null;  // Whose turn it is
  mySymbol: 'X' | 'O' | null;  // This player's symbol
  status: 'waiting' | 'playing' | 'finished';  // Game status
  winner: string | null;       // Winner symbol or null for draw
}
```

### Game Actions

| Action | Description |
|--------|-------------|
| `MATCH_STARTED` | Both players connected, game begins |
| `GAME_STATE` | Sync current game state (on reconnect) |
| `MOVE_MADE` | A move was made, update board |
| `GAME_FINISHED` | Game ended (win or draw) |
| `SET_MY_SYMBOL` | Set this player's symbol (X or O) |

---

## Step 3: Understanding the Game Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Game State Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Initial State: status = 'waiting'                          │
│     ↓                                                       │
│  Server sends 'match_started'                               │
│     → status = 'playing'                                    │
│     → players array populated                               │
│     → currentPlayer = 'X'                                   │
│     → mySymbol assigned                                     │
│     ↓                                                       │
│  Player makes move (if their turn)                          │
│     → emit 'make_move' { row, col }                         │
│     ↓                                                       │
│  Server validates and broadcasts 'move_made'                │
│     → board updated                                         │
│     → currentPlayer switches                                │
│     ↓                                                       │
│  [Repeat until game ends]                                   │
│     ↓                                                       │
│  Server sends 'game_finished'                               │
│     → status = 'finished'                                   │
│     → winner set (or null for draw)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 4: Move Validation

The `makeMove` function validates before sending:

```typescript
const makeMove = (row: number, col: number) => {
  // Check all conditions:
  // 1. Socket must be connected
  // 2. Player must have a symbol assigned
  // 3. Game must be in 'playing' status
  // 4. It must be this player's turn

  if (!socket || !state.mySymbol || state.status !== 'playing' || state.currentPlayer !== state.mySymbol) {
    return; // Move blocked
  }

  socket.emit('make_move', { row, col });
};
```

**Note:** The server also validates moves. Client-side validation is for UX only.

---

## Step 5: Socket Events Summary

### Listening For (server → client):

| Event | Payload | Action |
|-------|---------|--------|
| `match_started` | `{ matchId, players, currentPlayer, yourSymbol? }` | Start game |
| `game_state` | `{ board, currentPlayer, players, yourSymbol? }` | Sync state |
| `move_made` | `{ board, currentPlayer }` | Update board |
| `game_finished` | `{ winner, board }` | End game |

### Emitting (client → server):

| Event | Payload | Description |
|-------|---------|-------------|
| `make_move` | `{ row, col }` | Make a move |

---

## Verification

After completing this iteration, you should have:
- ✅ GameContext created
- ✅ Game reducer implemented
- ✅ Socket event handlers set up
- ✅ makeMove function working
- ✅ State management complete

**State Management Features:**
- ✅ Initial state with empty board
- ✅ Match start handling
- ✅ Move handling with turn switching
- ✅ Game finish handling
- ✅ Symbol assignment

**Next:** Proceed to [Iteration 5: UI Components](./ITERATION_05_UI_COMPONENTS.md)


