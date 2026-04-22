// BootScene.js — Preload all assets before the game starts.
// Unity equivalent: a loading scene that calls DontDestroyOnLoad on a loader.

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // TODO: load assets
    // this.load.image('player', 'assets/images/player.png');
    // this.load.audio('jump',   'assets/audio/jump.wav');
  }

  create() {
    this.scene.start('GameScene');
  }
}
