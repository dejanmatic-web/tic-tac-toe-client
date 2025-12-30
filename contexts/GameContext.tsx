'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
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

  useEffect(() => {
    if (!socket) return;

    const onMatchStarted = (data: { matchId: string; players: GamePlayer[]; currentPlayer: 'X' | 'O' }) => {
      dispatch({ type: 'MATCH_STARTED', payload: data });
      const myPlayer = data.players.find((p) => p.id === playerId);
      if (myPlayer?.symbol) {
        dispatch({ type: 'SET_MY_SYMBOL', payload: { symbol: myPlayer.symbol } });
      }
    };

    const onGameState = (data: { board: string[][]; currentPlayer: 'X' | 'O'; players: GamePlayer[] }) => {
      dispatch({ type: 'GAME_STATE', payload: data });
      const myPlayer = data.players.find((p) => p.id === playerId);
      if (myPlayer?.symbol) {
        dispatch({ type: 'SET_MY_SYMBOL', payload: { symbol: myPlayer.symbol } });
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
  }, [socket, playerId]);

  const makeMove = (row: number, col: number) => {
    if (!socket || state.status !== 'playing' || state.currentPlayer !== state.mySymbol) {
      return;
    }
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


