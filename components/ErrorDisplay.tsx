'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  const show = useMemo(() => !!error, [error]);

  return (
    <AnimatePresence>
      {show && error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
        >
          <p className="font-medium">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
