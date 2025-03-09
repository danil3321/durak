require('dotenv').config();
const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

// Импорт глобального хранилища игр (CommonJS)
const { games } = require('./data/gameStore');
// Импорт базовой логики игры (мы используем только canBeat для проверки защиты в этом примере)
const {
  canBeat,
  // processAttack и processDefense мы адаптируем здесь inline для более гибкой логики
  initializeTurnOrder,
  determineNextTurn,
} = require('./lib/gameLogic');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * Функция для создания колоды карт.
 */
function createDeck() {
  const suits = ['diamonds', 'hearts', 'clubs', 'spades'];
  const values = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ suit, value });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
}

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Инициализация Socket.io
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Обработка подключения игрока
    socket.on('joinGame', ({ gameId, playerId }) => {
      console.log('joinGame received:', { gameId, playerId });
      socket.join(gameId);

      // Если игра не существует, создаем ее
      if (!games[gameId]) {
        games[gameId] = {
          id: gameId,
          createdAt: new Date().toISOString(),
          deck: createDeck(),
          players: [],
          table: [], // Каждый элемент: { attack: {suit, value}, defense: {suit, value} || null, attackerId }
          status: 'waiting',
          trumpSuit: 'hearts', // Пример; можно динамически определять
        };
        console.log(`Game ${gameId} created`);
      }

      // Если игрока еще нет, добавляем его
      const alreadyJoined = games[gameId].players.some(p => p.id === playerId);
      if (!alreadyJoined) {
        games[gameId].players.push({ id: playerId, hand: [] });
        console.log(`Player ${playerId} added to game ${gameId}`);
      }

      // Если два игрока и игра в состоянии "waiting", раздаем карты и устанавливаем порядок ходов
      if (games[gameId].players.length === 2 && games[gameId].status === 'waiting') {
        const deck = games[gameId].deck;
        games[gameId].players.forEach(player => {
          player.hand = deck.splice(0, 6);
        });
        games[gameId].status = 'in-progress';
        initializeTurnOrder(games[gameId]); // Устанавливает поля attackerId и defenderId
        console.log(`Game ${gameId} in-progress. Attacker: ${games[gameId].attackerId}, Defender: ${games[gameId].defenderId}`);
      }

      console.log('Current game state:', games[gameId]);
      io.to(gameId).emit('gameState', games[gameId]);
    });

    // Событие атаки. Атакующий может подкидывать карту, если стол пуст или если номинал совпадает.
    socket.on('attackCard', ({ gameId, attackerId, card }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (attackerId !== game.attackerId) return socket.emit('errorMessage', 'Not your turn to attack');

      const attacker = game.players.find(p => p.id === attackerId);
      if (!attacker) return socket.emit('errorMessage', 'Attacker not found');
      const index = attacker.hand.findIndex(c => c.suit === card.suit && c.value === card.value);
      if (index === -1) return socket.emit('errorMessage', 'Card not found in hand');
      // Проверяем условие дополнительного подкидывания: если стол не пуст, номинал карты должен совпадать с одним из атакующих карт на столе
      if (game.table.length > 0) {
        const validValues = game.table.map(pair => pair.attack.value);
        if (!validValues.includes(card.value)) {
          return socket.emit('errorMessage', 'Attack card value must match one of the existing attack cards on table');
        }
      }
      // Удаляем карту из руки
      attacker.hand.splice(index, 1);
      // Добавляем новую атаку в виде пары { attack: card, defense: null, attackerId }
      game.table.push({ attack: card, defense: null, attackerId });
      console.log(`Attack: ${card.value} ${card.suit} by ${attackerId}`);
      io.to(gameId).emit('gameState', game);
    });

    // Событие защиты.
    // Защитник сначала выбирает свою карту, затем указывает индекс атаки, которую он хочет отбить.
    socket.on('defendCard', ({ gameId, defenderId, defenseCard, attackIndex, trumpSuit }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (defenderId !== game.defenderId) return socket.emit('errorMessage', 'Not your turn to defend');

      if (attackIndex < 0 || attackIndex >= game.table.length) {
        return socket.emit('errorMessage', 'Invalid attack index');
      }
      const attackPair = game.table[attackIndex];
      if (attackPair.defense !== null) {
        return socket.emit('errorMessage', 'This attack is already defended');
      }
      // Проверяем, может ли защитная карта побить атакующую
      if (!canBeat(attackPair.attack, defenseCard, trumpSuit)) {
        return socket.emit('errorMessage', 'Defense card cannot beat the attack card');
      }
      // Удаляем карту защиты из руки защитника
      const defender = game.players.find(p => p.id === defenderId);
      if (!defender) return socket.emit('errorMessage', 'Defender not found');
      const index = defender.hand.findIndex(c => c.suit === defenseCard.suit && c.value === defenseCard.value);
      if (index === -1) return socket.emit('errorMessage', 'Defense card not found in hand');
      defender.hand.splice(index, 1);

      // Записываем защитную карту в указанном attack pair
      attackPair.defense = defenseCard;
      console.log(`Defense: ${defenseCard.value} ${defenseCard.suit} by ${defenderId} on attack index ${attackIndex}`);
      io.to(gameId).emit('gameState', game);
    });

    // Событие "bito": атакующий подтверждает, что все атаки отбиты.
    // При этом стол очищается, и происходит смена ролей.
    socket.on('bito', ({ gameId, attackerId }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (attackerId !== game.attackerId) return socket.emit('errorMessage', 'Not your turn to declare bito');

      // Проверяем, что все attack-пары имеют защитную карту
      const allDefended = game.table.every(pair => pair.defense !== null);
      if (!allDefended) return socket.emit('errorMessage', 'Not all attacks have been defended');

      // Очищаем стол
      game.table = [];
      // Меняем роли: атакующий становится защитником и наоборот
      const temp = game.attackerId;
      game.attackerId = game.defenderId;
      game.defenderId = temp;
      console.log(`Bito declared by attacker ${attackerId} in game ${gameId}`);
      io.to(gameId).emit('gameState', game);
    });

    // Событие "takeCards": защитник забирает все карты со стола
    socket.on('takeCards', ({ gameId, defenderId }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (defenderId !== game.defenderId) return socket.emit('errorMessage', 'Not your turn to defend');

      const defender = game.players.find(p => p.id === defenderId);
      if (!defender) return socket.emit('errorMessage', 'Defender not found');

      // Собираем все карты (атакующие и защитные) со стола
      const cardsToTake = game.table.flatMap(pair => {
        let arr = [];
        if (pair.attack) arr.push(pair.attack);
        if (pair.defense) arr.push(pair.defense);
        return arr;
      });
      defender.hand = defender.hand.concat(cardsToTake);
      game.table = [];
      console.log(`Defender ${defenderId} took cards from table in game ${gameId}`);
      io.to(gameId).emit('gameState', game);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.all('*', (req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Server listening on http://localhost:${PORT}`);
  });
});
