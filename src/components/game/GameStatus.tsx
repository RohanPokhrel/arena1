import { motion } from 'framer-motion';
import { Player } from '@/types/game';
import { FaTrophy, FaHandshake } from 'react-icons/fa';

interface GameStatusProps {
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  isGameOver: boolean;
}

export const GameStatus = ({ currentPlayer, winner, isGameOver }: GameStatusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center mb-6"
    >
      {isGameOver ? (
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            {winner === 'draw' ? (
              "It's a draw!"
            ) : (
              `Player ${winner} wins!`
            )}
          </motion.h2>
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`text-2xl ${winner === 'draw' ? 'text-gray-400' : 'text-yellow-500'}`}
          >
            {winner === 'draw' ? <FaHandshake /> : <FaTrophy />}
          </motion.div>
        </motion.div>
      ) : (
        <motion.h2 
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          className="text-2xl font-bold"
        >
          <span className="text-gray-400">Player </span>
          <span className={`font-bold ${
            currentPlayer === 'X' ? 'text-blue-400' : 'text-purple-400'
          }`}>
            {currentPlayer}
          </span>
          <span className="text-gray-400">'s turn</span>
        </motion.h2>
      )}
    </motion.div>
  );
};