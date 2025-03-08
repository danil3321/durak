const createDeck = () => {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return suits.flatMap(suit => 
      ranks.map(rank => ({ suit, rank, value: ranks.indexOf(rank) }))
    ).sort(() => Math.random() - 0.5);
  };
  
  const startGame = (roomId) => {
    const room = rooms.get(roomId);
    room.trumpCard = room.deck[0];
    room.status = 'active';
    
    // Раздача карт
    room.players.forEach(player => {
      player.cards = room.deck.splice(0, 6);
    });
    
    // Определение первого хода
    room.currentTurn = room.players[0].id;
  };