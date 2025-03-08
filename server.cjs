require('dotenv').config();
const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

// Импорт глобального хранилища игр
const { games } = require('./data/gameStore');
// Импорт логики игры
const {
  processAttack,
  processDefense,
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

    socket.on('joinGame', ({ gameId, playerId }) => {
      console.log('joinGame received:', { gameId, playerId });
      socket.join(gameId);

      // Если игры с таким gameId не существует, создаём её
      if (!games[gameId]) {
        games[gameId] = {
          id: gameId,
          createdAt: new Date().toISOString(),
          deck: createDeck(),
          players: [],
          table: [],
          status: 'waiting',
        };
        console.log(`Game ${gameId} created`);
      }

      // Если игрока ещё нет, добавляем его
      const alreadyJoined = games[gameId].players.some(p => p.id === playerId);
      if (!alreadyJoined) {
        games[gameId].players.push({ id: playerId, hand: [] });
        console.log(`Player ${playerId} added to game ${gameId}`);
      }

      // Если два игрока и статус "waiting", раздаем карты и устанавливаем порядок ходов
      if (games[gameId].players.length === 2 && games[gameId].status === 'waiting') {
        const deck = games[gameId].deck;
        games[gameId].players.forEach(player => {
          player.hand = deck.splice(0, 6);
        });
        games[gameId].status = 'in-progress';
        initializeTurnOrder(games[gameId]);
        console.log(`Game ${gameId} is now in-progress. Attacker: ${games[gameId].attackerId}, Defender: ${games[gameId].defenderId}`);
      }

      console.log('Current game state:', games[gameId]);
      io.to(gameId).emit('gameState', games[gameId]);
    });

    // Обработка атаки: только текущий атакующий может атаковать
    socket.on('attackCard', ({ gameId, attackerId, card }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');

      if (attackerId !== game.attackerId) {
        return socket.emit('errorMessage', 'Not your turn to attack');
      }

      try {
        processAttack(game, card, attackerId);
        console.log(`Attack: ${card.value} ${card.suit} by ${attackerId}`);
        io.to(gameId).emit('gameState', game);
      } catch (error) {
        console.error('Attack error:', error.message);
        socket.emit('errorMessage', error.message);
      }
    });

    // Обработка защиты: только текущий защитник может отбиваться
    socket.on('defendCard', ({ gameId, defenderId, card, trumpSuit }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');

      if (defenderId !== game.defenderId) {
        return socket.emit('errorMessage', 'Not your turn to defend');
      }

      try {
        processDefense(game, card, defenderId, trumpSuit);
        console.log(`Defense: ${card.value} ${card.suit} by ${defenderId}`);
        // Меняем очередность ходов после успешной защиты
        determineNextTurn(game, true);
        io.to(gameId).emit('gameState', game);
      } catch (error) {
        console.error('Defense error:', error.message);
        socket.emit('errorMessage', error.message);
      }
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
