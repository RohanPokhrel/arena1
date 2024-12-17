import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="text-4xl font-bold mb-6">About TicTacToe</h1>
      <div className="prose dark:prose-invert">
        <p className="text-lg mb-4">
          Welcome to TicTacToe, where classic gameplay meets modern technology. Our platform
          offers an engaging multiplayer experience with real-time matches, tournaments,
          and a vibrant community.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="mb-4">
          We aim to create the most enjoyable and competitive TicTacToe experience online,
          bringing players together from around the world.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Real-time multiplayer matches</li>
          <li>Global leaderboard</li>
          <li>Tournament system</li>
          <li>Achievement system</li>
          <li>Community events</li>
        </ul>
      </div>
    </motion.div>
  );
}