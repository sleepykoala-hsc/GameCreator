/**
 * shared/utils/input.js
 * Unified input abstraction for keyboard + touch/pointer.
 * Keeps core game logic independent of browser input APIs.
 * Unity equivalent: Input.GetKey / Input.GetAxis abstraction layer.
 *
 * Usage:
 *   const input = new InputManager();
 *   input.init();
 *
 *   // In your game update loop:
 *   if (input.isPressed('left'))  { ... }
 *   if (input.isPressed('right')) { ... }
 *   if (input.isPressed('jump'))  { ... }
 *   if (input.isPressed('fire'))  { ... }
 */

class InputManager {
  constructor() {
    // Logical action → currently held?
    this._actions = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      fire: false,
    };

    // Touch tracking
    this._touchStart = null;
    this._swipeThreshold = 30; // px
  }

  /** Call once to attach event listeners. */
  init() {
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));
    window.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: true });
    window.addEventListener('touchend', (e) => this._onTouchEnd(e), { passive: true });
  }

  /** Returns true while the action is held. */
  isPressed(action) {
    return !!this._actions[action];
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _onKeyDown(e) {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': this._actions.left  = true; break;
      case 'ArrowRight': case 'KeyD': this._actions.right = true; break;
      case 'ArrowUp':    case 'KeyW': this._actions.up    = true; break;
      case 'ArrowDown':  case 'KeyS': this._actions.down  = true; break;
      case 'Space':                   this._actions.jump  = true; break;
      case 'KeyZ': case 'KeyJ':       this._actions.fire  = true; break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': this._actions.left  = false; break;
      case 'ArrowRight': case 'KeyD': this._actions.right = false; break;
      case 'ArrowUp':    case 'KeyW': this._actions.up    = false; break;
      case 'ArrowDown':  case 'KeyS': this._actions.down  = false; break;
      case 'Space':                   this._actions.jump  = false; break;
      case 'KeyZ': case 'KeyJ':       this._actions.fire  = false; break;
    }
  }

  _onTouchStart(e) {
    const t = e.touches[0];
    this._touchStart = { x: t.clientX, y: t.clientY };
  }

  _onTouchEnd(e) {
    if (!this._touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this._touchStart.x;
    const dy = t.clientY - this._touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < this._swipeThreshold && absDy < this._swipeThreshold) {
      // Tap → jump / fire
      this._actions.jump = true;
      setTimeout(() => { this._actions.jump = false; }, 100);
    } else if (absDx > absDy) {
      // Horizontal swipe
      if (dx > 0) {
        this._actions.right = true;
        setTimeout(() => { this._actions.right = false; }, 200);
      } else {
        this._actions.left = true;
        setTimeout(() => { this._actions.left = false; }, 200);
      }
    } else {
      // Vertical swipe
      if (dy < 0) {
        this._actions.up = true;
        setTimeout(() => { this._actions.up = false; }, 200);
      } else {
        this._actions.down = true;
        setTimeout(() => { this._actions.down = false; }, 200);
      }
    }

    this._touchStart = null;
  }
}
