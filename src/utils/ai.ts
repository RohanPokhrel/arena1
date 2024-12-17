import { Board, Cell, Player } from '@/types/game';
import { checkWinner } from './game';

// Minimax algorithm for AI moves
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  player: Player,
  opponent: Player
): number {
  const winner = checkWinner(board);
  
  if (winner === player) return 10 - depth;
  if (winner === opponent) return depth - 10;
  if (winner === 'draw') return 0;

  const scores = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = isMaximizing ? player : opponent;
      scores.push(minimax(board, depth + 1, !isMaximizing, player, opponent));
      board[i] = null;
    }
  }

  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

export const getAIMove = (board: Board, aiPlayer: Player): number => {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let bestMove = 0;

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer, opponent);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
};

// Get a random valid move for random multiplayer
export const getRandomMove = (board: Board): number => {
  const availableMoves = board
    .map((cell, index) => (!cell ? index : -1))
    .filter(index => index !== -1);
    
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}; 