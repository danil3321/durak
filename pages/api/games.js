import { games } from "./create-game"; // Используем общий список игр

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(Object.values(games)); // Возвращаем список игр
  } else {
    res.status(405).json({ error: "Метод не поддерживается" });
  }
}
