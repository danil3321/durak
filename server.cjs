require('dotenv').config();
const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

// Импорт глобального хранилища игр (CommonJS)
const { games } = require('./data/gameStore');
// Импорт логики игры
const {
  canBeat,
  processAttack,
  processDefense,
  initializeTurnOrder,
  processBito,
  determineNextTurn,
} = require('./lib/gameLogic');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * Функция для создания колоды карт (36 карт)
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

/**
 * Добор карт: для каждого игрока, если в руке меньше 6 карт и в колоде ещё есть карты,
 * добавляются карты до 6.
 */
function refillHands(game) {
  game.players.forEach(player => {
    while (player.hand.length < 6 && game.deck.length > 0) {
      player.hand.push(game.deck.pop());
    }
  });
}

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Инициализация Socket.io с указанием пути и CORS
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
          deck: createDeck(), // 36 карт
          players: [],
          table: [], // Каждый элемент: { attack: {suit, value}, defense: {suit, value} || null, attackerId }
          status: 'waiting',
          trumpSuit: 'hearts', // Можно задавать динамически
        };
        console.log(`Game ${gameId} created`);
      }

      // Если игрока ещё нет, добавляем его
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
        initializeTurnOrder(games[gameId]); // Устанавливает attackerId и defenderId
        console.log(`Game ${gameId} is now in-progress. Attacker: ${games[gameId].attackerId}, Defender: ${games[gameId].defenderId}`);
      }
      console.log('Current game state:', games[gameId]);
      io.to(gameId).emit('gameState', games[gameId]);
    });

    // Событие "attackCard": атакующий может подкидывать карту, если номинал совпадает с
    // номиналом одной из уже сыгранных атакующих или защитных карт на столе.
    socket.on('attackCard', ({ gameId, attackerId, card }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (attackerId !== game.attackerId) return socket.emit('errorMessage', 'Not your turn to attack');

      const attacker = game.players.find(p => p.id === attackerId);
      if (!attacker) return socket.emit('errorMessage', 'Attacker not found');
      const index = attacker.hand.findIndex(c => c.suit === card.suit && c.value === card.value);
      if (index === -1) return socket.emit('errorMessage', 'Card not found in hand');

      try {
        processAttack(game, card, attackerId);
        console.log(`Attack: ${card.value} ${card.suit} by ${attackerId}`);
        io.to(gameId).emit('gameState', game);
      } catch (error) {
        console.error('Attack error:', error.message);
        socket.emit('errorMessage', error.message);
      }
    });

    // Событие "defendCard": защитник выбирает свою карту и указывает индекс атакующей пары для защиты.
    socket.on('defendCard', ({ gameId, defenderId, defenseCard, attackIndex, trumpSuit }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (defenderId !== game.defenderId) return socket.emit('errorMessage', 'Not your turn to defend');
      if (attackIndex < 0 || attackIndex >= game.table.length) return socket.emit('errorMessage', 'Invalid attack index');

      const attackPair = game.table[attackIndex];
      if (attackPair.defense !== null) return socket.emit('errorMessage', 'This attack is already defended');
      try {
        processDefense(game, defenseCard, defenderId, trumpSuit, attackIndex);
        console.log(`Defense: ${defenseCard.value} ${defenseCard.suit} by ${defenderId} on attack index ${attackIndex}`);
        io.to(gameId).emit('gameState', game);
      } catch (error) {
        console.error('Defense error:', error.message);
        socket.emit('errorMessage', error.message);
      }
    });

    // Событие "bito": атакующий подтверждает, что все атаки отбиты. После этого добираются карты, стол очищается, роли меняются.
    socket.on('bito', ({ gameId, attackerId }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (attackerId !== game.attackerId) return socket.emit('errorMessage', 'Not your turn to declare bito');

      const allDefended = game.table.every(pair => pair.defense !== null);
      if (!allDefended) return socket.emit('errorMessage', 'Not all attacks have been defended');

      refillHands(game);
      game.table = [];
      const temp = game.attackerId;
      game.attackerId = game.defenderId;
      game.defenderId = temp;
      console.log(`Bito declared by attacker ${attackerId} in game ${gameId}`);
      io.to(gameId).emit('gameState', game);
    });

    // Событие "takeCards": защитник забирает все карты со стола, затем добираются карты.
    socket.on('takeCards', ({ gameId, defenderId }) => {
      const game = games[gameId];
      if (!game) return socket.emit('errorMessage', 'Game not found');
      if (defenderId !== game.defenderId) return socket.emit('errorMessage', 'Not your turn to defend');

      const defender = game.players.find(p => p.id === defenderId);
      if (!defender) return socket.emit('errorMessage', 'Defender not found');

      const cardsToTake = game.table.flatMap(pair => {
        let arr = [];
        if (pair.attack) arr.push(pair.attack);
        if (pair.defense) arr.push(pair.defense);
        return arr;
      });
      defender.hand = defender.hand.concat(cardsToTake);
      game.table = [];
      console.log(`Defender ${defenderId} took cards from table in game ${gameId}`);
      refillHands(game);
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
