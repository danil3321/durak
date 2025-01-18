import { games } from "../../data/gameStore";

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(games);
  } else if (req.method === "POST") {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Invalid game data" });
    }

    const newGame = { id, status, players: [] }; // Инициализируем players как пустой массив
    games.push(newGame);

    return res.status(201).json(newGame);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
