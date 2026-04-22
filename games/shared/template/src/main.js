// main.js — Bootstrap: creates the game instance.
// Unity equivalent: entry point that loads the first Scene.

// Example for Phaser 3 — adapt for other frameworks.
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GameConfig.width,
  height: GameConfig.height,
  backgroundColor: GameConfig.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GameConfig.gravity },
      debug: false,
    },
  },
  scene: [
    BootScene,
    GameScene,
    UIScene,
  ],
});
