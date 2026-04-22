# games/shared/assets/

Place reusable assets here that are shared across multiple games.

Suggested sub-folders:

```
shared/assets/
├── fonts/        # Web fonts (e.g. a pixel font .woff2)
├── audio/        # Shared sound effects / music
└── images/       # Shared sprites or UI elements (buttons, icons)
```

## Asset Naming Convention

| Rule | Example |
|------|---------|
| Lowercase letters only | ✅ `player_idle.png` |
| Words separated by underscore | ✅ `enemy_walk_01.png` |
| No spaces or special characters | ❌ `Player Idle.png` |
| Include variant/frame index | ✅ `coin_spin_03.png` |

These conventions match Unity's recommended asset naming, so assets can be imported without renaming.
