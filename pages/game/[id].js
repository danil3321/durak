import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function GameRoom() {
  const router = useRouter();
  const { id } = router.query;
  const [game, setGame] = useState(null);
  
  useEffect(() => {
    if (id) {
      const playerId = localStorage.getItem("userId");
  
      fetch("/api/join-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: id, playerId }),
      })
      .then(res => res.json())
      .then(data => {
        console.log("Данные игры после входа:", data);
        setGame(data.game);
      })
      .catch(err => console.error("Ошибка загрузки игры:", err));
    }
  }, [id]);

  if (!game) return <p className="text-white">Загрузка...</p>;
  if (!game.players) return <p className="text-white">Ошибка: данные игры отсутствуют</p>;
  if (!game.players.length) return <p className="text-white">Игроков в комнате нет</p>;

  const playerId = localStorage.getItem("userId");
  const player = game.players.find(p => p.id === playerId);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl">Игра #{game.id}</h1>
      <p>Игроков в комнате: {game.players.length}</p>
      
      <h2 className="text-lg mt-4">Ваши карты:</h2>
      {player ? (
        <div className="flex space-x-2">
          {player.hand.map((card, index) => (
            <div key={index} className="p-2 border rounded">
              {card.value} {card.suit}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-500">Вы не участвуете в игре</p>
      )}
    </div>
  );
}
