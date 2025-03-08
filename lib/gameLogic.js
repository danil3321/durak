// lib/gameLogic.js

// Ранговые значения карт для сравнения
const cardRanks = {
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
  };
  
  /**
   * Проверяет, может ли защитная карта отбить атакующую, учитывая козырную масть.
   */
  function canBeat(attackingCard, defendingCard, trumpSuit) {
    if (defendingCard.suit === trumpSuit && attackingCard.suit !== trumpSuit) {
      return true;
    }
    if (defendingCard.suit === attackingCard.suit) {
      return cardRanks[defendingCard.value] > cardRanks[attackingCard.value];
    }
    return false;
  }
  
  /**
   * Обрабатывает атаку:
   *  - Проверяет, что текущий атакующий делает ход.
   *  - Удаляет атакующую карту из руки атакующего, если она есть.
   *  - Если стол пуст, добавляет карту на стол.
   *  - Если стол не пуст, карта должна совпадать по значению с картами на столе.
   */
  function processAttack(gameState, attackingCard, attackerId) {
    if (attackerId !== gameState.attackerId) {
      throw new Error("Не ваш ход для атаки.");
    }
    const attacker = gameState.players.find(player => player.id === attackerId);
    if (!attacker) {
      throw new Error("Атакующий не найден.");
    }
    const cardIndex = attacker.hand.findIndex(c => c.suit === attackingCard.suit && c.value === attackingCard.value);
    if (cardIndex === -1) {
      throw new Error("Карта не найдена в руке.");
    }
    // Удаляем карту из руки
    attacker.hand.splice(cardIndex, 1);
    
    // Если стол пуст, просто добавляем карту
    if (gameState.table.length === 0) {
      gameState.table.push({ ...attackingCard, attackerId });
      return gameState;
    }
    // Если стол не пуст, карта должна совпадать по значению с уже выложенными
    const validValues = gameState.table.map(card => card.value);
    if (validValues.includes(attackingCard.value)) {
      gameState.table.push({ ...attackingCard, attackerId });
      return gameState;
    }
    throw new Error("Атакующая карта должна совпадать по значению с картами на столе.");
  }
  
  /**
   * Обрабатывает защиту:
   *  - Проверяет, что текущий защитник делает ход.
   *  - Удаляет защитную карту из руки защитника, если она есть.
   *  - Проверяет, способна ли защитная карта побить первую атакующую карту на столе.
   *  - Если защита успешна, удаляет атакующую карту с поля.
   */
  function processDefense(gameState, defenseCard, defenderId, trumpSuit) {
    if (defenderId !== gameState.defenderId) {
      throw new Error("Не ваш ход для защиты.");
    }
    if (gameState.table.length === 0) {
      throw new Error("На столе нет атакующих карт.");
    }
    const defender = gameState.players.find(player => player.id === defenderId);
    if (!defender) {
      throw new Error("Защитник не найден.");
    }
    const cardIndex = defender.hand.findIndex(c => c.suit === defenseCard.suit && c.value === defenseCard.value);
    if (cardIndex === -1) {
      throw new Error("Карта для защиты не найдена в руке.");
    }
    // Удаляем карту из руки защитника
    defender.hand.splice(cardIndex, 1);
    
    // Защищаем первую атакующую карту
    const attackingCard = gameState.table[0];
    if (canBeat(attackingCard, defenseCard, trumpSuit)) {
      gameState.table.shift();
      return gameState;
    }
    throw new Error("Защитная карта не может побить атакующую.");
  }
  
  /**
   * Инициализирует начальный порядок ходов (атакующий и защитник) для двух игроков.
   */
  function initializeTurnOrder(gameState) {
    if (gameState.players.length < 2) {
      throw new Error("Недостаточно игроков для начала игры.");
    }
    const randomIndex = Math.floor(Math.random() * 2);
    gameState.attackerId = gameState.players[randomIndex].id;
    gameState.defenderId = gameState.players[1 - randomIndex].id;
    return gameState;
  }
  
  /**
   * Меняет роли в следующем ходе.
   * Если защита успешна, меняются атакующий и защитник.
   */
  function determineNextTurn(gameState, defenseSuccessful) {
    if (defenseSuccessful) {
      const temp = gameState.attackerId;
      gameState.attackerId = gameState.defenderId;
      gameState.defenderId = temp;
    }
    return gameState;
  }
  
  module.exports = {
    canBeat,
    processAttack,
    processDefense,
    initializeTurnOrder,
    determineNextTurn,
  };
  