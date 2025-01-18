import { games } from '../../../data/gameStore';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const newGame = {
      id: Math.random().toString(36).substr(2, 6), // Уникальный ID игры
      createdAt: new Date().toISOString(),
      status: 'waiting',
    };

    // Добавляем новую игру в массив
    games.push(newGame);
    console.log('Game created:', newGame);

    return res.status(201).json(newGame);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
