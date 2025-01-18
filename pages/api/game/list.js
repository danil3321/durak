import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/game");
        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.statusText}`);
        }

        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const joinGame = (gameId) => {
    router.push(`/game/${gameId}`);
  };

  if (loading) {
    return <p className="text-white text-center mt-8">Loading games...</p>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mt-8">Available Games</h1>
      <div className="mt-4 w-3/4">
        {games.length === 0 ? (
          <p className="text-center text-gray-400">No games available</p>
        ) : (
          <ul className="space-y-4">
            {games.map((game) => (
              <li
                key={game.id}
                className="border border-white rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">Game ID: {game.id}</p>
                  <p className="text-sm text-gray-400">Status: {game.status}</p>
                  <p className="text-sm text-gray-400">
                    Players: {game.players.length}
                  </p>
                </div>
                <button
                  onClick={() => joinGame(game.id)}
                  className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
