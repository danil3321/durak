import { v4 as uuidv4 } from "uuid";

export const games = {}; // Общий список игр

function generateDeck() {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const values = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  let deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5); // Перемешивание колоды
}

export default function handler(req, res) {
  if (req.method === "POST") {
    const { playerId } = req.body;
    const gameId = uuidv4();
    const deck = generateDeck(); // ✅ Создаём колоду

    games[gameId] = {
      id: gameId,
      players: [{ id: playerId, hand: deck.splice(0, 6) }], // ✅ Первый игрок получает карты
      deck,
      started: false,
    };

    console.log("Создана игра:", games[gameId]);
    res.status(200).json({ gameId });
  } else {
    res.status(405).json({ error: "Метод не поддерживается" });
  }
}
