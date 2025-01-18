export default function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const { gameId } = req.body;
  
        if (!gameId) {
          return res.status(400).json({ message: 'Game ID is required' });
        }
  
        // Логика присоединения к игре
        console.log(`Player joined game: ${gameId}`);
        return res.status(200).json({ message: `Joined game ${gameId} successfully!` });
      } catch (error) {
        console.error('Error joining game:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  