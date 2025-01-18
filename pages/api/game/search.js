import { games } from '../../../data/gameStore';

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Найти первую доступную игру со статусом "waiting"
    const availableGame = games.find((game) => game.status === 'waiting');

    if (availableGame) {
      return res.status(200).json({ game: availableGame });
    } else {
      return res.status(404).json({ error: 'No available games found' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
