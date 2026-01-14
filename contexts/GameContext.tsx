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


