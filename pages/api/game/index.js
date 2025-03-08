// pages/api/game/index.js
const { games } = require('../../../data/gameStore');

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Возвращаем все игры в виде массива
    res.status(200).json(Object.values(games));
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
