// UIScene.js — Overlay HUD running in parallel with GameScene.
// Unity equivalent: a UI-only Scene loaded additively on top of the gameplay Scene.

class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // TODO: add score text, health bar, pause button, etc.
  }

  // Call this from GameScene to update displayed values:
  // this.scene.get('UIScene').updateScore(score);
  updateScore(score) {
    // TODO: update score display
  }
}
