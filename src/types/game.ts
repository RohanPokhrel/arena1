export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  isGameOver: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  stats: {
    wins: number;
    losses: number;
    draws: number;
  };
}

export interface GameRoom {
  id: string;
  players: {
    X: string | null;
    O: string | null;
  };
  gameState: GameState;
  createdAt: number;
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null;
}