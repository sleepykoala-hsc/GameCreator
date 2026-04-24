class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_jump_0');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(GameConfig.player.width, GameConfig.player.height);
    this.body.setSize(GameConfig.player.width * 0.52, GameConfig.player.height * 0.78);
    this.body.setOffset(GameConfig.player.width * 0.24, GameConfig.player.height * 0.16);
    this.setDepth(10);
    this.setCollideWorldBounds(false);
    this.play('player_jump', true);
  }

  applyMovement(direction) {
    if (direction !== 0) {
      this.setVelocityX(direction * GameConfig.player.moveSpeed);
      this.setFlipX(direction < 0);
      return;
    }

    this.setVelocityX(this.body.velocity.x * GameConfig.player.airDrag);
    if (Math.abs(this.body.velocity.x) < 8) {
      this.setVelocityX(0);
    }
  }

  bounce(force) {
    this.setVelocityY(-force);
    this.anims.timeScale = 1.6;
  }

  updateVisuals() {
    this.play('player_jump', true);
    this.rotation = Phaser.Math.Clamp(this.body.velocity.x / 900, -0.18, 0.18);
    this.anims.timeScale = Phaser.Math.Clamp(Math.abs(this.body.velocity.y) / 320, 0.85, 1.8);
  }

  wrapHorizontally(width) {
    const padding = this.displayWidth * 0.35;

    if (this.x < -padding) {
      this.x = width + padding;
    } else if (this.x > width + padding) {
      this.x = -padding;
    }
  }
}
