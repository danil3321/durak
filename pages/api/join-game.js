import { games } from "./create-game"; // Используем общий список игр

export default function handler(req, res) {
  if (req.method === "POST") {
    const { gameId, playerId } = req.body;

    if (!games[gameId]) {
      return res.status(404).json({ error: "Игра не найдена" });
    }

    let player = games[gameId].players.find(p => p.id === playerId);

    if (!player) {
      // Если игрока нет, создаем его и раздаём карты
      player = { id: playerId, hand: games[gameId].deck.splice(0, 6) };
      games[gameId].players.push(player);
    }

    console.log("Игроки в игре после присоединения:", games[gameId].players);
    res.status(200).json({ success: true, game: games[gameId] });
  } else {
    res.status(405).json({ error: "Метод не поддерживается" });
  }
}
