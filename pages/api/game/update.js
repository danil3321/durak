// pages/api/game/update.js
import { games } from '../../../data/gameStore';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { id, status, players } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    const game = games.find((game) => game.id === id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (status) {
      game.status = status;
    }

    if (players) {
      game.players = players;
    }

    return res.status(200).json({ message: 'Game updated successfully', game });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}
