import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const features = [
    {
      title: "Real-time Multiplayer",
      description: "Challenge friends or random players instantly",
      icon: "🎮",
    },
    {
      title: "Stunning Animations",
      description: "Enjoy smooth, responsive gameplay animations",
      icon: "✨",
    },
    {
      title: "Global Rankings",
      description: "Compete for the top spot on our leaderboard",
      icon: "🏆",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <ParticleBackground />
        <div className="relative">
          {/* Hero Section */}
          <motion.section
            className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Challenge the World in TicTacToe!
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl"
              initial={{ y: -30 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Experience the classic game reimagined with modern technology and
              real-time multiplayer
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/play">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Play Now
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
                  Sign Up Free
                </Button>
              </Link>
            </motion.div>
          </motion.section>

          {/* Features Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16">
                Game Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How to Play Section */}
          <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16">
                How to Play
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[1, 2, 3].map((step) => (
                  <motion.div
                    key={step}
                    className="flex flex-col items-center text-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: step * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                      {step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {step === 1
                        ? "Sign Up"
                        : step === 2
                          ? "Find a Match"
                          : "Play & Win"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step === 1
                        ? "Create your account in seconds"
                        : step === 2
                          ? "Challenge friends or random players"
                          : "Make your moves and claim victory"}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
