import { Board, Cell, Player } from '@/types/game';

export const checkWinner = (board: Board): Player | 'draw' | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6], // Diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }

  if (board.every((cell: Cell) => cell !== null)) {
    return 'draw';
  }

  return null;
};

export const getNextPlayer = (currentPlayer: Player): Player => {
  return currentPlayer === 'X' ? 'O' : 'X';
};

export const generateRoomCode = (): string => {
  return Math.random().toString().substring(2, 12);
};