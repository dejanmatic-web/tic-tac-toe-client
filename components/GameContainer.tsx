'use client';

import { ReactNode } from 'react';

interface GameContainerProps {
  children: ReactNode;
}

export function GameContainer({ children }: GameContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-6">
          Tic-Tac-Toe
        </h1>
        {children}
      </div>
    </div>
  );
}

