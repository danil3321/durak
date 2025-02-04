require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const next = require('next');
const bot = require('./bot');
const { v4: uuidv4 } = require('uuid');

const WEB_APP_URL = process.env.WEB_APP_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !WEB_APP_URL) {
  throw new Error('BOT_TOKEN or WEB_APP_URL is not defined in .env');
}

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

const games = {}; // Хранение активных игр

function generateDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

(async () => {
  await app.prepare();
  const server = express();
  server.use(express.json());

  server.post('/api/create-game', (req, res) => {
    const { playerId } = req.body;
    const gameId = uuidv4();
    const deck = generateDeck();
    games[gameId] = {
      id: gameId,
      players: [{ id: playerId, hand: deck.splice(0, 6) }],
      deck,
      tableCards: [],
      currentTurn: 0, // Индекс текущего игрока
    };
    res.status(200).json({ gameId });
  });

  server.post('/api/join-game', (req, res) => {
    const { gameId, playerId } = req.body;
    if (!games[gameId]) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }
    if (!games[gameId].players.some(player => player.id === playerId)) {
      games[gameId].players.push({ id: playerId, hand: games[gameId].deck.splice(0, 6) });
    }
    res.status(200).json({ success: true, game: games[gameId] });
  });

  server.post('/api/make-move', (req, res) => {
    const { gameId, playerId, card } = req.body;
    const game = games[gameId];
    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }
    if (game.players[game.currentTurn].id !== playerId) {
      return res.status(400).json({ error: 'Сейчас не ваш ход' });
    }
    const player = game.players.find(p => p.id === playerId);
    const cardIndex = player.hand.findIndex(c => c.suit === card.suit && c.value === card.value);
    if (cardIndex === -1) {
      return res.status(400).json({ error: 'Неверная карта' });
    }
    player.hand.splice(cardIndex, 1);
    game.tableCards.push(card);
    game.currentTurn = (game.currentTurn + 1) % game.players.length;
    res.status(200).json({ success: true, game });
  });

  server.get('/api/games/:gameId', (req, res) => {
    const { gameId } = req.params;
    if (!games[gameId]) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }
    res.status(200).json(games[gameId]);
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    try {
      await bot.telegram.setWebhook(`${WEB_APP_URL}/bot`);
      console.log('Webhook successfully set');
    } catch (err) {
      console.error('Error setting webhook:', err);
    }
  });
})();
