import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

let socket; // Глобальная переменная для сокета

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  // Устанавливаем playerId, используя localStorage
  useEffect(() => {
    if (!gameId) return;
    const storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      const newId = crypto.randomUUID(); // генерируем новый идентификатор
      localStorage.setItem('playerId', newId);
      setPlayerId(newId);
      console.log('Generated new playerId:', newId);
    } else {
      setPlayerId(storedPlayerId);
      console.log('Using stored playerId:', storedPlayerId);
    }
  }, [gameId]);

  // Подключаемся к сокету и отправляем событие joinGame
  useEffect(() => {
    if (!gameId || !playerId) return;
    
    // Создаем сокет, если его ещё нет
    if (!socket) {
      // Если сервер запущен на том же домене/порту, URL можно не указывать
      socket = io({ path: '/socket.io' });
      console.log('Socket created:', socket.id);
    }

    console.log('Emitting joinGame with', { gameId, playerId });
    socket.emit('joinGame', { gameId, playerId });

    socket.on('gameState', (updatedGame) => {
      console.log('Received gameState:', updatedGame);
      setGameState(updatedGame);
    });

    // Очистка при размонтировании
    return () => {
      socket.off('gameState');
    };
  }, [gameId, playerId]);

  if (!gameId) {
    return <div className="text-white p-4">Нет идентификатора игры.</div>;
  }

  if (!gameState) {
    return <div className="text-white p-4">Loading game...</div>;
  }

  // Находим текущего игрока по playerId
  const currentPlayer = gameState.players.find((p) => p.id === playerId);

  return (
    <div className="text-white p-4 bg-black">
      <h1 className="text-xl mb-2">Игра #{gameState.id}</h1>
      <p>Статус: {gameState.status}</p>
      <p>Количество игроков: {gameState.players.length}</p>

      <h2 className="text-lg mt-4">Ваши карты:</h2>
      <div className="flex space-x-2 mt-2">
        {currentPlayer?.hand?.length ? (
          currentPlayer.hand.map((card, idx) => (
            <button
              key={idx}
              className="border border-white px-2 py-1"
              onClick={() => {
                console.log('Playing card:', card);
                socket.emit('playCard', { gameId, playerId, card });
              }}
            >
              {card.value} {card.suit}
            </button>
          ))
        ) : (
          <p className="text-gray-400">Нет карт</p>
        )}
      </div>

      <h2 className="text-lg mt-4">Карты на столе:</h2>
      <div className="flex space-x-2 mt-2">
        {gameState.table?.length ? (
          gameState.table.map((card, idx) => (
            <div key={idx} className="border border-gray-400 px-2 py-1">
              {card.value} {card.suit} (by {card.playedBy})
            </div>
          ))
        ) : (
          <p className="text-gray-400">Стол пуст</p>
        )}
      </div>
    </div>
  );
}
