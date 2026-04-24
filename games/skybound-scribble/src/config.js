const GameConfig = {
  width: 480,
  height: 720,
  backgroundColor: 0xf6eedb,
  gravity: 1400,
  storage: GameSystemConfig.storage,

  player: {
    startX: 240,
    startY: 570,
    moveSpeed: 270,
    airDrag: 0.86,
    landingTolerance: 6,
    jumpForce: 670,
    springForce: 980,
    width: 52,
    height: 52,
    maxTiltVelocity: 900,
    maxTiltAngle: 0.18,
    animationVelocityScale: 320,
    animationSpeedMin: 0.85,
    animationSpeedMax: 1.8,
  },

  camera: {
    followOffsetY: 240,
    deathMargin: 140,
    spawnAhead: 1100,
    cleanupBehind: 220,
  },

  platform: {
    baseWidth: 128,
    minWidth: 80,
    height: 24,
    baseGap: 82,
    maxGap: 128,
    movingSpeedMin: 55,
    movingSpeedMax: 115,
    extraPlatformChance: 0.32,
    secondaryWidthRatio: 0.86,
    movingPlatformStart: 260,
    breakPlatformStart: 540,
    springStart: 180,
    springChanceBase: 0.18,
    springChanceDrop: 0.06,
    movingChanceBase: 0.2,
    movingChanceGrowth: 0.18,
    breakingChanceBase: 0.1,
    breakingChanceGrowth: 0.16,
    springVerticalOffsetRatio: 0.75,
  },

  hazards: {
    trapStartScore: 90,
    enemyStartScore: 140,
    trapChanceBase: 0.12,
    trapChanceGrowth: 0.08,
    trapWidthRatioMax: 0.4,
    trapSidePadding: 6,
    trapBaseWidth: 56,
    trapBaseHeight: 32,
    trapBodyMinWidth: 18,
    trapBodyWidthInset: 14,
    trapBodyMinHeight: 10,
    trapBodyHeightInset: 12,
    trapVerticalOffsetRatio: 0.7,
    enemyChanceBase: 0.08,
    enemyChanceGrowth: 0.12,
    enemySpeedMin: 32,
    enemySpeedMax: 52,
    enemySpawnSideClearanceMin: 24,
    enemySpawnSideClearanceMax: 68,
    enemyFloatHeightMin: 72,
    enemyFloatHeightMax: 132,
    enemyHorizontalRangeMin: 24,
    enemyHorizontalRangeMax: 52,
    enemyVerticalRangeMin: 18,
    enemyVerticalRangeMax: 34,
    enemyVerticalMoveChance: 0.5,
    enemyBodyWidth: 26,
    enemyBodyHeight: 20,
    enemyBodyOffsetX: 9,
    enemyBodyOffsetY: 10,
  },

  currency: GameSystemConfig.currency,

  powerups: GameSystemConfig.powerups,

  shop: GameSystemConfig.shop,

  difficulty: {
    maxTravelHeight: 2400,
  },

  scoring: {
    pixelsPerPoint: 12,
  },

  audio: {
    landing: [
      { wave: 'triangle', startFreq: 240, endFreq: 164, duration: 0.09, volume: 0.026 },
    ],
    breaking: [
      { wave: 'sawtooth', startFreq: 210, endFreq: 118, duration: 0.11, volume: 0.024 },
      { wave: 'square', startFreq: 152, endFreq: 84, duration: 0.08, volume: 0.014, delay: 0.02 },
    ],
    spring: [
      { wave: 'sine', startFreq: 320, endFreq: 510, duration: 0.1, volume: 0.028 },
      { wave: 'triangle', startFreq: 420, endFreq: 760, duration: 0.13, volume: 0.02, delay: 0.04 },
    ],
    coin: [
      { wave: 'square', startFreq: 740, endFreq: 980, duration: 0.05, volume: 0.02 },
      { wave: 'triangle', startFreq: 980, endFreq: 1280, duration: 0.07, volume: 0.015, delay: 0.03 },
    ],
  },

  world: {
    horizontalPadding: 80,
    minY: -24000,
    maxY: 1400,
  },
};
