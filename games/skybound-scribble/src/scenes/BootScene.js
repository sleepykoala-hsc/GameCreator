class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {}

  create() {
    this.createPaperTexture();
    this.createPlayerTextures();
    this.createPlatformTextures();
    this.createSpringTextures();
    this.createHazardTextures();
    this.createPowerupTextures();
    this.createCloudTexture();
    this.createAnimations();

    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  createPaperTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0xfaf4e5, 1);
    graphics.fillRect(0, 0, 128, 128);

    graphics.lineStyle(2, 0xd8e5f1, 0.9);
    for (let y = 16; y <= 128; y += 22) {
      graphics.beginPath();
      graphics.moveTo(0, y);
      graphics.lineTo(128, y + ((y / 22) % 2 === 0 ? 1 : -1));
      graphics.strokePath();
    }

    graphics.lineStyle(3, 0xf1c7be, 0.85);
    graphics.beginPath();
    graphics.moveTo(26, 0);
    graphics.lineTo(24, 128);
    graphics.strokePath();

    graphics.generateTexture('paper_tile', 128, 128);
    graphics.destroy();
  }

  createPlayerTextures() {
    [0, 1, 2].forEach((frame) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      const legSpread = [0, 5, -5][frame];
      const armLift = [3, -2, 6][frame];
      const bob = [0, -2, 2][frame];

      graphics.fillStyle(0x2d2a32, 1);
      graphics.fillCircle(25, 11 + bob, 8);
      graphics.lineStyle(3, 0x2d2a32, 1);
      graphics.strokeCircle(25, 11 + bob, 8);

      graphics.fillStyle(0xffcc8f, 1);
      graphics.fillCircle(25, 12 + bob, 6);

      graphics.lineStyle(4, 0x2d2a32, 1);
      graphics.beginPath();
      graphics.moveTo(15, 24 + bob);
      graphics.lineTo(35, 26 + bob);
      graphics.lineTo(32, 42 + bob);
      graphics.lineTo(18, 42 + bob);
      graphics.closePath();
      graphics.fillStyle(0xf28f3b, 1);
      graphics.fillPath();
      graphics.strokePath();

      graphics.lineStyle(4, 0x2d2a32, 1);
      graphics.beginPath();
      graphics.moveTo(21, 42 + bob);
      graphics.lineTo(18 + legSpread, 55);
      graphics.moveTo(29, 42 + bob);
      graphics.lineTo(32 - legSpread, 55);
      graphics.moveTo(18, 30 + bob);
      graphics.lineTo(11, 37 + armLift);
      graphics.moveTo(32, 30 + bob);
      graphics.lineTo(40, 37 - armLift * 0.3);
      graphics.strokePath();

      graphics.fillStyle(0x4cc9f0, 1);
      graphics.fillRoundedRect(17, 23 + bob, 16, 7, 3);
      graphics.lineStyle(2, 0x2d2a32, 1);
      graphics.strokeRoundedRect(17, 23 + bob, 16, 7, 3);

      graphics.fillStyle(0x2d2a32, 1);
      graphics.fillCircle(22.5, 11 + bob, 1.5);
      graphics.fillCircle(27.5, 11 + bob, 1.5);
      graphics.beginPath();
      graphics.arc(25, 14 + bob, 3, 0.2, Math.PI - 0.2, false);
      graphics.strokePath();

      graphics.generateTexture(`player_jump_${frame}`, 50, 58);
      graphics.destroy();
    });
  }

  createPlatformTextures() {
    const textureSpecs = [
      { key: 'platform_static', fill: 0x9ad17b, accent: 0x6aa75a, stripe: false },
      { key: 'platform_moving', fill: 0x8ed6ff, accent: 0x5aa4d6, stripe: true },
      { key: 'platform_break', fill: 0xffc89c, accent: 0xe98b65, stripe: false },
    ];

    textureSpecs.forEach((texture) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });

      graphics.fillStyle(texture.fill, 1);
      graphics.lineStyle(3, 0x2d2a32, 1);
      graphics.fillRoundedRect(2, 5, 124, 14, 7);
      graphics.strokeRoundedRect(2, 5, 124, 14, 7);

      graphics.fillStyle(texture.accent, 0.85);
      graphics.fillRoundedRect(9, 9, 108, 6, 4);

      if (texture.stripe) {
        graphics.lineStyle(2, 0x2d2a32, 0.8);
        for (let x = 22; x <= 104; x += 24) {
          graphics.beginPath();
          graphics.moveTo(x, 6);
          graphics.lineTo(x + 7, 19);
          graphics.strokePath();
        }
      }

      if (texture.key === 'platform_break') {
        graphics.fillStyle(0xa4724e, 0.95);
        graphics.beginPath();
        graphics.moveTo(8, 12);
        graphics.lineTo(24, 7);
        graphics.lineTo(39, 14);
        graphics.lineTo(56, 5);
        graphics.lineTo(74, 13);
        graphics.lineTo(92, 8);
        graphics.lineTo(112, 15);
        graphics.lineTo(120, 11);
        graphics.lineTo(120, 19);
        graphics.lineTo(8, 19);
        graphics.closePath();
        graphics.fillPath();

        graphics.lineStyle(2, 0x2d2a32, 1);
        graphics.beginPath();
        graphics.moveTo(18, 7);
        graphics.lineTo(30, 18);
        graphics.lineTo(44, 10);
        graphics.lineTo(55, 18);
        graphics.lineTo(69, 9);
        graphics.lineTo(82, 18);
        graphics.lineTo(97, 8);
        graphics.lineTo(112, 17);
        graphics.strokePath();

        graphics.beginPath();
        graphics.moveTo(50, 8);
        graphics.lineTo(44, 18);
        graphics.moveTo(78, 10);
        graphics.lineTo(74, 18);
        graphics.moveTo(99, 9);
        graphics.lineTo(95, 18);
        graphics.strokePath();
      }

      graphics.generateTexture(texture.key, 128, 24);
      graphics.destroy();
    });
  }

  createSpringTextures() {
    const down = this.make.graphics({ x: 0, y: 0, add: false });
    down.lineStyle(3, 0x2d2a32, 1);
    down.fillStyle(0x4cc9f0, 1);
    down.fillRoundedRect(6, 25, 20, 8, 4);
    down.strokeRoundedRect(6, 25, 20, 8, 4);
    down.beginPath();
    down.moveTo(12, 25);
    down.lineTo(17, 20);
    down.lineTo(12, 15);
    down.lineTo(17, 10);
    down.lineTo(12, 5);
    down.lineTo(17, 2);
    down.lineTo(21, 6);
    down.lineTo(16, 11);
    down.lineTo(21, 16);
    down.lineTo(16, 21);
    down.lineTo(21, 25);
    down.strokePath();
    down.generateTexture('spring_idle', 32, 36);
    down.destroy();

    const up = this.make.graphics({ x: 0, y: 0, add: false });
    up.lineStyle(3, 0x2d2a32, 1);
    up.fillStyle(0x4cc9f0, 1);
    up.fillRoundedRect(6, 25, 20, 8, 4);
    up.strokeRoundedRect(6, 25, 20, 8, 4);
    up.beginPath();
    up.moveTo(12, 25);
    up.lineTo(18, 18);
    up.lineTo(12, 11);
    up.lineTo(20, 4);
    up.strokePath();
    up.generateTexture('spring_used', 32, 36);
    up.destroy();
  }

  createHazardTextures() {
    const enemy = this.make.graphics({ x: 0, y: 0, add: false });
    enemy.fillStyle(0xe96b6b, 1);
    enemy.lineStyle(3, 0x2d2a32, 1);
    enemy.fillEllipse(22, 20, 28, 18);
    enemy.strokeEllipse(22, 20, 28, 18);
    enemy.fillCircle(16, 12, 8);
    enemy.fillCircle(28, 12, 8);
    enemy.strokeCircle(16, 12, 8);
    enemy.strokeCircle(28, 12, 8);
    enemy.fillStyle(0xffffff, 1);
    enemy.fillCircle(16, 12, 3);
    enemy.fillCircle(28, 12, 3);
    enemy.fillStyle(0x2d2a32, 1);
    enemy.fillCircle(16, 12, 1.4);
    enemy.fillCircle(28, 12, 1.4);
    enemy.beginPath();
    enemy.moveTo(11, 26);
    enemy.lineTo(8, 34);
    enemy.moveTo(18, 27);
    enemy.lineTo(18, 35);
    enemy.moveTo(26, 27);
    enemy.lineTo(26, 35);
    enemy.moveTo(33, 26);
    enemy.lineTo(36, 34);
    enemy.moveTo(11, 10);
    enemy.lineTo(7, 4);
    enemy.moveTo(33, 10);
    enemy.lineTo(37, 4);
    enemy.strokePath();
    enemy.generateTexture('hazard_enemy', 44, 38);
    enemy.destroy();

    const trap = this.make.graphics({ x: 0, y: 0, add: false });
    trap.fillStyle(0xb8c3cc, 1);
    trap.lineStyle(3, 0x2d2a32, 1);
    trap.beginPath();
    trap.moveTo(4, 24);
    trap.lineTo(12, 7);
    trap.lineTo(20, 24);
    trap.lineTo(28, 8);
    trap.lineTo(36, 24);
    trap.lineTo(44, 6);
    trap.lineTo(52, 24);
    trap.closePath();
    trap.fillPath();
    trap.strokePath();
    trap.fillStyle(0x8fa0ad, 1);
    trap.fillRect(4, 24, 48, 6);
    trap.strokeRect(4, 24, 48, 6);
    trap.generateTexture('hazard_trap', 56, 32);
    trap.destroy();
  }

  createPowerupTextures() {
    const rocket = this.make.graphics({ x: 0, y: 0, add: false });
    rocket.fillStyle(0xff8f5a, 1);
    rocket.lineStyle(3, 0x2d2a32, 1);
    rocket.fillRoundedRect(10, 12, 16, 24, 7);
    rocket.strokeRoundedRect(10, 12, 16, 24, 7);
    rocket.fillStyle(0x8ed6ff, 1);
    rocket.fillTriangle(18, 3, 9, 15, 27, 15);
    rocket.lineStyle(3, 0x2d2a32, 1);
    rocket.strokeTriangle(18, 3, 9, 15, 27, 15);
    rocket.fillStyle(0xffdd57, 1);
    rocket.fillTriangle(18, 46, 12, 35, 24, 35);
    rocket.lineStyle(2, 0x2d2a32, 1);
    rocket.strokeTriangle(18, 46, 12, 35, 24, 35);
    rocket.fillStyle(0xffffff, 1);
    rocket.fillCircle(18, 24, 4);
    rocket.lineStyle(2, 0x2d2a32, 1);
    rocket.strokeCircle(18, 24, 4);
    rocket.generateTexture('powerup_rocket', 36, 52);
    rocket.destroy();

    const laserGun = this.make.graphics({ x: 0, y: 0, add: false });
    laserGun.fillStyle(0x7f8cff, 1);
    laserGun.lineStyle(3, 0x2d2a32, 1);
    laserGun.fillRoundedRect(5, 12, 26, 10, 4);
    laserGun.strokeRoundedRect(5, 12, 26, 10, 4);
    laserGun.fillStyle(0xffdd57, 1);
    laserGun.fillRect(24, 6, 4, 8);
    laserGun.strokeRect(24, 6, 4, 8);
    laserGun.fillStyle(0x4cc9f0, 1);
    laserGun.fillRect(10, 21, 8, 9);
    laserGun.strokeRect(10, 21, 8, 9);
    laserGun.lineStyle(2, 0xfaf4e5, 0.95);
    laserGun.beginPath();
    laserGun.moveTo(28, 10);
    laserGun.lineTo(34, 2);
    laserGun.strokePath();
    laserGun.generateTexture('powerup_laser', 36, 32);
    laserGun.destroy();

    const shield = this.make.graphics({ x: 0, y: 0, add: false });
    shield.fillStyle(0x6fe3d3, 0.95);
    shield.lineStyle(3, 0x2d2a32, 1);
    shield.beginPath();
    shield.moveTo(18, 4);
    shield.lineTo(30, 9);
    shield.lineTo(28, 24);
    shield.lineTo(18, 32);
    shield.lineTo(8, 24);
    shield.lineTo(6, 9);
    shield.closePath();
    shield.fillPath();
    shield.strokePath();
    shield.lineStyle(2, 0xffffff, 0.95);
    shield.beginPath();
    shield.moveTo(18, 10);
    shield.lineTo(24, 13);
    shield.lineTo(23, 21);
    shield.lineTo(18, 25);
    shield.lineTo(13, 21);
    shield.lineTo(12, 13);
    shield.closePath();
    shield.strokePath();
    shield.generateTexture('powerup_shield', 36, 36);
    shield.destroy();

    const beam = this.make.graphics({ x: 0, y: 0, add: false });
    beam.fillStyle(0xff5fb0, 0.95);
    beam.lineStyle(2, 0x2d2a32, 1);
    beam.fillRoundedRect(3, 2, 6, 34, 3);
    beam.strokeRoundedRect(3, 2, 6, 34, 3);
    beam.fillStyle(0xffffff, 0.9);
    beam.fillRect(5, 4, 2, 30);
    beam.generateTexture('powerup_laser_beam', 12, 38);
    beam.destroy();

    const aura = this.make.graphics({ x: 0, y: 0, add: false });
    aura.lineStyle(5, 0x6fe3d3, 0.9);
    aura.strokeCircle(41, 41, 32);
    aura.lineStyle(2, 0xffffff, 0.85);
    aura.strokeCircle(41, 41, 26);
    aura.generateTexture('powerup_shield_aura', 82, 82);
    aura.destroy();

    const coin = this.make.graphics({ x: 0, y: 0, add: false });
    coin.fillStyle(0xffd54f, 1);
    coin.lineStyle(3, 0x2d2a32, 1);
    coin.fillCircle(14, 14, 11);
    coin.strokeCircle(14, 14, 11);
    coin.lineStyle(2, 0xfff4bf, 0.95);
    coin.strokeCircle(14, 14, 7);
    coin.lineStyle(3, 0x2d2a32, 1);
    coin.beginPath();
    coin.moveTo(14, 8);
    coin.lineTo(14, 20);
    coin.strokePath();
    coin.generateTexture('pickup_coin', 28, 28);
    coin.destroy();
  }

  createCloudTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0xffffff, 0.75);
    graphics.lineStyle(3, 0x2d2a32, 0.55);
    graphics.fillCircle(22, 26, 16);
    graphics.fillCircle(42, 18, 18);
    graphics.fillCircle(64, 24, 15);
    graphics.fillCircle(50, 33, 16);
    graphics.strokeCircle(22, 26, 16);
    graphics.strokeCircle(42, 18, 18);
    graphics.strokeCircle(64, 24, 15);
    graphics.strokeCircle(50, 33, 16);

    graphics.generateTexture('doodle_cloud', 86, 54);
    graphics.destroy();
  }

  createAnimations() {
    if (!this.anims.exists('player_jump')) {
      this.anims.create({
        key: 'player_jump',
        frames: [
          { key: 'player_jump_0' },
          { key: 'player_jump_1' },
          { key: 'player_jump_2' },
          { key: 'player_jump_1' },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}
