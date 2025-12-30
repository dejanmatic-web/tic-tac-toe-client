'use client';

import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';

export function ConnectionStatus() {
  const { isConnected } = useSocket();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-4 right-4 z-10"
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium ${
          isConnected
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        <motion.div
          animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </motion.div>
  );
}

