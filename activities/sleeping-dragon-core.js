(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SleepingDragonCore = Object.freeze(api);
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const DRAGON_STATES = Object.freeze(['sleep', 'stir', 'drowsy', 'resettle', 'wake', 'awake', 'return']);

  function nextDragonState(current, target) {
    switch (current) {
      case 'sleep': return target === 0 ? 'sleep' : 'stir';
      case 'stir':
      case 'drowsy': return target === 0 ? 'resettle' : target === 2 ? 'wake' : 'drowsy';
      case 'wake':
      case 'awake': return 'return';
      case 'resettle':
      case 'return': return 'sleep';
      default: return 'sleep';
    }
  }

  class DragonStateMachine {
    constructor(initial) {
      this.current = DRAGON_STATES.includes(initial) ? initial : 'sleep';
      this.target = 0;
    }
    setTarget(target) {
      this.target = Math.max(0, Math.min(2, Math.round(Number(target) || 0)));
      return this.current;
    }
    advance(forced) {
      this.current = DRAGON_STATES.includes(forced) ? forced : nextDragonState(this.current, this.target);
      return this.current;
    }
  }

  class NoiseCounter {
    constructor() {
      this.limits = [3, 3];
      this.reset(0);
    }
    reset(stage, armed) {
      this.stage = stage === 1 ? 1 : 0;
      this.count = 0;
      this.armed = armed === undefined ? true : Boolean(armed);
      this.quietSince = null;
    }
    hold() {
      this.armed = false;
      this.quietSince = null;
    }
    sample(time, level, medium, high, canCount) {
      const threshold = this.stage === 0 ? medium : high;
      const permitted = canCount === undefined ? true : Boolean(canCount);
      if (level <= threshold - 3) this.armed = true;
      const crossing = level >= threshold && this.armed;
      if (level >= threshold) this.armed = false;
      if (level < medium - 4) {
        if (this.quietSince === null) this.quietSince = time;
        if (time - this.quietSince >= 2500) {
          this.count = 0;
          return 0;
        }
      } else {
        this.quietSince = null;
      }
      if (!permitted || !crossing) return null;
      this.count = Math.min(this.count + 1, this.limits[this.stage]);
      return this.count >= this.limits[this.stage] ? this.stage + 1 : null;
    }
  }

  return { DRAGON_STATES, nextDragonState, DragonStateMachine, NoiseCounter };
}));

