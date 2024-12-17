import { motion } from 'framer-motion';

const players = [
  { rank: 1, name: 'Player1', wins: 150, losses: 20, winRate: '88.2%' },
  { rank: 2, name: 'Player2', wins: 140, losses: 25, winRate: '84.8%' },
  { rank: 3, name: 'Player3', wins: 130, losses: 30, winRate: '81.2%' },
];

export default function Leaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-4xl font-bold mb-8">Global Leaderboard</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Wins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Losses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Win Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {players.map((player) => (
              <tr key={player.rank}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-semibold">{player.rank}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{player.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-600">{player.wins}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-red-600">{player.losses}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{player.winRate}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}