import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

let socket; // глобальная переменная для сокета

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  // Установка playerId
  useEffect(() => {
    if (!gameId) return;
    let storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      storedPlayerId = crypto.randomUUID();
      localStorage.setItem('playerId', storedPlayerId);
    }
    setPlayerId(storedPlayerId);
  }, [gameId]);

  // Подключение к Socket.io и обработка события joinGame
  useEffect(() => {
    if (!gameId || !playerId) return;

    if (!socket) {
      socket = io('http://localhost:3000', { path: '/socket.io' });
      console.log('Socket created');
    }

    console.log('Emitting joinGame with', { gameId, playerId });
    socket.emit('joinGame', { gameId, playerId });

    socket.on('gameState', (updatedGame) => {
      console.log('Received gameState:', updatedGame);
      setGameState(updatedGame);
    });

    return () => {
      socket.off('gameState');
    };
  }, [gameId, playerId]);

  if (!gameState) {
    return <div className="text-white p-4">Loading game...</div>;
  }

  const currentPlayer = gameState.players.find((p) => p.id === playerId);

  // Определим, кто сейчас должен ходить: атакующий или защитник
  const isAttacker = gameState.attackerId === playerId;
  const isDefender = gameState.defenderId === playerId;

  // Функция для обработки клика по карте
  const handleCardClick = (card) => {
    console.log('Card clicked:', card);
    if (isAttacker) {
      console.log('Emitting attackCard event');
      socket.emit('attackCard', { gameId, attackerId: playerId, card });
    } else if (isDefender) {
      // Здесь предполагается, что козырная масть известна – можно хранить её в состоянии gameState или передавать статически
      const trumpSuit = gameState.trumpSuit || 'hearts';
      console.log('Emitting defendCard event with trumpSuit:', trumpSuit);
      socket.emit('defendCard', { gameId, defenderId: playerId, card, trumpSuit });
    } else {
      console.log('Not your turn to play.');
    }
  };

  return (
    <div className="bg-black text-white p-4">
      <h1 className="text-xl mb-2">Game #{gameState.id}</h1>
      <p>Status: {gameState.status}</p>
      <p>Players in room: {gameState.players.length}</p>
      <h2 className="text-lg mt-4">Your Cards:</h2>
      <div className="flex space-x-2 mt-2">
        {currentPlayer?.hand?.length ? (
          currentPlayer.hand.map((card, idx) => (
            <button
              key={idx}
              className="border border-white px-2 py-1"
              onClick={() => handleCardClick(card)}
            >
              {card.value} {card.suit}
            </button>
          ))
        ) : (
          <p className="text-gray-400">No cards</p>
        )}
      </div>
      <h2 className="text-lg mt-4">Cards on Table:</h2>
      <div className="flex space-x-2 mt-2">
        {gameState.table?.length ? (
          gameState.table.map((card, idx) => (
            <div key={idx} className="border border-gray-400 px-2 py-1">
              {card.value} {card.suit} (by {card.playedBy})
            </div>
          ))
        ) : (
          <p className="text-gray-400">Table is empty</p>
        )}
      </div>
    </div>
  );
}
