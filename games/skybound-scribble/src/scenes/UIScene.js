class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.bus = this.game.events;

    this.createPanel();
    this.createTexts();
    this.registerEvents();

    this.handleScoreChanged(0);
    this.handleBestScoreChanged(this.getStoredBestScore());
    this.handleStatusChanged('左右移动，自动跳跃，留意尖刺和涂鸦怪。');
  }

  createPanel() {
    this.add.rectangle(16, 16, 210, 124, 0xffffff, 0.7)
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

    this.scoreText = this.add.text(28, 62, '分数：0', {
      ...sharedStyle,
      fontSize: '22px',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(101);

    this.bestText = this.add.text(28, 92, '最高：0', {
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

  registerEvents() {
    this.bus.on('score-changed', this.handleScoreChanged, this);
    this.bus.on('best-score-changed', this.handleBestScoreChanged, this);
    this.bus.on('status-changed', this.handleStatusChanged, this);
    this.bus.on('game-over', this.handleGameOver, this);

    this.events.once('shutdown', () => {
      this.bus.off('score-changed', this.handleScoreChanged, this);
      this.bus.off('best-score-changed', this.handleBestScoreChanged, this);
      this.bus.off('status-changed', this.handleStatusChanged, this);
      this.bus.off('game-over', this.handleGameOver, this);
    });
  }

  handleScoreChanged(score) {
    this.scoreText.setText(`分数：${score}`);
  }

  handleBestScoreChanged(score) {
    this.bestText.setText(`最高：${score}`);
  }

  handleStatusChanged(text) {
    this.statusText.setText(text);
  }

  handleGameOver(payload) {
    this.handleBestScoreChanged(payload.bestScore);
    this.handleStatusChanged(`${payload.reason} · 本局 ${payload.score} 分 · 点击屏幕或空格重新开始`);
  }

  getStoredBestScore() {
    try {
      return Number(window.localStorage.getItem(GameConfig.storageKey) || 0);
    } catch (error) {
      return 0;
    }
  }
}
