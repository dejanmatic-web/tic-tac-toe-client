# Iteration 1: Project Setup & Configuration

This iteration covers setting up the Next.js project, installing dependencies, and configuring the development environment.

---

## Step 1: Create Next.js Project

In your terminal, run:

```bash
npx create-next-app@latest tic-tac-toe-client --typescript --tailwind --app --eslint
cd tic-tac-toe-client
```

When prompted:
- **TypeScript:** Yes
- **ESLint:** Yes
- **Tailwind CSS:** Yes
- **`src/` directory:** No
- **App Router:** Yes
- **Import alias:** Yes (default @/*)

---

## Step 2: Install Additional Dependencies

Install Socket.io client and Framer Motion for animations:

```bash
# Socket.io client for real-time communication
npm install socket.io-client

# Framer Motion for smooth animations
npm install framer-motion
```

---

## Step 3: Create Project Structure

Create the following directory structure:

```
tic-tac-toe-client/
├── app/
│   ├── game/
│   │   └── [matchId]/
│   │       └── page.tsx     # Dynamic game page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── AuthGuard.tsx
│   ├── ConnectionStatus.tsx
│   ├── ErrorDisplay.tsx
│   ├── GameBoard.tsx
│   ├── GameCell.tsx
│   ├── GameContainer.tsx
│   ├── GameOverModal.tsx
│   ├── LoadingOverlay.tsx
│   ├── PlayerInfo.tsx
│   ├── StatusBar.tsx
│   ├── TurnIndicator.tsx
│   └── WaitingScreen.tsx
├── contexts/                # React contexts
│   └── GameContext.tsx
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   └── useSocket.ts
├── lib/                     # Utility libraries
│   └── socket.ts
├── types/                   # TypeScript types
│   └── game.ts
├── .env.local               # Local environment variables
├── .env.example             # Example environment file
├── next.config.ts
├── package.json
└── tsconfig.json
```

**In Cursor:**
1. Create the `components` directory
2. Create the `contexts` directory
3. Create the `hooks` directory
4. Create the `lib` directory
5. Create the `types` directory
6. Create `app/game/[matchId]` directory

---

## Step 4: Configure Environment Variables

Create `.env.example`:

```env
# Socket.io Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

Create `.env.local` (don't commit this file):

```env
# Socket.io Server URL - points to your game server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

**Note:** The `NEXT_PUBLIC_` prefix makes the variable available in the browser.

---

## Step 5: Create Type Definitions

Create `types/game.ts`:

```typescript
export interface GamePlayer {
  id: string;
  username: string;
  symbol: 'X' | 'O' | null;
}

export interface GameMatch {
  id: string;
  players: GamePlayer[];
  board: string[][];
  currentPlayer: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null;
}

export interface GameState {
  matchId: string | null;
  players: GamePlayer[];
  board: string[][];
  currentPlayer: 'X' | 'O' | null;
  mySymbol: 'X' | 'O' | null;
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null;
}
```

---

## Step 6: Update package.json Scripts

Verify the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -H 0.0.0.0",
    "lint": "eslint"
  }
}
```

Also add an `engines` field to specify Node.js version:

```json
{
  "engines": {
    "node": ">=20.9.0"
  }
}
```

---

## Step 7: Update .gitignore

Ensure `.gitignore` includes:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

## Step 8: Create Landing Page

Update `app/page.tsx`:

```tsx
'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if we have game params - redirect to game page
    const matchId = searchParams.get('matchId');
    const token = searchParams.get('token') || searchParams.get('matchToken');

    if (matchId && token) {
      // Redirect to game page with all params preserved
      const params = new URLSearchParams();
      params.set('matchId', matchId);
      params.set('token', token);
      router.replace(`/game/${matchId}?${params.toString()}`);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Tic-Tac-Toe
        </h1>
        <div className="text-6xl mb-6">🎮</div>
        <p className="text-gray-600 mb-6">
          This is a multiplayer Tic-Tac-Toe game server for the GamerStake platform.
        </p>
        <div className="bg-gray-100 rounded-lg p-4 text-left">
          <p className="text-sm text-gray-500 mb-2">
            <strong>How to play:</strong>
          </p>
          <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
            <li>Join a game lobby on GamerStake</li>
            <li>Wait for matchmaking</li>
            <li>You&apos;ll be redirected here automatically</li>
            <li>Play and have fun!</li>
          </ol>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Game Server Status: Online ✅
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
```

---

## Verification

After completing this iteration, you should have:
- ✅ Next.js project initialized
- ✅ All dependencies installed
- ✅ Project structure created
- ✅ TypeScript types defined
- ✅ Environment files set up
- ✅ Landing page created

**Test the setup:**

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the landing page.

**Next:** Proceed to [Iteration 2: Socket Client Integration](./ITERATION_02_SOCKET_CLIENT.md)

