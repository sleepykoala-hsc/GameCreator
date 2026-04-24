const GameConfig = {
  width: 480,
  height: 720,
  backgroundColor: 0xf6eedb,
  gravity: 1400,
  storageKey: 'skybound-scribble-best-score',

  player: {
    startX: 240,
    startY: 570,
    moveSpeed: 270,
    airDrag: 0.86,
    jumpForce: 670,
    springForce: 980,
    width: 52,
    height: 52,
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
    gapGrowth: 32,
    movingSpeedMin: 55,
    movingSpeedMax: 115,
    extraPlatformChance: 0.32,
    movingPlatformStart: 260,
    breakPlatformStart: 540,
    springStart: 180,
  },

  scoring: {
    pixelsPerPoint: 12,
  },

  world: {
    minY: -24000,
    maxY: 1400,
  },
};
