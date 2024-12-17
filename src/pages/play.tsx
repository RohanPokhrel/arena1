import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Board } from '@/components/game/Board';
import { GameStatus } from '@/components/game/GameStatus';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';
import { FaUserFriends, FaRobot, FaArrowLeft, FaHome } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { useRouter } from 'next/router';
import { generateRoomCode } from '@/utils/game';

export default function Play() {
  const { board, currentPlayer, winner, isGameOver, makeMove, resetGame, setGameMode, gameMode } = useGameStore();
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showBazziModal, setShowBazziModal] = useState(false);
  const [bazziAmount, setBazziAmount] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const router = useRouter();

  const handleModeSelect = (mode: 'ai' | 'local' | 'multiplayer') => {
    if (mode === 'multiplayer') {
      setShowMultiplayerModal(true);
      return;
    }
    setGameMode(mode);
    setShowModeSelect(false);
    resetGame();
  };

  const handleBackToModes = () => {
    setShowModeSelect(true);
    resetGame();
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleMultiplayerSelect = (type: 'free' | 'paid') => {
    if (type === 'paid') {
      setShowBazziModal(true);
      return;
    }
    setShowMultiplayerModal(false);
    setGameMode('multiplayer');
    setShowModeSelect(false);
    resetGame();
  };

  const handleCreateRoom = () => {
    setIsCreatingRoom(true);
    const roomCode = generateRoomCode();
    console.log('Room created with code:', roomCode);
    setIsCreatingRoom(false);
    setShowBazziModal(false);
    setShowMultiplayerModal(false);
    setGameMode('multiplayer');
    setShowModeSelect(false);
    resetGame();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        {showModeSelect ? (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100"
            >
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleHomeClick}
                  variant="secondary"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
                >
                  <FaHome className="w-4 h-4" />
                  <span className="font-medium">Home</span>
                </Button>
              </div>
              
              <div className="text-center mb-8">
                <motion.h2 
                  className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-3"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Choose Game Mode
                  <span className="inline-block ml-2 text-[#7C3AED]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                  </span>
                </motion.h2>
                <motion.p 
                  className="text-gray-600"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Select how you want to play
                </motion.p>
              </div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSelect('ai')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    <FaRobot className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Play vs AI</h3>
                    <p className="text-sm text-blue-100">Challenge our intelligent AI opponent</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSelect('local')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    <FaUserFriends className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Local Multiplayer</h3>
                    <p className="text-sm text-green-100">Play with a friend on the same device</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSelect('multiplayer')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    <GiPerspectiveDiceSixFacesRandom className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Online Multiplayer</h3>
                    <p className="text-sm text-purple-100">Play online with players worldwide</p>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="game-board"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100"
            >
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handleBackToModes}
                    variant="secondary"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back</span>
                  </Button>

                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-100">
                    <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {gameMode === 'ai' ? 'VS AI' : 
                       gameMode === 'local' ? 'Local Game' : 
                       'Online Game'}
                    </span>
                  </div>

                  <Button
                    onClick={handleHomeClick}
                    variant="secondary"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4"
                  >
                    <FaHome className="w-4 h-4" />
                    <span className="font-medium">Home</span>
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-inner"
              >
                <GameStatus
                  currentPlayer={currentPlayer}
                  winner={winner}
                  isGameOver={isGameOver}
                />
                
                <Board
                  board={board}
                  onCellClick={makeMove}
                  disabled={isGameOver}
                />
                
                {isGameOver && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex justify-center"
                  >
                    <Button 
                      onClick={resetGame}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg transform transition-all hover:scale-105"
                    >
                      Play Again
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {showMultiplayerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Choose Game Type
                </h3>
                <Button
                  onClick={() => setShowMultiplayerModal(false)}
                  variant="secondary"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IoClose className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMultiplayerSelect('free')}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    🎮
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xl mb-1">Play for Free</h3>
                    <p className="text-sm text-blue-100">Enjoy casual matches with players worldwide</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMultiplayerSelect('paid')}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xl mb-1">Play with Bazzi</h3>
                    <p className="text-sm text-yellow-100">Compete for rewards in ranked matches</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showBazziModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h3 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent"
                >
                  Enter Bazzi Amount
                </motion.h3>
                <Button
                  onClick={() => setShowBazziModal(false)}
                  variant="secondary"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <IoClose className="w-6 h-6" />
                </Button>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (in Bazzi)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bazziAmount}
                      onChange={(e) => setBazziAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="Enter amount"
                      min="1"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500">
                      💰
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRoom}
                  disabled={!bazziAmount || isCreatingRoom}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isCreatingRoom ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Creating Room...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Room</span>
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          🎮
                        </motion.span>
                      </>
                    )}
                  </div>
                </motion.button>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  A room code will be generated for your opponent to join
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}