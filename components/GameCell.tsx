'use client';

import { motion } from 'framer-motion';

interface GameCellProps {
  value: string;
  onClick: () => void;
  disabled: boolean;
}

export function GameCell({ value, onClick, disabled }: GameCellProps) {
  return (
    <motion.button
      initial={{ scale: 1 }}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square w-full rounded-lg font-bold text-4xl
        transition-colors duration-200
        ${value === 'X' ? 'text-red-500' : value === 'O' ? 'text-blue-500' : 'text-gray-400'}
        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:bg-gray-50 cursor-pointer'}
        ${value ? '' : 'hover:bg-gray-50'}
      `}
    >
      {value && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
}
