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
 * Обрабатывает атаку (как начальный ход, так и дополнительное подкидывание):
 * - Если стол пуст, позволяет сыграть любую карту.
 * - Если стол не пуст, карта должна иметь такое же значение, как хотя бы одна из карт на столе.
 * 
 * При успешном ходе карта удаляется из руки атакующего и добавляется на стол.
 *
 * @param {Object} gameState – состояние игры
 * @param {Object} attackingCard – объект { suit, value }
 * @param {string} attackerId – идентификатор игрока, делающего ход
 * @returns {Object} – обновлённое состояние игры
 * @throws {Error} – если карта не найдена или ход недопустим
 */
function processAttack(gameState, attackingCard, attackerId) {
  if (attackerId !== gameState.attackerId) {
    throw new Error("Не ваш ход для атаки.");
  }
  const attacker = gameState.players.find(player => player.id === attackerId);
  if (!attacker) {
    throw new Error("Атакующий не найден.");
  }
  const cardIndex = attacker.hand.findIndex(
    c => c.suit === attackingCard.suit && c.value === attackingCard.value
  );
  if (cardIndex === -1) {
    throw new Error("Карта не найдена в руке.");
  }
  // Удаляем карту из руки атакующего
  attacker.hand.splice(cardIndex, 1);
  
  if (gameState.table.length === 0) {
    // Начальный ход: на стол можно положить любую карту
    gameState.table.push({ ...attackingCard, attackerId });
    return gameState;
  }
  
  // Дополнительное подкидывание: карта должна совпадать по значению с уже выложенными картами
  const validValues = gameState.table.map(card => card.value);
  if (validValues.includes(attackingCard.value)) {
    gameState.table.push({ ...attackingCard, attackerId });
    return gameState;
  }
  
  throw new Error("Для дополнительного подкидывания карта должна совпадать по значению с картами на столе.");
}

/**
 * Обрабатывает защиту:
 * - Удаляет защитную карту из руки защитника, если она найдена.
 * - Проверяет, способна ли защитная карта отбить первую атакующую карту на столе.
 * - Если защита успешна, удаляет атакующую карту со стола.
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
  const cardIndex = defender.hand.findIndex(
    c => c.suit === defenseCard.suit && c.value === defenseCard.value
  );
  if (cardIndex === -1) {
    throw new Error("Карта для защиты не найдена в руке.");
  }
  // Удаляем защитную карту из руки защитника
  defender.hand.splice(cardIndex, 1);
  
  // Попытка отбить первую атакующую карту на столе
  const attackingCard = gameState.table[0];
  if (canBeat(attackingCard, defenseCard, trumpSuit)) {
    // Если защита успешна, удаляем атакующую карту с поля
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
 * Меняет роли в следующем ходе. Если защита успешна, роли меняются.
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
