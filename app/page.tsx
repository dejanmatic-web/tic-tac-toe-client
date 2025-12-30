export default function Home() {
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
