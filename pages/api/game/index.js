// pages/api/game/index.js

let games = {}; // Хранение игр в памяти

function createDeck() {
  const suits = ["♠", "♥", "♣", "♦"];
  const values = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const deck = suits.flatMap((suit) => values.map((value) => `${value}${suit}`));
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function handler(req, res) {
  const { method, body, query } = req;

  if (method === "POST") {
    // Создание новой игры
    if (body.action === "create") {
      const gameId = Math.random().toString(36).substr(2, 9);
      games[gameId] = {
        players: [],
        deck: createDeck(),
        table: [],
        trump: null, // Козырь
        state: "waiting", // waiting, playing, finished
      };
      res.status(200).json({ gameId });
    }

    // Присоединение к игре
    else if (body.action === "join") {
      const { gameId, playerId } = body;
      const game = games[gameId];
      if (game && game.players.length < 2) {
        game.players.push({ id: playerId, hand: game.deck.splice(0, 6) });
        if (game.players.length === 2) {
          game.state = "playing";
          game.trump = game.deck.pop(); // Установить козырь
        }
        res.status(200).json({ game });
      } else {
        res.status(400).json({ error: "Cannot join the game." });
      }
    }

    // Игровое действие
    else if (body.action === "play") {
      const { gameId, playerId, card } = body;
      const game = games[gameId];
      if (!game || game.state !== "playing") {
        return res.status(400).json({ error: "Invalid game state." });
      }

      const player = game.players.find((p) => p.id === playerId);
      if (player && player.hand.includes(card)) {
        game.table.push({ card, playerId });
        player.hand = player.hand.filter((c) => c !== card);
        res.status(200).json({ game });
      } else {
        res.status(400).json({ error: "Invalid move." });
      }
    }
  }

  if (method === "GET") {
    // Получение состояния игры
    const { gameId } = query;
    const game = games[gameId];
    if (game) {
      res.status(200).json(game);
    } else {
      res.status(404).json({ error: "Game not found." });
    }
  }
}
