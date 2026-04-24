const GameSystemConfig = {
  storage: {
    bestScore: 'skybound-scribble-best-score',
    totalCoins: 'skybound-scribble-total-coins',
    upgrades: 'skybound-scribble-shop-upgrades',
  },

  currency: {
    coinValue: 1,
    enemyKillReward: 5,
    coinSpawnChanceBase: 0.72,
    coinSpawnChanceDrop: 0.18,
    coinSpawnChanceMin: 0.45,
    coinSpawnXMargin: 34,
    coinSpawnYOffsetMin: -42,
    coinSpawnYOffsetMax: 42,
    coinDisplaySize: 26,
    coinBodySize: 18,
    coinSpinSpeed: 0.0035,
  },

  powerups: {
    rocketStartScore: 120,
    laserStartScore: 110,
    shieldStartScore: 90,

    rocketChanceBase: 0.025,
    rocketChanceDrop: 0.015,
    rocketChanceMin: 0.008,

    laserChanceBase: 0.045,
    laserChanceDrop: 0.025,
    laserChanceMin: 0.01,

    shieldChanceBase: 0.05,
    shieldChanceDrop: 0.03,
    shieldChanceMin: 0.012,

    floatOffsetY: 42,
    sideOffsetRatio: 0.2,
    pickupBodySize: 24,
    pickupBodyOffset: 4,

    rocketDuration: 1800,
    rocketFlySpeed: 1080,

    laserDuration: 4800,
    laserFireInterval: 260,
    laserSpeed: 920,
    laserWidth: 12,
    laserHeight: 38,
    laserBodyWidth: 8,
    laserBodyHeight: 34,
    laserCleanupMargin: 180,

    shieldDuration: 5200,
    shieldAuraSize: 82,
  },

  shop: {
    upgrades: {
      luck: {
        label: '幸运值',
        description: '提升有利道具刷新概率',
        prices: [25, 55, 95, 145],
        bonuses: [0, 0.12, 0.26, 0.42, 0.6],
      },
      rocketDuration: {
        label: '火箭续航',
        description: '延长火箭推进持续时间',
        prices: [20, 48, 82, 126],
        bonuses: [0, 350, 820, 1450, 2200],
      },
      laserDuration: {
        label: '激光续航',
        description: '延长激光枪连射持续时间',
        prices: [22, 52, 88, 136],
        bonuses: [0, 700, 1500, 2450, 3600],
      },
      shieldDuration: {
        label: '护盾续航',
        description: '延长保护罩持续时间',
        prices: [18, 44, 76, 118],
        bonuses: [0, 500, 1120, 1850, 2700],
      },
    },
  },
};
