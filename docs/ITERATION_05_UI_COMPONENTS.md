# Iteration 5: UI Components

This iteration covers building all the UI components for the game interface.

---

## Step 1: Create GameContainer

Create `components/GameContainer.tsx`:

```tsx
'use client';

import { ReactNode } from 'react';

interface GameContainerProps {
  children: ReactNode;
}

export function GameContainer({ children }: GameContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-6">
          Tic-Tac-Toe
        </h1>
        {children}
      </div>
    </div>
  );
}
```

---

## Step 2: Create GameCell

Create `components/GameCell.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';

interface GameCellProps {
  value: string;
  onClick: () => void;
  disabled: boolean;
}

export function GameCell({ value, onClick, disabled }: GameCellProps) {
  return (
    <motion.button
      whileHover={!disabled && !value ? { scale: 1.05 } : {}}
      whileTap={!disabled && !value ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-20 h-20 md:w-24 md:h-24
        bg-white rounded-lg
        flex items-center justify-center
        text-4xl md:text-5xl font-bold
        transition-colors duration-200
        ${!disabled && !value ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed'}
        ${value === 'X' ? 'text-blue-600' : 'text-red-500'}
      `}
    >
      {value && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
}
```

---

## Step 3: Create GameBoard

Create `components/GameBoard.tsx`:

```tsx
'use client';

import { useGameState } from '@/contexts/GameContext';
import { GameCell } from './GameCell';
import { motion } from 'framer-motion';

export function GameBoard() {
  const { state, makeMove } = useGameState();

  const handleCellClick = (row: number, col: number) => {
    if (
      state.status !== 'playing' ||
      state.currentPlayer !== state.mySymbol ||
      state.board[row][col] !== ''
    ) {
      return;
    }
    makeMove(row, col);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-3 gap-3 bg-blue-500 p-3 rounded-lg"
    >
      {state.board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            disabled={
              state.status !== 'playing' ||
              state.currentPlayer !== state.mySymbol ||
              cell !== ''
            }
          />
        ))
      )}
    </motion.div>
  );
}
```

---

## Step 4: Create PlayerInfo

Create `components/PlayerInfo.tsx`:

```tsx
'use client';

import { useGameState } from '@/contexts/GameContext';

export function PlayerInfo() {
  const { state } = useGameState();

  return (
    <div className="flex justify-between mb-4">
      {state.players.map((player) => (
        <div
          key={player.id}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${player.symbol === state.mySymbol ? 'bg-blue-100' : 'bg-gray-100'}
          `}
        >
          <span
            className={`
              text-xl font-bold
              ${player.symbol === 'X' ? 'text-blue-600' : 'text-red-500'}
            `}
          >
            {player.symbol}
          </span>
          <span className="text-sm text-gray-700 truncate max-w-[100px]">
            {player.username}
            {player.symbol === state.mySymbol && ' (You)'}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

## Step 5: Create TurnIndicator

Create `components/TurnIndicator.tsx`:

```tsx
'use client';

import { useGameState } from '@/contexts/GameContext';
import { motion } from 'framer-motion';

export function TurnIndicator() {
  const { state } = useGameState();

  const isMyTurn = state.currentPlayer === state.mySymbol;

  return (
    <motion.div
      key={state.currentPlayer}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        text-center py-3 mb-4 rounded-lg font-semibold
        ${isMyTurn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
      `}
    >
      {isMyTurn ? "Your turn! Make a move" : "Opponent's turn..."}
    </motion.div>
  );
}
```

---

## Step 6: Create WaitingScreen

Create `components/WaitingScreen.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';

export function WaitingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Waiting for opponent...
      </h2>
      <p className="text-gray-500">
        The game will start when another player joins
      </p>
    </motion.div>
  );
}
```

---

## Step 7: Create GameOverModal

Create `components/GameOverModal.tsx`:

```tsx
'use client';

import { useGameState } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export function GameOverModal() {
  const { state } = useGameState();

  const isWinner = state.winner === state.mySymbol;
  const isDraw = state.status === 'finished' && state.winner === null;

  if (state.status !== 'finished') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="text-6xl mb-4">
            {isDraw ? '🤝' : isWinner ? '🎉' : '😢'}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isDraw
              ? "It's a Draw!"
              : isWinner
              ? 'You Won!'
              : 'You Lost!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isDraw
              ? 'Great game! No winner this time.'
              : isWinner
              ? 'Congratulations on your victory!'
              : 'Better luck next time!'}
          </p>
          <p className="text-sm text-gray-400">
            This window will close automatically...
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Step 8: Create StatusBar

Create `components/StatusBar.tsx`:

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export function StatusBar() {
  const { player } = useAuth();

  if (!player) return null;

  return (
    <div className="text-center text-sm text-gray-500 mb-4">
      Playing as <span className="font-semibold">{player.username}</span>
    </div>
  );
}
```

---

## Step 9: Create LoadingOverlay

Create `components/LoadingOverlay.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/80 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">{message}</p>
      </div>
    </motion.div>
  );
}
```

---

## Step 10: Create Game Page

Update `app/game/[matchId]/page.tsx`:

```tsx
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

  // Clear socket errors after 3 seconds
  useEffect(() => {
    if (socketError) {
      const timer = setTimeout(() => {
        setSocketError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [socketError]);

  // Clear errors when turn changes
  useEffect(() => {
    setSocketError(null);
  }, [state.currentPlayer]);

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
```

---

## Component Hierarchy

```
GamePage
├── Suspense (loading fallback)
└── AuthGuard (authentication wrapper)
    └── GameProvider (game state context)
        └── GameContent
            ├── GameContainer (layout wrapper)
            │   ├── ConnectionStatus
            │   ├── StatusBar
            │   ├── ErrorDisplay
            │   ├── WaitingScreen (if status === 'waiting')
            │   └── [Game UI] (if status !== 'waiting')
            │       ├── PlayerInfo
            │       ├── TurnIndicator
            │       └── GameBoard
            │           └── GameCell (x9)
            └── GameOverModal (if status === 'finished')
```

---

## Verification

After completing this iteration, you should have:
- ✅ GameContainer component
- ✅ GameCell component with animations
- ✅ GameBoard with click handling
- ✅ PlayerInfo showing both players
- ✅ TurnIndicator showing whose turn
- ✅ WaitingScreen for lobby state
- ✅ GameOverModal for game end
- ✅ StatusBar showing player name
- ✅ ErrorDisplay for errors
- ✅ LoadingOverlay component
- ✅ Complete game page

**UI Features:**
- ✅ Responsive design
- ✅ Smooth animations with Framer Motion
- ✅ Visual feedback for turns
- ✅ Win/lose/draw modals
- ✅ Error handling display

**Next:** Proceed to [Iteration 6: Deployment Preparation](./ITERATION_06_DEPLOYMENT.md)

