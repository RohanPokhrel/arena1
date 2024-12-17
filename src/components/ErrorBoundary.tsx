import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800"
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Something went wrong
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-300 mb-8 text-center"
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium"
          >
            Refresh Page
          </motion.button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 