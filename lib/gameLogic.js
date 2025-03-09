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
 * Проверяет, может ли защитная карта отбить атакующую с учетом козырной масти.
 * @param {Object} attackingCard - { suit, value }
 * @param {Object} defendingCard - { suit, value }
 * @param {string} trumpSuit - масть козыря
 * @returns {boolean}
 */
function canBeat(attackingCard, defendingCard, trumpSuit) {
  // Если защитная карта – козырь, а атакующая не является козырем:
  if (defendingCard.suit === trumpSuit && attackingCard.suit !== trumpSuit) {
    return true;
  }
  // Если масти совпадают, сравниваем ранги
  if (defendingCard.suit === attackingCard.suit) {
    return cardRanks[defendingCard.value] > cardRanks[attackingCard.value];
  }
  return false;
}

/**
 * Обрабатывает атаку.
 * Если стол пуст, позволяет сыграть любую карту.
 * Если стол не пуст, карта должна совпадать по номиналу с одной из атакующих карт.
 * Удаляет карту из руки атакующего и добавляет запись в table: 
 * { attack: card, defense: null, attackerId }
 * @param {Object} gameState - состояние игры
 * @param {Object} attackingCard - карта для атаки
 * @param {string} attackerId - id атакующего игрока
 * @returns {Object} обновлённое состояние игры
 */
function processAttack(gameState, attackingCard, attackerId) {
  if (attackerId !== gameState.attackerId) {
    throw new Error("Not your turn to attack.");
  }
  const attacker = gameState.players.find(player => player.id === attackerId);
  if (!attacker) {
    throw new Error("Attacker not found.");
  }
  const index = attacker.hand.findIndex(c => c.suit === attackingCard.suit && c.value === attackingCard.value);
  if (index === -1) {
    throw new Error("Card not found in hand.");
  }
  // Если стол пуст – можно сыграть любую карту
  if (gameState.table.length === 0) {
    attacker.hand.splice(index, 1);
    gameState.table.push({ attack: attackingCard, defense: null, attackerId });
    return gameState;
  }
  // Если стол не пуст, карта должна совпадать по номиналу с одной из атакующих карт на столе
  const validValues = gameState.table.map(pair => pair.attack.value);
  if (validValues.includes(attackingCard.value)) {
    attacker.hand.splice(index, 1);
    gameState.table.push({ attack: attackingCard, defense: null, attackerId });
    return gameState;
  }
  throw new Error("Additional attack card must match one of the attack card values on table.");
}

/**
 * Обрабатывает защиту.
 * Защитник выбирает свою карту и индекс атакующей пары, которую он хочет отбить.
 * Если защитная карта способна побить выбранную атакующую (с учетом козыря),
 * защитная карта записывается в поле defense выбранного объекта таблицы.
 * При этом защитная карта удаляется из руки защитника.
 * @param {Object} gameState - состояние игры
 * @param {Object} defenseCard - карта защитника
 * @param {string} defenderId - id защитника
 * @param {string} trumpSuit - масть козыря
 * @param {number} attackIndex - индекс атакующей пары на столе
 * @returns {Object} обновлённое состояние игры
 */
function processDefense(gameState, defenseCard, defenderId, trumpSuit, attackIndex) {
  if (defenderId !== gameState.defenderId) {
    throw new Error("Not your turn to defend.");
  }
  if (attackIndex < 0 || attackIndex >= gameState.table.length) {
    throw new Error("Invalid attack index.");
  }
  const attackPair = gameState.table[attackIndex];
  if (attackPair.defense !== null) {
    throw new Error("This attack is already defended.");
  }
  if (!canBeat(attackPair.attack, defenseCard, trumpSuit)) {
    throw new Error("Defense card cannot beat the attack card.");
  }
  const defender = gameState.players.find(p => p.id === defenderId);
  if (!defender) {
    throw new Error("Defender not found.");
  }
  const index = defender.hand.findIndex(c => c.suit === defenseCard.suit && c.value === defenseCard.value);
  if (index === -1) {
    throw new Error("Defense card not found in hand.");
  }
  defender.hand.splice(index, 1);
  attackPair.defense = defenseCard;
  return gameState;
}

/**
 * Инициализирует начальный порядок ходов для двух игроков.
 * @param {Object} gameState - состояние игры с массивом игроков
 * @returns {Object} gameState с полями attackerId и defenderId
 */
function initializeTurnOrder(gameState) {
  if (gameState.players.length < 2) {
    throw new Error("Not enough players for the game.");
  }
  const randomIndex = Math.floor(Math.random() * 2);
  gameState.attackerId = gameState.players[randomIndex].id;
  gameState.defenderId = gameState.players[1 - randomIndex].id;
  return gameState;
}

/**
 * Обрабатывает событие "bito".
 * Проверяет, что все атакующие пары защищены, добирает карты до 6 для каждого игрока, очищает стол и меняет роли.
 * @param {Object} gameState - состояние игры (включая deck)
 * @returns {Object} обновлённое состояние игры
 */
function processBito(gameState) {
  const allDefended = gameState.table.every(pair => pair.defense !== null);
  if (!allDefended) {
    throw new Error("Not all attacks have been defended.");
  }
  // Добор карт до 6 для каждого игрока
  gameState.players.forEach(player => {
    while (player.hand.length < 6 && gameState.deck.length > 0) {
      player.hand.push(gameState.deck.pop());
    }
  });
  // Очищаем стол
  gameState.table = [];
  // Меняем роли: атакующий становится защитником и наоборот
  const temp = gameState.attackerId;
  gameState.attackerId = gameState.defenderId;
  gameState.defenderId = temp;
  return gameState;
}

/**
 * Меняет очередность ходов (если защита провалилась).
 * В данном примере роли остаются прежними.
 * @param {Object} gameState - состояние игры
 * @param {boolean} defenseSuccessful - результат защиты
 * @returns {Object} gameState
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
  processBito,
  determineNextTurn,
};
