# GameCreator

A collection of browser-based JavaScript games built with modern game frameworks, designed with Unity mobile portability in mind.

## 项目结构 / Project Structure

```
GameCreator/
├── games/
│   ├── shared/          # Shared utilities, assets, and helpers
│   └── <game-name>/     # Each game lives in its own folder
│       ├── index.html
│       ├── src/
│       └── assets/
└── README.md
```

## 技术栈 / Tech Stack

| Type | Framework | Notes |
|------|-----------|-------|
| 2D Games | [Phaser 3](https://phaser.io/) | Rich 2D engine, physics, tilemaps |
| 2D Games | [PixiJS](https://pixijs.com/) | Fast WebGL renderer, lightweight |
| 3D Games | [Babylon.js](https://www.babylonjs.com/) | Full 3D engine, closest to Unity concepts |
| 3D Games | [Three.js](https://threejs.org/) | Lightweight 3D rendering |

## Unity 移植性考虑 / Unity Portability Considerations

Each game is built following these conventions to ease future Unity mobile porting:

- **Scene / State separation**: Game logic is separated into scenes or states (matching Unity's Scene model).
- **Component-like architecture**: Game objects follow a component pattern similar to Unity's `MonoBehaviour`.
- **Asset naming**: Assets use lowercase + underscores (compatible with Unity import conventions).
- **No DOM dependency in game logic**: Game logic never reads/writes HTML elements directly — it only communicates through a thin UI layer.
- **Fixed update loop**: Physics/input are processed in a fixed update loop (mirrors Unity's `FixedUpdate` / `Update`).
- **Config-driven**: Game parameters (speed, size, difficulty) live in a dedicated config file, not scattered in code.

## 游戏列表 / Games

| Folder | Framework | Status |
|--------|-----------|--------|
| *(more games coming soon)* | — | — |

## 开发规范 / Development Conventions

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- How to add a new game
- Folder structure template
- Coding style guide
- Asset guidelines