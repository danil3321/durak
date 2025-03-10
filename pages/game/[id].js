import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

let socket;

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  // Для защиты: выбранная карта защитника и индекс атакующей пары, которую он хочет отбить.
  const [selectedDefenseCard, setSelectedDefenseCard] = useState(null);
  const [selectedAttackIndex, setSelectedAttackIndex] = useState(null);

  // Устанавливаем playerId из localStorage или генерируем новый.
  useEffect(() => {
    if (!gameId) return;
    let stored = localStorage.getItem('playerId');
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem('playerId', stored);
      console.log('Generated new playerId:', stored);
    } else {
      console.log('Using stored playerId:', stored);
    }
    setPlayerId(stored);
  }, [gameId]);

  // Подключаемся к Socket.io и отправляем joinGame.
  useEffect(() => {
    if (!gameId || !playerId) return;
    if (!socket) {
      socket = io('http://localhost:3000', { path: '/socket.io' });
      console.log('Socket created:', socket.id);
    }
    console.log('Emitting joinGame with:', { gameId, playerId });
    socket.emit('joinGame', { gameId, playerId });
    socket.on('gameState', (updatedGame) => {
      console.log('Received gameState:', updatedGame);
      setGameState(updatedGame);
    });
    socket.on('errorMessage', (msg) => {
      console.error('Error:', msg);
    });
    return () => {
      socket.off('gameState');
      socket.off('errorMessage');
    };
  }, [gameId, playerId]);

  // Если защитник выбрал свою карту и индекс атаки, отправляем событие defendCard.
  useEffect(() => {
    if (selectedDefenseCard && selectedAttackIndex !== null && gameState && gameState.defenderId === playerId) {
      const trumpSuit = gameState.trumpSuit || 'hearts';
      console.log('Emitting defendCard with:', {
        gameId,
        defenderId: playerId,
        defenseCard: selectedDefenseCard,
        attackIndex: selectedAttackIndex,
        trumpSuit,
      });
      socket.emit('defendCard', {
        gameId,
        defenderId: playerId,
        defenseCard: selectedDefenseCard,
        attackIndex: selectedAttackIndex,
        trumpSuit,
      });
      setSelectedDefenseCard(null);
      setSelectedAttackIndex(null);
    }
  }, [selectedDefenseCard, selectedAttackIndex, gameState, playerId, gameId]);

  if (!gameState) {
    return <div className="bg-black text-white p-4">Loading game...</div>;
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isAttacker = gameState.attackerId === playerId;
  const isDefender = gameState.defenderId === playerId;

  // Обработчик для атакующего: при клике на карту отправляем событие attackCard.
  const handleAttackCardClick = (card) => {
    console.log('Attacker clicked card:', card);
    socket.emit('attackCard', { gameId, attackerId: playerId, card });
  };

  // Обработчик для защитника: при клике на свою карту выбираем её для защиты.
  const handleDefenseCardClick = (card) => {
    console.log('Defender selected defense card:', card);
    setSelectedDefenseCard(card);
  };

  // Обработчик для защитника: при клике на атакующую карту на столе выбираем индекс атаки, которую хотим отбить.
  const handleAttackSelection = (index) => {
    console.log('Defender selected attack index:', index);
    setSelectedAttackIndex(index);
  };

  // Обработка события "takeCards"
  const handleTakeCards = () => {
    console.log('Defender chooses to take cards');
    socket.emit('takeCards', { gameId, defenderId: playerId });
  };

  // Обработка события "bito"
  const handleBito = () => {
    console.log('Attacker declares bito');
    socket.emit('bito', { gameId, attackerId: playerId });
  };

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <h1 className="text-xl mb-2">Game #{gameState.id}</h1>
      <p>Status: {gameState.status}</p>
      <p>Attacker: {gameState.attackerId}</p>
      <p>Defender: {gameState.defenderId}</p>
      <p>Players: {gameState.players.length}</p>
      <p>Cards left in deck: {gameState.deck.length}</p>
      {gameState.trumpCard && (
        <p>Trump: {gameState.trumpCard.value} {gameState.trumpCard.suit}</p>
      )}

      <h2 className="text-lg mt-4">Your Cards:</h2>
      <div className="flex space-x-2 mt-2">
        {currentPlayer && currentPlayer.hand && currentPlayer.hand.length > 0 ? (
          currentPlayer.hand.map((card, idx) => (
            <button
              key={idx}
              className="border border-white px-2 py-1"
              onClick={() => {
                if (isAttacker) {
                  handleAttackCardClick(card);
                } else if (isDefender) {
                  handleDefenseCardClick(card);
                } else {
                  console.log('Not your turn');
                }
              }}
            >
              {card.value} {card.suit}
            </button>
          ))
        ) : (
          <p className="text-gray-400">No cards</p>
        )}
      </div>

      <h2 className="text-lg mt-4">Cards on Table:</h2>
      <div className="flex flex-wrap gap-2 mt-2">
        {gameState.table && gameState.table.length > 0 ? (
          gameState.table.map((pair, index) => (
            <div key={index} className="border border-gray-400 p-2">
              <div
                className={`cursor-pointer ${isDefender && pair.defense === null ? 'hover:bg-gray-700' : ''}`}
                onClick={() => {
                  if (isDefender && pair.defense === null) {
                    handleAttackSelection(index);
                  }
                }}
              >
                <strong>Attack:</strong> {pair.attack.value} {pair.attack.suit}
              </div>
              <div>
                <strong>Defense:</strong>{' '}
                {pair.defense ? `${pair.defense.value} ${pair.defense.suit}` : 'Not defended'}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Table is empty</p>
        )}
      </div>

      {isDefender && gameState.table && gameState.table.length > 0 && (
        <button
          onClick={handleTakeCards}
          className="mt-4 px-4 py-2 bg-red-600 rounded"
        >
          Take Cards
        </button>
      )}

      {isAttacker && gameState.table && gameState.table.length > 0 && (
        <button
          onClick={handleBito}
          className="mt-4 px-4 py-2 bg-green-600 rounded"
        >
          Bito
        </button>
      )}
    </div>
  );
}
