// config.js — All tunable parameters for GAME_NAME
// Unity equivalent: ScriptableObject or public fields on a Manager component.
//
// Keep ALL magic numbers here. Never hardcode values in scene/entity files.

const GameConfig = {
  // Canvas / renderer
  width: 800,
  height: 600,
  backgroundColor: 0x1a1a2e,

  // Physics
  gravity: 300,

  // Player
  playerSpeed: 200,
  playerJumpForce: 400,
  playerMaxHealth: 3,

  // Enemies
  enemySpeed: 100,
  enemySpawnInterval: 2000, // ms

  // Scoring
  scorePerEnemy: 10,

  // Audio
  musicVolume: 0.5,
  sfxVolume: 0.8,
};
