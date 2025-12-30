export interface GamePlayer {
  id: string;
  username: string;
  symbol: 'X' | 'O' | null;
}

export interface GameMatch {
  id: string;
  players: GamePlayer[];
  board: string[][];
  currentPlayer: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null;
}

export interface GameState {
  matchId: string | null;
  players: GamePlayer[];
  board: string[][];
  currentPlayer: 'X' | 'O' | null;
  mySymbol: 'X' | 'O' | null;
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null;
}

