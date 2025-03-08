// pages/games.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function GamesPage() {
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch('/api/game');
        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.statusText}`);
        }
        const data = await response.json();
        setGamesList(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const joinGame = (gameId) => {
    router.push(`/game/${gameId}`);
  };

  if (loading) {
    return <div className="text-white text-center mt-8">Loading games...</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mt-8">Available Games</h1>
      {gamesList.length === 0 ? (
        <p className="text-gray-400 mt-4">No games available</p>
      ) : (
        <ul className="mt-4 w-full max-w-md space-y-4">
          {gamesList.map((game) => (
            <li
              key={game.id}
              className="border border-white rounded p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">Game ID: {game.id}</p>
                <p className="text-sm text-gray-400">Status: {game.status}</p>
                <p className="text-sm text-gray-400">
                  Players: {game.players ? game.players.length : 0}
                </p>
              </div>
              <button
                onClick={() => joinGame(game.id)}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
