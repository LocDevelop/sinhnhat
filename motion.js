/* Animation state is independent of the renderer so cancellation and recovery stay predictable. */
(() => {
  class ChargeMotion {
    constructor() { this.reset(); }
    reset() { this.phase = 'idle'; this.charge = 0; this.scale = 1; this.time = 0; }
    press() {
      if (this.phase !== 'idle') return false;
      this.phase = 'holding'; this.time = 0; return true;
    }
    release(cancelled = false) {
      if (this.phase !== 'holding') return false;
      if (cancelled) { this.reset(); return false; }
      this.phase = 'burst'; this.time = 0; return true;
    }
    step(seconds, reduced = false) {
      seconds = Math.max(0, Math.min(seconds, .05));
      this.time += seconds;
      if (this.phase === 'holding') {
        this.charge = Math.min(1, this.charge + seconds / 1.7);
        this.scale = 1 + this.charge * (reduced ? .08 : .42);
      } else if (this.phase === 'burst' && this.time >= (reduced ? .1 : .65)) {
        this.phase = 'recovering'; this.time = 0;
      } else if (this.phase === 'recovering') {
        this.scale += (1 - this.scale) * (1 - Math.exp(-seconds * 6));
        if (this.time >= (reduced ? .1 : 2.2)) this.reset();
      }
      return this.phase;
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { ChargeMotion };
  else window.ChargeMotion = ChargeMotion;
})();
