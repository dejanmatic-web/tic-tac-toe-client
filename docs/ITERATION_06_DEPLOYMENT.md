# Iteration 6: Deployment Preparation

This iteration covers preparing the frontend for deployment to Railway, including build configuration and deployment files.

---

## Step 1: Update Next.js Configuration

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using regular Next.js server (not standalone)
  // Railway handles the deployment automatically
};

export default nextConfig;
```

**Note:** For Railway deployment, we don't need standalone mode as Railway's Nixpacks builder handles Next.js properly.

---

## Step 2: Create Railway Configuration

Create `railway.json` in the root directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Step 3: Create Procfile

Create `Procfile` in the root directory:

```
web: npm start
```

---

## Step 4: Create Nixpacks Configuration (Optional)

Create `nixpacks.toml` for explicit Node.js version:

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

---

## Step 5: Update package.json

Ensure your `package.json` has proper configuration:

```json
{
  "name": "tic-tac-toe-client",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -H 0.0.0.0",
    "lint": "eslint"
  }
}
```

**Key Points:**
- `engines.node` specifies minimum Node.js version
- `start` command uses `-H 0.0.0.0` to bind to all interfaces (required for Railway)

---

## Step 6: Create README.md

Create `README.md` in the root directory:

```markdown
# Tic-Tac-Toe Game Client

A multiplayer Tic-Tac-Toe game client built with Next.js, TypeScript, and Socket.io for the GamerStake platform.

## Features

- Real-time multiplayer gameplay
- Beautiful animated UI with Framer Motion
- Responsive design
- Socket.io connection to game server
- JWT authentication via platform

## Prerequisites

- Node.js 20+
- npm or yarn
- Backend server running

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your backend URL

## Development

Run the development server:
```bash
npm run dev
```

The client will start on `http://localhost:3000`

## Building

Build for production:
```bash
npm run build
```

## Production

Start the production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.io server URL | `http://localhost:3000` |

## Deployment

This project is configured for deployment on Railway.

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically build and deploy

### Required Environment Variables (Production)

- `NEXT_PUBLIC_SOCKET_URL`: Your backend server URL (e.g., `https://your-backend.up.railway.app`)
- `PORT`: Railway sets this automatically

## Project Structure

```
tic-tac-toe-client/
├── app/                  # Next.js app router pages
│   ├── game/[matchId]/   # Dynamic game page
│   ├── page.tsx          # Landing page
│   └── layout.tsx        # Root layout
├── components/           # React components
├── contexts/             # React contexts (GameContext)
├── hooks/                # Custom hooks (useAuth, useSocket)
├── lib/                  # Utility libraries (socket client)
└── types/                # TypeScript type definitions
```

## License

MIT
```

---

## Step 7: Verify Build Process

Test the build locally:

```bash
npm run build
```

You should see:
- Build completes without errors
- `.next/` directory created
- Static pages generated

Test the production build:

```bash
npm start
```

Visit `http://localhost:3000` to verify it works.

---

## Step 8: Update .gitignore

Ensure `.gitignore` is complete:

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

## Step 9: Environment Variables Summary

### Development (`.env.local`)

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Production (Railway Dashboard)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-backend.up.railway.app` | Backend server URL |
| `PORT` | (auto-set) | Railway sets automatically |
| `NODE_ENV` | `production` | (auto-set by Railway) |

---

## Deployment Checklist

Before deploying to Railway:

- [ ] All code committed to Git
- [ ] `.env.local` is in `.gitignore`
- [ ] `npm run build` completes successfully
- [ ] `npm start` runs without errors
- [ ] All environment variables documented
- [ ] README.md is complete
- [ ] TypeScript compiles without errors
- [ ] Backend is deployed and URL is known

---

## Railway Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your `tic-tac-toe-client` repository

### 3. Configure Build

Railway auto-detects Next.js. Verify settings:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 4. Set Environment Variables

In Railway Dashboard → Variables:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend.up.railway.app
```

### 5. Deploy

Railway automatically deploys on push.

### 6. Get Frontend URL

After deployment:
```
https://tic-tac-toe-client-production.up.railway.app
```

### 7. Update Backend CORS

Go to backend service and update:
```env
CORS_ORIGIN=https://tic-tac-toe-client-production.up.railway.app
```

### 8. Update Platform Admin

Set game server URL in admin panel to your frontend URL:
```
https://tic-tac-toe-client-production.up.railway.app/game
```

---

## Verification

After completing this iteration, you should have:
- ✅ Build process working
- ✅ Production build tested
- ✅ Railway configuration created
- ✅ Procfile created
- ✅ README.md complete
- ✅ Environment variables documented

---

## Testing Deployed Application

### 1. Test Landing Page

Visit:
```
https://your-frontend.up.railway.app
```

Should show the landing page.

### 2. Test Game Flow

1. Create a test match in the platform
2. Join with two players
3. Both should be redirected to game page
4. Game should authenticate and play

### 3. Check Browser Console

- No CORS errors
- Socket connected
- Authentication successful

---

## Troubleshooting

### Build Fails

- Check Railway build logs
- Verify all dependencies in `package.json`
- Ensure Next.js builds locally first

### Socket Connection Fails

- Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check backend CORS settings
- Ensure backend is running

### Authentication Fails

- Check token is being passed in URL
- Verify backend SDK configuration
- Check browser console for errors

### Page Not Loading

- Check deployment logs
- Verify start command
- Ensure PORT is not hardcoded

---

**Congratulations!** Your Tic-Tac-Toe client is ready for deployment! 🎮

Remember to deploy the backend first, then the frontend, and finally update the admin panel with the frontend URL.


