import { create } from 'zustand';
import { Player, Cell, Board } from '@/types/game';
import { checkWinner, getNextPlayer } from '@/utils/game';
import { getAIMove, getRandomMove } from '@/utils/ai';

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  isGameOver: boolean;
  gameMode: 'ai' | 'local' | 'multiplayer' | null;
}

interface GameStore extends GameState {
  isProcessing: boolean;
  makeMove: (index: number) => void;
  setGameMode: (mode: 'ai' | 'local' | 'multiplayer' | null) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  isGameOver: false,
  gameMode: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  gameMode: null,
  isProcessing: false,
  
  setGameMode: (mode) => set({ gameMode: mode }),
  
  makeMove: (index: number) => {
    const state = get();
    if (state.isProcessing || state.board[index] || state.isGameOver) return;
    if (state.gameMode === 'ai' && state.currentPlayer === 'O') return;

    set({ isProcessing: true });

    set(state => {
      const newBoard = [...state.board];
      newBoard[index] = state.currentPlayer;

      const winner = checkWinner(newBoard);
      const isGameOver = winner !== null;

      if (state.gameMode === 'ai' && !isGameOver) {
        setTimeout(() => {
          const aiMove = getAIMove([...newBoard], 'O');
          if (typeof aiMove === 'number' && !newBoard[aiMove]) {
            newBoard[aiMove] = 'O';
          }
          set({ 
            board: newBoard,
            currentPlayer: 'X',
            winner: checkWinner(newBoard),
            isGameOver: checkWinner(newBoard) !== null,
            isProcessing: false 
          });
        }, 500);

        return {
          ...state,
          board: newBoard,
          currentPlayer: 'O',
          winner,
          isGameOver,
        };
      }

      set({ isProcessing: false });
      return {
        ...state,
        board: newBoard,
        currentPlayer: getNextPlayer(state.currentPlayer),
        winner,
        isGameOver,
      };
    });
  },

  resetGame: () => set({ ...initialState, gameMode: get().gameMode, isProcessing: false }),
}));