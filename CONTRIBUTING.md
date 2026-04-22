# Contributing — How to Add a New Game

## 1. 新建游戏文件夹 / Create a Game Folder

Each game lives under `games/<game-name>/`. Use lowercase with hyphens.

```
games/
└── my-cool-game/
    ├── index.html       # Entry point (loads framework CDN + your scripts)
    ├── package.json     # Optional: if using npm/bundler
    ├── src/
    │   ├── main.js      # Bootstrap: creates the game instance
    │   ├── config.js    # All tunable parameters (speed, size, levels, …)
    │   ├── scenes/      # One file per scene/state
    │   └── entities/    # Game objects (player, enemy, …)
    └── assets/
        ├── images/
        ├── audio/
        └── tilemaps/
```

## 2. 选择框架 / Choose a Framework

| Use case | Recommendation |
|----------|----------------|
| 2D platformer / top-down / puzzle | **Phaser 3** |
| 2D particles / UI-heavy visual | **PixiJS** |
| 3D casual / hyper-casual | **Babylon.js** *(closest Unity feel)* |
| 3D custom rendering | **Three.js** |

Load frameworks via CDN in `index.html` — no bundler required for simple games.

## 3. 最小 index.html 模板 / Minimal index.html Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Cool Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
  <!-- Example: Phaser 3 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
  <script src="src/config.js"></script>
  <script src="src/main.js"></script>
</body>
</html>
```

## 4. config.js 结构 / config.js Structure

```js
// config.js — all magic numbers live here
const GameConfig = {
  width: 800,
  height: 600,
  gravity: 300,
  playerSpeed: 200,
  enemySpeed: 100,
  // … add more as needed
};
```

## 5. 代码规范 / Coding Style

- **ES6+**: use `const`/`let`, arrow functions, classes.
- **Component pattern**: wrap game-object logic in classes (maps to Unity `MonoBehaviour`).
- **Scene/State files**: one scene per file, named `BootScene.js`, `GameScene.js`, `UIScene.js`, etc.
- **No direct DOM manipulation** inside scene/entity files.
- **Asset filenames**: `snake_case` (e.g. `player_idle.png`, not `PlayerIdle.png`).

## 6. Unity 移植检查清单 / Unity Portability Checklist

Before considering a game "done", verify:

- [ ] Game logic is in scene/entity classes, not in global scope.
- [ ] All parameters are in `config.js`.
- [ ] Asset paths reference `assets/` folder only (no absolute paths).
- [ ] No browser-specific APIs inside core game logic (keep them in a `platform/` adapter if needed).
- [ ] Input handling is abstracted (touch/keyboard mapped to the same actions).

## 7. 更新 README 游戏列表 / Update the Game List

Add a row to the **Games** table in `README.md`:

```markdown
| my-cool-game | Phaser 3 | ✅ Complete |
```
