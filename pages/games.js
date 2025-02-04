import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Games() {
  const [games, setGames] = useState([]); // ✅ Хранение списка игр
  const router = useRouter();

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch(err => console.error("Ошибка загрузки игр:", err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl mb-4">Доступные игры</h1>
      <ul>
        {games.map((game) => (
          <li key={game.id} className="mb-2">
            <button
              className="w-full p-2 bg-gray-700 rounded"
              onClick={() => router.push(`/game/${game.id}`)}
            >
              Игра #{game.id} (Игроков: {game.players.length})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
