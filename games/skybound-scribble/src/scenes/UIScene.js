class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.bus = this.game.events;
    this.shopRows = {};
    this.isShopOpen = false;
    this.lastGameOverPayload = null;

    this.createPanel();
    this.createTexts();
    this.createGameOverOverlay();
    this.createShopOverlay();
    this.registerEvents();

    this.handleScoreChanged(0);
    this.handleCoinsChanged(0);
    this.handleBestScoreChanged(this.getStoredBestScore());
    this.handleStatusChanged('左右移动，自动跳跃，留意尖刺和涂鸦怪。');
    this.updateShopTexts();
  }

  createPanel() {
    this.add.rectangle(16, 16, 224, 152, 0xffffff, 0.72)
      .setOrigin(0, 0)
      .setStrokeStyle(3, 0x2d2a32)
      .setScrollFactor(0)
      .setDepth(100);
  }

  createTexts() {
    const sharedStyle = {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      color: '#2d2a32',
      stroke: '#faf4e5',
      strokeThickness: 4,
    };

    this.titleText = this.add.text(28, 24, 'Skybound Scribble', {
      ...sharedStyle,
      fontSize: '26px',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(101);

    this.scoreText = this.add.text(28, 60, '分数：0', {
      ...sharedStyle,
      fontSize: '22px',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(101);

    this.bestText = this.add.text(28, 88, '最高：0', {
      ...sharedStyle,
      fontSize: '18px',
    }).setScrollFactor(0).setDepth(101);

    this.coinsText = this.add.text(28, 114, '本局金币：0', {
      ...sharedStyle,
      fontSize: '18px',
    }).setScrollFactor(0).setDepth(101);

    this.statusText = this.add.text(20, GameConfig.height - 62, '', {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#2d2a32',
      backgroundColor: '#ffffffb3',
      padding: { left: 10, right: 10, top: 8, bottom: 8 },
      align: 'center',
      wordWrap: { width: GameConfig.width - 40 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
  }

  createGameOverOverlay() {
    this.overlayBackdrop = this.add.rectangle(
      GameConfig.width * 0.5,
      GameConfig.height * 0.5,
      GameConfig.width,
      GameConfig.height,
      0x2d2a32,
      0.42
    ).setScrollFactor(0).setDepth(130).setVisible(false);

    this.overlayCard = this.add.rectangle(
      GameConfig.width * 0.5,
      GameConfig.height * 0.5,
      360,
      244,
      0xfaf4e5,
      0.98
    ).setScrollFactor(0).setDepth(131).setStrokeStyle(4, 0x2d2a32).setVisible(false);

    this.gameOverTitle = this.add.text(GameConfig.width * 0.5, 236, '本局结束', {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#2d2a32',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(132).setVisible(false);

    this.gameOverSummary = this.add.text(GameConfig.width * 0.5, 304, '', {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      fontSize: '20px',
      color: '#2d2a32',
      align: 'center',
      wordWrap: { width: 300 },
      lineSpacing: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(132).setVisible(false);

    this.restartButton = this.createButton(GameConfig.width * 0.5 - 84, 416, 132, 48, '重新开始', () => {
      this.closeShop();
      this.hideGameOverOverlay();
      this.scene.get('GameScene').scene.restart();
    }, 132);

    this.shopButton = this.createButton(GameConfig.width * 0.5 + 84, 416, 132, 48, '商店', () => {
      this.openShop();
    }, 132);

    this.setButtonVisible(this.restartButton, false);
    this.setButtonVisible(this.shopButton, false);
  }

  createShopOverlay() {
    this.shopBackdrop = this.add.rectangle(
      GameConfig.width * 0.5,
      GameConfig.height * 0.5,
      GameConfig.width,
      GameConfig.height,
      0x1f1d24,
      0.5
    ).setScrollFactor(0).setDepth(140).setVisible(false);

    this.shopCard = this.add.rectangle(
      GameConfig.width * 0.5,
      GameConfig.height * 0.5,
      392,
      520,
      0xfffcf3,
      1
    ).setScrollFactor(0).setDepth(141).setStrokeStyle(4, 0x2d2a32).setVisible(false);

    this.shopTitle = this.add.text(GameConfig.width * 0.5, 118, '道具商店', {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#2d2a32',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(142).setVisible(false);

    this.shopCoinsText = this.add.text(GameConfig.width * 0.5, 154, '', {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#2d2a32',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(142).setVisible(false);

    let rowY = 212;
    Object.entries(GameConfig.shop.upgrades).forEach(([key, config]) => {
      const background = this.add.rectangle(GameConfig.width * 0.5, rowY, 336, 78, 0xffffff, 0.96)
        .setScrollFactor(0)
        .setDepth(142)
        .setStrokeStyle(2, 0x2d2a32)
        .setVisible(false);

      const title = this.add.text(88, rowY - 22, config.label, {
        fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#2d2a32',
      }).setScrollFactor(0).setDepth(143).setVisible(false);

      const description = this.add.text(88, rowY + 2, config.description, {
        fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
        fontSize: '14px',
        color: '#605a66',
      }).setScrollFactor(0).setDepth(143).setVisible(false);

      const levelText = this.add.text(88, rowY + 24, '', {
        fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
        fontSize: '14px',
        color: '#2d2a32',
      }).setScrollFactor(0).setDepth(143).setVisible(false);

      const buyButton = this.createButton(356, rowY, 78, 38, '升级', () => {
        this.purchaseUpgrade(key);
      }, 143);
      this.setButtonVisible(buyButton, false);

      this.shopRows[key] = {
        background,
        title,
        description,
        levelText,
        buyButton,
      };

      rowY += 92;
    });

    this.shopHintText = this.add.text(GameConfig.width * 0.5, 466, '', {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      fontSize: '16px',
      color: '#7a6c58',
      align: 'center',
      wordWrap: { width: 320 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(142).setVisible(false);

    this.shopCloseButton = this.createButton(GameConfig.width * 0.5, 548, 136, 44, '关闭商店', () => {
      this.closeShop();
    }, 143);
    this.setButtonVisible(this.shopCloseButton, false);
  }

  createButton(x, y, width, height, label, onClick, depth) {
    const background = this.add.rectangle(x, y, width, height, 0xffd87a, 1)
      .setScrollFactor(0)
      .setDepth(depth)
      .setStrokeStyle(3, 0x2d2a32)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: '"Trebuchet MS", "Microsoft YaHei", sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#2d2a32',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

    const button = {
      background,
      text,
      defaultColor: 0xffd87a,
    };

    background.on('pointerdown', onClick);
    background.on('pointerover', () => background.setFillStyle(0xffe39e, 1));
    background.on('pointerout', () => background.setFillStyle(button.defaultColor, 1));

    return button;
  }

  setButtonVisible(button, visible) {
    button.background.setVisible(visible);
    button.text.setVisible(visible);
    if (visible) {
      button.background.setInteractive({ useHandCursor: true });
    } else {
      button.background.disableInteractive();
    }
  }

  registerEvents() {
    this.bus.on('score-changed', this.handleScoreChanged, this);
    this.bus.on('coins-changed', this.handleCoinsChanged, this);
    this.bus.on('best-score-changed', this.handleBestScoreChanged, this);
    this.bus.on('status-changed', this.handleStatusChanged, this);
    this.bus.on('game-over', this.handleGameOver, this);

    this.events.once('shutdown', () => {
      this.bus.off('score-changed', this.handleScoreChanged, this);
      this.bus.off('coins-changed', this.handleCoinsChanged, this);
      this.bus.off('best-score-changed', this.handleBestScoreChanged, this);
      this.bus.off('status-changed', this.handleStatusChanged, this);
      this.bus.off('game-over', this.handleGameOver, this);
    });
  }

  handleScoreChanged(score) {
    this.scoreText.setText(`分数：${score}`);
  }

  handleCoinsChanged(coins) {
    this.coinsText.setText(`本局金币：${coins}`);
  }

  handleBestScoreChanged(score) {
    this.bestText.setText(`最高：${score}`);
  }

  handleStatusChanged(text) {
    this.statusText.setText(text);
  }

  handleGameOver(payload) {
    this.lastGameOverPayload = payload;
    this.handleBestScoreChanged(payload.bestScore);
    this.handleStatusChanged(`${payload.reason} · 本局 ${payload.score} 分`);
    this.refreshGameOverSummary();
    this.showGameOverOverlay();
    this.updateShopTexts();
  }

  showGameOverOverlay() {
    this.overlayBackdrop.setVisible(true);
    this.overlayCard.setVisible(true);
    this.gameOverTitle.setVisible(true);
    this.gameOverSummary.setVisible(true);
    this.setButtonVisible(this.restartButton, true);
    this.setButtonVisible(this.shopButton, true);
  }

  hideGameOverOverlay() {
    this.overlayBackdrop.setVisible(false);
    this.overlayCard.setVisible(false);
    this.gameOverTitle.setVisible(false);
    this.gameOverSummary.setVisible(false);
    this.setButtonVisible(this.restartButton, false);
    this.setButtonVisible(this.shopButton, false);
  }

  openShop() {
    this.isShopOpen = true;
    this.shopBackdrop.setVisible(true);
    this.shopCard.setVisible(true);
    this.shopTitle.setVisible(true);
    this.shopCoinsText.setVisible(true);
    this.shopHintText.setVisible(true);
    this.shopHintText.setText('升级后将在下一局立即生效。');
    this.setButtonVisible(this.shopCloseButton, true);

    Object.values(this.shopRows).forEach((row) => {
      row.background.setVisible(true);
      row.title.setVisible(true);
      row.description.setVisible(true);
      row.levelText.setVisible(true);
      this.setButtonVisible(row.buyButton, true);
    });

    this.updateShopTexts();
  }

  closeShop() {
    this.isShopOpen = false;
    this.shopBackdrop.setVisible(false);
    this.shopCard.setVisible(false);
    this.shopTitle.setVisible(false);
    this.shopCoinsText.setVisible(false);
    this.shopHintText.setVisible(false);
    this.setButtonVisible(this.shopCloseButton, false);

    Object.values(this.shopRows).forEach((row) => {
      row.background.setVisible(false);
      row.title.setVisible(false);
      row.description.setVisible(false);
      row.levelText.setVisible(false);
      this.setButtonVisible(row.buyButton, false);
    });
  }

  purchaseUpgrade(key) {
    const config = GameConfig.shop.upgrades[key];
    const upgrades = this.getStoredUpgrades();
    const currentLevel = upgrades[key] || 0;

    if (currentLevel >= config.prices.length) {
      this.shopHintText.setText(`${config.label}已满级。`);
      return;
    }

    const price = config.prices[currentLevel];
    const totalCoins = this.getStoredTotalCoins();
    if (totalCoins < price) {
      this.shopHintText.setText(`金币不足，还需要 ${price - totalCoins} 金币。`);
      return;
    }

    upgrades[key] = currentLevel + 1;
    this.saveStoredUpgrades(upgrades);
    this.saveStoredTotalCoins(totalCoins - price);
    this.shopHintText.setText(`${config.label}升级成功，花费 ${price} 金币。`);
    this.updateShopTexts();
  }

  updateShopTexts() {
    const upgrades = this.getStoredUpgrades();
    const totalCoins = this.getStoredTotalCoins();
    this.shopCoinsText.setText(`累计金币：${totalCoins}`);
    this.refreshGameOverSummary();

    Object.entries(GameConfig.shop.upgrades).forEach(([key, config]) => {
      const level = upgrades[key] || 0;
      const maxLevel = config.bonuses.length - 1;
      const row = this.shopRows[key];
      const effectText = this.formatUpgradeEffect(key, level);
      row.levelText.setText(`等级 ${level}/${maxLevel} · 当前效果：${effectText}`);

      if (level >= config.prices.length) {
        row.buyButton.text.setText('满级');
        this.setButtonColor(row.buyButton, 0xb9e3a6);
      } else {
        row.buyButton.text.setText(`${config.prices[level]} 金币`);
        this.setButtonColor(row.buyButton, totalCoins >= config.prices[level] ? 0xffd87a : 0xd0d0d0);
      }
    });
  }

  refreshGameOverSummary() {
    if (!this.lastGameOverPayload) {
      return;
    }

    this.gameOverSummary.setText(
      `${this.lastGameOverPayload.reason}\n本局分数：${this.lastGameOverPayload.score}\n本局金币：${this.lastGameOverPayload.coins}\n累计金币：${this.getStoredTotalCoins()}`
    );
  }

  formatUpgradeEffect(key, level) {
    const config = GameConfig.shop.upgrades[key];
    const bonus = config.bonuses[level] || 0;

    if (key === 'luck') {
      return `+${Math.round(bonus * 100)}%`;
    }

    return `${GameConfig.powerups[key] + bonus}ms`;
  }

  getStoredBestScore() {
    try {
      return Number(window.localStorage.getItem(GameConfig.storage.bestScore) || 0);
    } catch (error) {
      return 0;
    }
  }

  getStoredTotalCoins() {
    try {
      return Number(window.localStorage.getItem(GameConfig.storage.totalCoins) || 0);
    } catch (error) {
      return 0;
    }
  }

  saveStoredTotalCoins(totalCoins) {
    try {
      window.localStorage.setItem(GameConfig.storage.totalCoins, String(totalCoins));
    } catch (error) {}
  }

  getStoredUpgrades() {
    const defaults = Object.keys(GameConfig.shop.upgrades).reduce((result, key) => {
      result[key] = 0;
      return result;
    }, {});

    try {
      const raw = window.localStorage.getItem(GameConfig.storage.upgrades);
      if (!raw) {
        return defaults;
      }

      return {
        ...defaults,
        ...JSON.parse(raw),
      };
    } catch (error) {
      return defaults;
    }
  }

  saveStoredUpgrades(upgrades) {
    try {
      window.localStorage.setItem(GameConfig.storage.upgrades, JSON.stringify(upgrades));
    } catch (error) {}
  }

  setButtonColor(button, color) {
    button.defaultColor = color;
    button.background.setFillStyle(color, 1);
  }
}
