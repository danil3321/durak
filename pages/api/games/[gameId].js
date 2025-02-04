import { games } from "../create-game"; // Используем общий список игр

export default function handler(req, res) {
  const { gameId } = req.query;

  if (!games[gameId]) {
    return res.status(404).json({ error: "Игра не найдена" });
  }

  res.status(200).json(games[gameId]);
}
