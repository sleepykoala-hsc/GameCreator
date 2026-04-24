class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.isGameOver = false;
    this.canRestart = false;
    this.score = 0;
    this.bestPlayerY = GameConfig.player.startY;
    this.nextPlatformY = GameConfig.player.startY + 60;
    this.bus = this.game.events;
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.setBackgroundColor(GameConfig.backgroundColor);
    this.physics.world.setBounds(-80, GameConfig.world.minY, GameConfig.width + 160, GameConfig.world.maxY - GameConfig.world.minY);

    this.createBackdrop();
    this.createClouds();
    this.createGroups();
    this.createPlayer();
    this.createStartingPlatforms();
    this.createColliders();
    this.syncScore(true);
    this.bus.emit('status-changed', '左右移动，自动跳跃，踩上弹簧冲更高。');
  }

  createBackdrop() {
    this.paper = this.add.tileSprite(
      GameConfig.width * 0.5,
      GameConfig.height * 0.5,
      GameConfig.width,
      GameConfig.height,
      'paper_tile'
    );
    this.paper.setScrollFactor(0);
    this.paper.setDepth(-20);
  }

  createClouds() {
    this.clouds = [];
    for (let i = 0; i < 8; i += 1) {
      const cloud = this.add.image(
        Phaser.Math.Between(40, GameConfig.width - 40),
        Phaser.Math.Between(-900, GameConfig.height),
        'doodle_cloud'
      );
      cloud.setAlpha(0.45 + i * 0.04);
      cloud.setScale(0.7 + (i % 3) * 0.18);
      cloud.setScrollFactor(0.12 + i * 0.03);
      cloud.setDepth(-10);
      this.clouds.push(cloud);
    }
  }

  createGroups() {
    this.platforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.springs = this.physics.add.group({ allowGravity: false, immovable: true });
  }

  createPlayer() {
    this.player = new Player(this, GameConfig.player.startX, GameConfig.player.startY);
    this.player.body.setGravityY(GameConfig.gravity);
  }

  createStartingPlatforms() {
    this.spawnPlatform(GameConfig.width * 0.5, GameConfig.player.startY + 58, 'static', 180);

    while (this.nextPlatformY > GameConfig.player.startY - GameConfig.camera.spawnAhead) {
      this.nextPlatformY -= this.getGapForHeight(this.getTravelHeightForY(this.nextPlatformY));
      this.spawnPlatformRow(this.nextPlatformY);
    }
  }

  createColliders() {
    this.physics.add.collider(this.player, this.platforms, this.handlePlatformLanding, null, this);
    this.physics.add.overlap(this.player, this.springs, this.handleSpringOverlap, null, this);
  }

  update(_, delta) {
    this.updateBackdrop();

    if (this.isGameOver) {
      this.handleRestartInput();
      return;
    }

    this.handlePlayerMovement();
    this.player.updateVisuals();
    this.player.wrapHorizontally(GameConfig.width);
    this.updateCamera();
    this.updateDifficulty();
    this.updateMovingPlatforms(delta);
    this.updateSprings();
    this.recycleOffscreenObjects();
    this.checkFailure();
  }

  updateBackdrop() {
    this.paper.tilePositionY = this.cameras.main.scrollY * 0.25;
  }

  handlePlayerMovement() {
    let direction = 0;

    if (window.GameInput && window.GameInput.isPressed('left')) {
      direction -= 1;
    }

    if (window.GameInput && window.GameInput.isPressed('right')) {
      direction += 1;
    }

    const pointer = this.input.activePointer;
    if (pointer.isDown) {
      direction = pointer.x < GameConfig.width * 0.5 ? -1 : 1;
    }

    this.player.applyMovement(direction);
  }

  updateCamera() {
    const targetScrollY = this.player.y - GameConfig.camera.followOffsetY;
    if (targetScrollY < this.cameras.main.scrollY) {
      this.cameras.main.scrollY = targetScrollY;
    }

    if (this.player.y < this.bestPlayerY) {
      this.bestPlayerY = this.player.y;
      this.syncScore();
    }
  }

  updateDifficulty() {
    while (this.nextPlatformY > this.cameras.main.scrollY - GameConfig.camera.spawnAhead) {
      this.nextPlatformY -= this.getGapForHeight(this.getTravelHeightForY(this.nextPlatformY));
      this.spawnPlatformRow(this.nextPlatformY);
    }
  }

  updateMovingPlatforms(delta) {
    const deltaSeconds = delta / 1000;

    this.platforms.getChildren().forEach((platform) => {
      if (!platform.active) {
        return;
      }

      if (platform.getData('type') !== 'moving') {
        return;
      }

      let speed = platform.getData('speed');
      platform.x += speed * deltaSeconds;

      const halfWidth = platform.displayWidth * 0.5;
      if (platform.x < halfWidth + 18 || platform.x > GameConfig.width - halfWidth - 18) {
        speed *= -1;
        platform.setData('speed', speed);
        platform.x = Phaser.Math.Clamp(platform.x, halfWidth + 18, GameConfig.width - halfWidth - 18);
      }

      platform.body.updateFromGameObject();
    });
  }

  updateSprings() {
    this.springs.getChildren().forEach((spring) => {
      if (!spring.active) {
        return;
      }

      const host = spring.getData('host');
      if (!host || !host.active) {
        spring.destroy();
        return;
      }

      spring.x = host.x + spring.getData('offsetX');
      spring.y = host.y - host.displayHeight * 0.75;
      spring.body.updateFromGameObject();
    });
  }

  recycleOffscreenObjects() {
    const cleanupY = this.cameras.main.scrollY + GameConfig.height + GameConfig.camera.cleanupBehind;

    this.platforms.getChildren().forEach((platform) => {
      if (platform.active && platform.y > cleanupY) {
        platform.destroy();
      }
    });

    this.springs.getChildren().forEach((spring) => {
      if (spring.active && spring.y > cleanupY) {
        spring.destroy();
      }
    });
  }

  checkFailure() {
    const failY = this.cameras.main.scrollY + GameConfig.height + GameConfig.camera.deathMargin;
    if (this.player.y <= failY) {
      return;
    }

    this.isGameOver = true;
    this.canRestart = false;
    this.player.setTint(0xc7a77a);
    this.player.setVelocity(0, 0);
    this.physics.pause();
    this.bus.emit('game-over', {
      score: this.score,
      bestScore: this.getBestScore(),
    });
    this.time.delayedCall(300, () => {
      this.canRestart = true;
    });
  }

  handleRestartInput() {
    const pointer = this.input.activePointer;
    if (!this.canRestart) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.restartKey) || pointer.justDown) {
      this.scene.restart();
    }
  }

  handlePlatformLanding(player, platform) {
    if (this.isGameOver || player.body.velocity.y <= 0 || !platform.active) {
      return;
    }

    const boost = platform.getData('boost') || GameConfig.player.jumpForce;
    this.player.bounce(boost);

    if (platform.getData('type') === 'breaking' && !platform.getData('broken')) {
      platform.setData('broken', true);
      platform.body.setEnable(false);
      this.tweens.add({
        targets: platform,
        y: platform.y + 70,
        angle: Phaser.Math.Between(-18, 18),
        alpha: 0,
        duration: 260,
        onComplete: () => platform.destroy(),
      });
    }
  }

  handleSpringOverlap(player, spring) {
    if (!spring.active || spring.getData('used') || player.body.velocity.y <= 0) {
      return;
    }

    spring.setData('used', true);
    spring.setTexture('spring_used');
    this.player.bounce(GameConfig.player.springForce);
    this.tweens.add({
      targets: spring,
      scaleY: 0.7,
      yoyo: true,
      duration: 120,
    });
  }

  spawnPlatformRow(y) {
    const travelHeight = this.getTravelHeightForY(y);
    const difficulty = this.getDifficulty(travelHeight);
    const primaryX = Phaser.Math.Between(80, GameConfig.width - 80);
    const primaryType = this.getPlatformType(travelHeight);

    this.spawnPlatform(primaryX, y, primaryType, this.getPlatformWidth(difficulty));

    if (Math.random() < GameConfig.platform.extraPlatformChance * (1 - difficulty * 0.75)) {
      const distance = Phaser.Math.Between(120, 170);
      const direction = Math.random() > 0.5 ? 1 : -1;
      const secondaryX = Phaser.Math.Clamp(primaryX + distance * direction, 70, GameConfig.width - 70);
      this.spawnPlatform(
        secondaryX,
        y + Phaser.Math.Between(-18, 18),
        'static',
        this.getPlatformWidth(difficulty) * GameConfig.platform.secondaryWidthRatio
      );
    }
  }

  spawnPlatform(x, y, type, width) {
    const textureMap = {
      static: 'platform_static',
      moving: 'platform_moving',
      breaking: 'platform_break',
    };

    const platform = this.physics.add.image(x, y, textureMap[type]);
    platform.setImmovable(true);
    platform.body.allowGravity = false;
    platform.setDepth(5);
    platform.setDisplaySize(width, GameConfig.platform.height);
    platform.body.setSize(width - 8, GameConfig.platform.height - 8);
    platform.body.setOffset(4, 4);
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
    platform.setDataEnabled();
    platform.setData('type', type);
    platform.setData('broken', false);
    platform.setData('boost', GameConfig.player.jumpForce);

    if (type === 'moving') {
      const speed = Phaser.Math.Between(GameConfig.platform.movingSpeedMin, GameConfig.platform.movingSpeedMax) * (Math.random() > 0.5 ? 1 : -1);
      platform.setData('speed', speed);
    }

    this.platforms.add(platform);

    if (type !== 'breaking') {
      this.trySpawnSpring(platform);
    }

    return platform;
  }

  trySpawnSpring(platform) {
    const travelHeight = this.getTravelHeightForY(platform.y);
    if (travelHeight < GameConfig.platform.springStart) {
      return;
    }

    const difficulty = this.getDifficulty(travelHeight);
    const chance = GameConfig.platform.springChanceBase - difficulty * GameConfig.platform.springChanceDrop;
    if (Math.random() > chance) {
      return;
    }

    const spring = this.physics.add.image(platform.x, platform.y - platform.displayHeight * 0.75, 'spring_idle');
    spring.setImmovable(true);
    spring.body.allowGravity = false;
    spring.setDepth(6);
    spring.body.setSize(18, 28);
    spring.body.setOffset(7, 4);
    spring.setDataEnabled();
    spring.setData('host', platform);
    spring.setData('used', false);
    spring.setData('offsetX', Phaser.Math.Between(-platform.displayWidth * 0.22, platform.displayWidth * 0.22));
    this.springs.add(spring);
  }

  getGapForHeight(travelHeight) {
    const difficulty = this.getDifficulty(travelHeight);
    return Phaser.Math.Linear(GameConfig.platform.baseGap, GameConfig.platform.maxGap, difficulty);
  }

  getPlatformType(travelHeight) {
    if (travelHeight < GameConfig.platform.movingPlatformStart) {
      return 'static';
    }

    const difficulty = this.getDifficulty(travelHeight);
    const roll = Math.random();
    const movingChance = GameConfig.platform.movingChanceBase + difficulty * GameConfig.platform.movingChanceGrowth;
    const breakingChance = travelHeight < GameConfig.platform.breakPlatformStart
      ? 0
      : GameConfig.platform.breakingChanceBase + difficulty * GameConfig.platform.breakingChanceGrowth;

    if (roll < breakingChance) {
      return 'breaking';
    }

    if (roll < breakingChance + movingChance) {
      return 'moving';
    }

    return 'static';
  }

  getPlatformWidth(difficulty) {
    return Phaser.Math.Linear(GameConfig.platform.baseWidth, GameConfig.platform.minWidth, difficulty);
  }

  getDifficulty(travelHeight) {
    return Phaser.Math.Clamp(travelHeight / GameConfig.difficulty.maxTravelHeight, 0, 1);
  }

  getTravelHeightForY(y) {
    return Math.max(0, GameConfig.player.startY - y);
  }

  syncScore(force) {
    const nextScore = Math.max(0, Math.floor(this.getTravelHeightForY(this.bestPlayerY) / GameConfig.scoring.pixelsPerPoint));
    if (!force && nextScore === this.score) {
      return;
    }

    this.score = nextScore;
    this.bus.emit('score-changed', this.score);

    const bestScore = this.updateBestScore(this.score);
    this.bus.emit('best-score-changed', bestScore);
  }

  getBestScore() {
    try {
      return Number(window.localStorage.getItem(GameConfig.storageKey) || 0);
    } catch (error) {
      return 0;
    }
  }

  updateBestScore(score) {
    const bestScore = Math.max(this.getBestScore(), score);

    try {
      window.localStorage.setItem(GameConfig.storageKey, String(bestScore));
    } catch (error) {
      return bestScore;
    }

    return bestScore;
  }
}
