const gameInput = new InputManager();
gameInput.init();
window.GameInput = gameInput;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GameConfig.width,
  height: GameConfig.height,
  backgroundColor: GameConfig.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    GameScene,
    UIScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

window.GameInstance = game;
