class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.isGameOver = false;
    this.canRestart = false;
    this.gameOverReason = '失足掉出了画面';
    this.score = 0;
    this.bestPlayerY = GameConfig.player.startY;
    this.nextPlatformY = GameConfig.player.startY + 60;
    this.bus = this.game.events;
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.setBackgroundColor(GameConfig.backgroundColor);
    this.physics.world.setBounds(
      -GameConfig.world.horizontalPadding,
      GameConfig.world.minY,
      GameConfig.width + GameConfig.world.horizontalPadding * 2,
      GameConfig.world.maxY - GameConfig.world.minY
    );

    this.createBackdrop();
    this.createClouds();
    this.createGroups();
    this.setupAudioUnlock();
    this.createPlayer();
    this.initializePowerupState();
    this.createStartingPlatforms();
    this.createColliders();
    this.syncScore(true);
    this.refreshStatusMessage();
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
    this.powerups = this.physics.add.group({ allowGravity: false, immovable: true });
    this.enemies = this.physics.add.group({ allowGravity: false, immovable: true });
    this.traps = this.physics.add.group({ allowGravity: false, immovable: true });
    this.lasers = this.physics.add.group({ allowGravity: false, immovable: true });
  }

  setupAudioUnlock() {
    const unlockAudio = () => {
      const context = this.sound && this.sound.context;
      if (context && context.state === 'suspended') {
        context.resume().catch(() => {});
      }
    };

    this.input.once('pointerdown', unlockAudio);
    this.input.keyboard.once('keydown', unlockAudio);
  }

  createPlayer() {
    this.player = new Player(this, GameConfig.player.startX, GameConfig.player.startY);
    this.player.body.setGravityY(GameConfig.gravity);
    this.shieldAura = this.add.image(this.player.x, this.player.y, 'powerup_shield_aura');
    this.shieldAura.setDepth(this.player.depth - 1);
    this.shieldAura.setVisible(false);
    this.shieldAura.setDisplaySize(GameConfig.powerups.shieldAuraSize, GameConfig.powerups.shieldAuraSize);
  }

  initializePowerupState() {
    this.activeEffects = {
      rocketUntil: 0,
      laserUntil: 0,
      shieldUntil: 0,
    };
    this.effectFlags = {
      rocket: false,
      laser: false,
      shield: false,
    };
    this.nextLaserShotAt = 0;
  }

  createStartingPlatforms() {
    this.spawnPlatform(GameConfig.width * 0.5, GameConfig.player.startY + 58, 'static', 180);

    while (this.nextPlatformY > GameConfig.player.startY - GameConfig.camera.spawnAhead) {
      this.nextPlatformY -= this.getGapForHeight(this.getTravelHeightForY(this.nextPlatformY));
      this.spawnPlatformRow(this.nextPlatformY);
    }
  }

  createColliders() {
    this.physics.add.collider(this.player, this.platforms, this.handlePlatformLanding, this.canLandOnPlatform, this);
    this.physics.add.overlap(this.player, this.springs, this.handleSpringOverlap, null, this);
    this.physics.add.overlap(this.player, this.powerups, this.handlePowerupOverlap, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyOverlap, null, this);
    this.physics.add.overlap(this.player, this.traps, this.handleTrapOverlap, null, this);
    this.physics.add.overlap(this.lasers, this.enemies, this.handleLaserEnemyOverlap, null, this);
  }

  update(_, delta) {
    this.updateBackdrop();

    if (this.isGameOver) {
      this.handleRestartInput();
      return;
    }

    this.handlePlayerMovement();
    this.updatePowerupEffects();
    this.player.updateVisuals();
    this.player.wrapHorizontally(GameConfig.width);
    this.updateCamera();
    this.updateDifficulty();
    this.updateMovingPlatforms(delta);
    this.updateAttachedObjects(delta);
    this.updateProjectiles();
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

  updateAttachedObjects(delta) {
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
      spring.y = host.y - host.displayHeight * GameConfig.platform.springVerticalOffsetRatio;
      spring.body.updateFromGameObject();
    });

    this.powerups.getChildren().forEach((powerup) => {
      if (!powerup.active) {
        return;
      }

      const host = powerup.getData('host');
      if (!host || !host.active) {
        this.destroyPowerup(powerup);
        return;
      }

      powerup.x = host.x + powerup.getData('offsetX');
      powerup.y = host.y - powerup.getData('offsetY');
      powerup.body.updateFromGameObject();
    });

    this.traps.getChildren().forEach((trap) => {
      if (!trap.active) {
        return;
      }

      const host = trap.getData('host');
      if (!host || !host.active) {
        trap.destroy();
        return;
      }

      trap.x = host.x + trap.getData('offsetX');
      trap.y = host.y - host.displayHeight * GameConfig.hazards.trapVerticalOffsetRatio;
      trap.body.updateFromGameObject();
    });

    const deltaSeconds = delta / 1000;
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) {
        return;
      }

      const host = enemy.getData('host');
      if (!host || !host.active) {
        enemy.destroy();
        return;
      }

      const axis = enemy.getData('axis');
      const dataKey = axis === 'vertical' ? 'offsetY' : 'offsetX';
      let offset = enemy.getData(dataKey) + enemy.getData('speed') * enemy.getData('direction') * deltaSeconds;
      const limit = enemy.getData('range');

      if (Math.abs(offset) > limit) {
        offset = Phaser.Math.Clamp(offset, -limit, limit);
        enemy.setData('direction', enemy.getData('direction') * -1);
      }

      enemy.setData(dataKey, offset);

      const baseX = host.x + enemy.getData('baseOffsetX');
      const baseY = host.y - enemy.getData('baseOffsetY');

      if (axis === 'vertical') {
        enemy.x = baseX;
        enemy.y = baseY + offset;
        enemy.setFlipX(false);
      } else {
        enemy.x = baseX + offset;
        enemy.y = baseY;
        enemy.setFlipX(enemy.getData('direction') < 0);
      }

      enemy.body.updateFromGameObject();
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

    this.powerups.getChildren().forEach((powerup) => {
      if (powerup.active && powerup.y > cleanupY) {
        this.destroyPowerup(powerup);
      }
    });

    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active && enemy.y > cleanupY) {
        this.destroyHazard(enemy);
      }
    });

    this.traps.getChildren().forEach((trap) => {
      if (trap.active && trap.y > cleanupY) {
        this.destroyHazard(trap);
      }
    });

    this.lasers.getChildren().forEach((laser) => {
      if (
        laser.active
        && (laser.y > cleanupY || laser.y < this.cameras.main.scrollY - GameConfig.powerups.laserCleanupMargin)
      ) {
        laser.destroy();
      }
    });
  }

  checkFailure() {
    const failY = this.cameras.main.scrollY + GameConfig.height + GameConfig.camera.deathMargin;
    if (this.player.y <= failY) {
      return;
    }

    this.gameOverReason = '失足掉出了画面';
    this.endRun(0xc7a77a);
  }

  endRun(tint) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.canRestart = false;
    this.clearPowerupEffects();
    this.player.setTint(tint);
    this.player.setVelocity(0, 0);
    this.physics.pause();
    this.bus.emit('game-over', {
      score: this.score,
      bestScore: this.getBestScore(),
      reason: this.gameOverReason,
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

  canLandOnPlatform(player, platform) {
    if (this.isGameOver || !platform.active) {
      return false;
    }

    if (this.activeEffects.rocketUntil > this.time.now) {
      return false;
    }

    if (player.body.velocity.y <= 0) {
      return false;
    }

    const playerBottom = player.body.bottom;
    const previousBottom = player.body.prev.y + player.body.height;
    const platformTop = platform.body.top;

    return previousBottom <= platformTop + GameConfig.player.landingTolerance && playerBottom >= platformTop;
  }

  handlePlatformLanding(player, platform) {
    if (this.isGameOver || !platform.active) {
      return;
    }

    const boost = platform.getData('boost') || GameConfig.player.jumpForce;
    this.playSurfaceSound(platform.getData('type') === 'breaking' ? 'breaking' : 'landing');
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
    this.playSurfaceSound('spring');
    this.player.bounce(GameConfig.player.springForce);
    this.tweens.add({
      targets: spring,
      scaleY: 0.7,
      yoyo: true,
      duration: 120,
    });
  }

  handlePowerupOverlap(_, powerup) {
    if (!powerup.active) {
      return;
    }

    const type = powerup.getData('type');
    this.destroyPowerup(powerup);
    this.activatePowerup(type);
  }

  activatePowerup(type) {
    const now = this.time.now;

    if (type === 'rocket') {
      this.activeEffects.rocketUntil = now + GameConfig.powerups.rocketDuration;
    } else if (type === 'laser') {
      this.activeEffects.laserUntil = now + GameConfig.powerups.laserDuration;
      this.nextLaserShotAt = now;
    } else if (type === 'shield') {
      this.activeEffects.shieldUntil = now + GameConfig.powerups.shieldDuration;
    }

    this.refreshStatusMessage();
  }

  updatePowerupEffects() {
    const now = this.time.now;
    const nextFlags = {
      rocket: this.activeEffects.rocketUntil > now,
      laser: this.activeEffects.laserUntil > now,
      shield: this.activeEffects.shieldUntil > now,
    };

    if (nextFlags.rocket) {
      this.player.setVelocityY(-GameConfig.powerups.rocketFlySpeed);
    }

    this.shieldAura.setVisible(nextFlags.shield);
    this.shieldAura.setPosition(this.player.x, this.player.y);

    if (nextFlags.laser && now >= this.nextLaserShotAt) {
      this.fireLaserShot();
      this.nextLaserShotAt = now + GameConfig.powerups.laserFireInterval;
    }

    if (
      nextFlags.rocket !== this.effectFlags.rocket
      || nextFlags.laser !== this.effectFlags.laser
      || nextFlags.shield !== this.effectFlags.shield
    ) {
      this.effectFlags = nextFlags;
      this.refreshStatusMessage();
    }
  }

  updateProjectiles() {
    this.lasers.getChildren().forEach((laser) => {
      if (laser.active) {
        laser.body.updateFromGameObject();
      }
    });
  }

  fireLaserShot() {
    const laser = this.physics.add.image(
      this.player.x,
      this.player.y - this.player.displayHeight * 0.7,
      'powerup_laser_beam'
    );
    laser.setImmovable(true);
    laser.body.allowGravity = false;
    laser.setDepth(8);
    laser.setDisplaySize(GameConfig.powerups.laserWidth, GameConfig.powerups.laserHeight);
    laser.body.setSize(GameConfig.powerups.laserBodyWidth, GameConfig.powerups.laserBodyHeight);
    laser.body.setOffset(
      (GameConfig.powerups.laserWidth - GameConfig.powerups.laserBodyWidth) * 0.5,
      (GameConfig.powerups.laserHeight - GameConfig.powerups.laserBodyHeight) * 0.5
    );
    laser.setVelocityY(-GameConfig.powerups.laserSpeed);
    this.lasers.add(laser);
  }

  handleLaserEnemyOverlap(laser, enemy) {
    if (!laser.active || !enemy.active) {
      return;
    }

    laser.destroy();
    this.destroyHazard(enemy);
  }

  handleEnemyOverlap(_, enemy) {
    this.resolveHazardOverlap(enemy, '撞上了涂鸦怪');
  }

  handleTrapOverlap(_, trap) {
    this.resolveHazardOverlap(trap, '踩到了尖刺陷阱');
  }

  resolveHazardOverlap(hazard, reason) {
    if (!hazard.active) {
      return;
    }

    if (this.activeEffects.rocketUntil > this.time.now) {
      return;
    }

    if (this.activeEffects.shieldUntil > this.time.now) {
      this.activeEffects.shieldUntil = 0;
      this.destroyHazard(hazard);
      this.refreshStatusMessage();
      return;
    }

    this.triggerHazardFailure(reason);
  }

  triggerHazardFailure(reason) {
    if (this.isGameOver) {
      return;
    }

    this.gameOverReason = reason;
    this.endRun(0xf28482);
  }

  destroyPowerup(powerup) {
    if (!powerup || !powerup.active) {
      return;
    }

    const host = powerup.getData('host');
    if (host && host.active) {
      host.setData('hasPowerup', false);
    }

    powerup.destroy();
  }

  destroyHazard(hazard) {
    if (!hazard || !hazard.active) {
      return;
    }

    const host = hazard.getData('host');
    if (host && host.active) {
      host.setData('hasHazard', false);
    }

    hazard.destroy();
  }

  clearPowerupEffects() {
    this.activeEffects.rocketUntil = 0;
    this.activeEffects.laserUntil = 0;
    this.activeEffects.shieldUntil = 0;
    this.effectFlags = {
      rocket: false,
      laser: false,
      shield: false,
    };
    this.shieldAura.setVisible(false);
  }

  refreshStatusMessage() {
    if (this.isGameOver) {
      return;
    }

    const effects = [];

    if (this.activeEffects.rocketUntil > this.time.now) {
      effects.push('火箭推进中');
    }

    if (this.activeEffects.laserUntil > this.time.now) {
      effects.push('激光枪连射中');
    }

    if (this.activeEffects.shieldUntil > this.time.now) {
      effects.push('保护罩待命');
    }

    const text = effects.length > 0
      ? `左右移动，自动跳跃，${effects.join('，')}。`
      : '左右移动，自动跳跃，留意尖刺和涂鸦怪。';
    this.bus.emit('status-changed', text);
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
    platform.setData('hasSpring', false);
    platform.setData('hasPowerup', false);
    platform.setData('hasHazard', false);

    if (type === 'moving') {
      const speed = Phaser.Math.Between(GameConfig.platform.movingSpeedMin, GameConfig.platform.movingSpeedMax) * (Math.random() > 0.5 ? 1 : -1);
      platform.setData('speed', speed);
    }

    this.platforms.add(platform);

    if (type !== 'breaking') {
      this.trySpawnSpring(platform);
      this.trySpawnPowerup(platform);
      this.trySpawnHazard(platform);
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

    const spring = this.physics.add.image(
      platform.x,
      platform.y - platform.displayHeight * GameConfig.platform.springVerticalOffsetRatio,
      'spring_idle'
    );
    spring.setImmovable(true);
    spring.body.allowGravity = false;
    spring.setDepth(6);
    spring.body.setSize(18, 28);
    spring.body.setOffset(7, 4);
    spring.setDataEnabled();
    spring.setData('host', platform);
    spring.setData('used', false);
    spring.setData('offsetX', Phaser.Math.Between(-platform.displayWidth * 0.22, platform.displayWidth * 0.22));
    platform.setData('hasSpring', true);
    this.springs.add(spring);
  }

  trySpawnHazard(platform) {
    if (platform.getData('hasSpring') || platform.getData('hasPowerup') || platform.getData('hasHazard')) {
      return;
    }

    const travelHeight = this.getTravelHeightForY(platform.y);
    const futureScore = this.getScoreForTravelHeight(travelHeight);
    const difficulty = this.getDifficulty(travelHeight);

    if (
      platform.getData('type') === 'static'
      && futureScore >= GameConfig.hazards.trapStartScore
      && Math.random() < GameConfig.hazards.trapChanceBase + difficulty * GameConfig.hazards.trapChanceGrowth
    ) {
      this.spawnTrap(platform);
      return;
    }

    if (
      futureScore >= GameConfig.hazards.enemyStartScore
      && Math.random() < GameConfig.hazards.enemyChanceBase + difficulty * GameConfig.hazards.enemyChanceGrowth
    ) {
      this.spawnEnemy(platform);
    }
  }

  trySpawnPowerup(platform) {
    if (platform.getData('hasSpring') || platform.getData('hasPowerup') || platform.getData('hasHazard')) {
      return;
    }

    const travelHeight = this.getTravelHeightForY(platform.y);
    const futureScore = this.getScoreForTravelHeight(travelHeight);
    const difficulty = this.getDifficulty(travelHeight);
    const candidates = [];

    if (
      futureScore >= GameConfig.powerups.rocketStartScore
      && Math.random() < GameConfig.powerups.rocketChanceBase + difficulty * GameConfig.powerups.rocketChanceGrowth
    ) {
      candidates.push('rocket');
    }

    if (
      futureScore >= GameConfig.powerups.laserStartScore
      && Math.random() < GameConfig.powerups.laserChanceBase + difficulty * GameConfig.powerups.laserChanceGrowth
    ) {
      candidates.push('laser');
    }

    if (
      futureScore >= GameConfig.powerups.shieldStartScore
      && Math.random() < GameConfig.powerups.shieldChanceBase + difficulty * GameConfig.powerups.shieldChanceGrowth
    ) {
      candidates.push('shield');
    }

    if (candidates.length === 0) {
      return;
    }

    this.spawnPowerup(platform, Phaser.Utils.Array.GetRandom(candidates));
  }

  spawnPowerup(platform, type) {
    const textureMap = {
      rocket: 'powerup_rocket',
      laser: 'powerup_laser',
      shield: 'powerup_shield',
    };
    const powerup = this.physics.add.image(
      platform.x,
      platform.y - GameConfig.powerups.floatOffsetY,
      textureMap[type]
    );

    powerup.setImmovable(true);
    powerup.body.allowGravity = false;
    powerup.setDepth(6);
    powerup.body.setSize(GameConfig.powerups.pickupBodySize, GameConfig.powerups.pickupBodySize);
    powerup.body.setOffset(GameConfig.powerups.pickupBodyOffset, GameConfig.powerups.pickupBodyOffset);
    powerup.setDataEnabled();
    powerup.setData('host', platform);
    powerup.setData('type', type);
    powerup.setData(
      'offsetX',
      Phaser.Math.FloatBetween(
        -platform.displayWidth * GameConfig.powerups.sideOffsetRatio,
        platform.displayWidth * GameConfig.powerups.sideOffsetRatio
      )
    );
    powerup.setData('offsetY', GameConfig.powerups.floatOffsetY);
    platform.setData('hasPowerup', true);
    this.powerups.add(powerup);
  }

  spawnTrap(platform) {
    const maxAllowedTrapWidth = platform.displayWidth * GameConfig.hazards.trapWidthRatioMax;
    const trapWidth = Math.min(GameConfig.hazards.trapBaseWidth, maxAllowedTrapWidth);
    const trapHeight = (trapWidth / GameConfig.hazards.trapBaseWidth) * GameConfig.hazards.trapBaseHeight;
    const offsetLimit = Math.max(
      0,
      platform.displayWidth * 0.5 - trapWidth * 0.5 - GameConfig.hazards.trapSidePadding
    );
    const offsetX = offsetLimit > 0 ? Phaser.Math.FloatBetween(-offsetLimit, offsetLimit) : 0;
    const trap = this.physics.add.image(
      platform.x + offsetX,
      platform.y - platform.displayHeight * GameConfig.hazards.trapVerticalOffsetRatio,
      'hazard_trap'
    );
    const bodyWidth = Math.max(GameConfig.hazards.trapBodyMinWidth, trapWidth - GameConfig.hazards.trapBodyWidthInset);
    const bodyHeight = Math.max(GameConfig.hazards.trapBodyMinHeight, trapHeight - GameConfig.hazards.trapBodyHeightInset);

    trap.setImmovable(true);
    trap.body.allowGravity = false;
    trap.setDepth(7);
    trap.setDisplaySize(trapWidth, trapHeight);
    trap.body.setSize(bodyWidth, bodyHeight);
    trap.body.setOffset((trapWidth - bodyWidth) * 0.5, (trapHeight - bodyHeight) * 0.5);
    trap.setDataEnabled();
    trap.setData('host', platform);
    trap.setData('offsetX', offsetX);
    platform.setData('hasHazard', true);
    this.traps.add(trap);
  }

  spawnEnemy(platform) {
    const axis = Math.random() < GameConfig.hazards.enemyVerticalMoveChance ? 'vertical' : 'horizontal';
    const sideDirection = Math.random() > 0.5 ? 1 : -1;
    const baseOffsetX = sideDirection * (
      platform.displayWidth * 0.5
      + Phaser.Math.Between(
        GameConfig.hazards.enemySpawnSideClearanceMin,
        GameConfig.hazards.enemySpawnSideClearanceMax
      )
    );
    const baseOffsetY = Phaser.Math.Between(
      GameConfig.hazards.enemyFloatHeightMin,
      GameConfig.hazards.enemyFloatHeightMax
    );
    const range = axis === 'vertical'
      ? Phaser.Math.Between(GameConfig.hazards.enemyVerticalRangeMin, GameConfig.hazards.enemyVerticalRangeMax)
      : Phaser.Math.Between(GameConfig.hazards.enemyHorizontalRangeMin, GameConfig.hazards.enemyHorizontalRangeMax);
    const enemy = this.physics.add.image(platform.x + baseOffsetX, platform.y - baseOffsetY, 'hazard_enemy');

    enemy.setImmovable(true);
    enemy.body.allowGravity = false;
    enemy.setDepth(7);
    enemy.body.setSize(GameConfig.hazards.enemyBodyWidth, GameConfig.hazards.enemyBodyHeight);
    enemy.body.setOffset(GameConfig.hazards.enemyBodyOffsetX, GameConfig.hazards.enemyBodyOffsetY);
    enemy.setDataEnabled();
    enemy.setData('host', platform);
    enemy.setData('axis', axis);
    enemy.setData('baseOffsetX', baseOffsetX);
    enemy.setData('baseOffsetY', baseOffsetY);
    enemy.setData('range', range);
    enemy.setData('offsetX', 0);
    enemy.setData('offsetY', 0);
    enemy.setData('direction', Math.random() > 0.5 ? 1 : -1);
    enemy.setData('speed', Phaser.Math.Between(GameConfig.hazards.enemySpeedMin, GameConfig.hazards.enemySpeedMax));
    enemy.setFlipX(axis === 'horizontal' && enemy.getData('direction') < 0);
    platform.setData('hasHazard', true);
    this.enemies.add(enemy);
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

  getScoreForTravelHeight(travelHeight) {
    return Math.max(0, Math.floor(travelHeight / GameConfig.scoring.pixelsPerPoint));
  }

  syncScore(force) {
    const nextScore = this.getScoreForTravelHeight(this.getTravelHeightForY(this.bestPlayerY));
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

  playSurfaceSound(soundKey) {
    const notes = GameConfig.audio[soundKey];
    const context = this.sound && this.sound.context;
    if (!notes || !context) {
      return;
    }

    if (context.state === 'suspended') {
      context.resume().catch(() => {});
      if (context.state === 'suspended') {
        return;
      }
    }

    const now = context.currentTime;
    notes.forEach((note) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const delay = note.delay || 0;
      const startTime = now + delay;
      const endTime = startTime + note.duration;

      oscillator.type = note.wave;
      oscillator.frequency.setValueAtTime(note.startFreq, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(note.endFreq, endTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(note.volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.02);
    });
  }
}
