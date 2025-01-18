import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function GamePage() {
  const router = useRouter();
  const { id } = router.query; // Получение ID игры из URL
  const [game, setGame] = useState(null);

  useEffect(() => {
    // Здесь можно загрузить данные игры с сервера, используя `id`
    if (id) {
      console.log(`Loading game with ID: ${id}`);
      setGame({ id, status: 'waiting', players: [] }); // Загрузка мок-данных
    }
  }, [id]);

  if (!id) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mt-4">Game ID: {id}</h1>
      {game && (
        <div className="mt-4">
          <p>Status: {game.status}</p>
          <p>Players: {game.players.length}</p>
        </div>
      )}
    </div>
  );
}
