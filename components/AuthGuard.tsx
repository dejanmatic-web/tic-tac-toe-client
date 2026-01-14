'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { player, isAuthenticating, authError } = useAuth();

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700">{authError}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticating || !player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}



