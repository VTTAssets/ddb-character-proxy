/**
 * CONFIG
 */
const CONFIG = {
  urls: {
    characterUrl: characterId => `https://character-service.dndbeyond.com/character/v4/character/${characterId}`,
    alwaysPreparedSpells: (classId, classLevel) =>
      `https://character-service.dndbeyond.com/character/v4/game-data/always-prepared-spells?classId=${classId}&classLevel=${classLevel}`,
  },
  cache: {
    expiration: 24, // expiration in hours
  },
};

module.exports = CONFIG;
