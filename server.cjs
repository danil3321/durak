require('dotenv').config();
const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

// Импортируем глобальное хранилище игр из data/gameStore.js
const { games } = require('./data/gameStore');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * Функция для создания колоды карт
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
  // Перемешиваем колоду
  return deck.sort(() => Math.random() - 0.5);
}

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Инициализация Socket.io с явным указанием пути
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinGame', ({ gameId, playerId }) => {
      console.log('joinGame received:', { gameId, playerId });
      socket.join(gameId);

      // Если игры с таким gameId не существует, создаём её в глобальном хранилище
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

      // Если игрока ещё нет в игре, добавляем его
      const alreadyJoined = games[gameId].players.some((p) => p.id === playerId);
      if (!alreadyJoined) {
        games[gameId].players.push({ id: playerId, hand: [] });
        console.log(`Player ${playerId} added to game ${gameId}`);
      }

      // Если в игре два игрока и статус "waiting", раздаем карты и меняем статус на "in-progress"
      if (games[gameId].players.length === 2 && games[gameId].status === 'waiting') {
        const deck = games[gameId].deck;
        games[gameId].players.forEach((player) => {
          player.hand = deck.splice(0, 6);
        });
        games[gameId].status = 'in-progress';
        console.log(`Game ${gameId} is now in-progress`);
      }

      console.log('Current game state:', games[gameId]);
      io.to(gameId).emit('gameState', games[gameId]);
    });

    socket.on('playCard', ({ gameId, playerId, card }) => {
      const game = games[gameId];
      if (!game) return;

      const player = game.players.find((p) => p.id === playerId);
      if (!player) return;

      player.hand = player.hand.filter(
        (c) => !(c.suit === card.suit && c.value === card.value)
      );
      game.table.push({ ...card, playedBy: playerId });

      io.to(gameId).emit('gameState', game);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Все остальные запросы передаем Next.js
  server.all('*', (req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Server listening on http://localhost:${PORT}`);
  });
});
