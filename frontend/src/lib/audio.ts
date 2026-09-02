// Web Audio API Synthesizer & Procedural BGM Engine for Elephant House AR Game
class SoundFX {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private bgmGainNode: GainNode | null = null;
  private bgmTimer: number | null = null;
  private isBgmPlaying: boolean = false;
  private currentStep: number = 0;

  // 128 BPM Tropical/Arcade Playful Melody (16-step loop)
  // Notes in Hz
  private readonly C3 = 130.81;
  private readonly G3 = 196.00;
  private readonly A3 = 220.00;
  private readonly F3 = 174.61;
  private readonly C4 = 261.63;
  private readonly D4 = 293.66;
  private readonly E4 = 329.63;
  private readonly G4 = 392.00;
  private readonly A4 = 440.00;
  private readonly C5 = 523.25;
  private readonly D5 = 587.33;
  private readonly E5 = 659.25;
  private readonly G5 = 783.99;

  // Melody pattern: [frequency or null, durationMultiplier]
  private readonly melodyPattern: Array<[number | null, number]> = [
    [this.C5, 1],
    [this.G4, 1],
    [this.A4, 1],
    [this.C5, 1],
    [this.D5, 1],
    [this.E5, 2],
    [null, 1],
    [this.D5, 1],
    [this.C5, 1],
    [this.A4, 1],
    [this.G4, 1],
    [this.A4, 1],
    [this.C5, 2],
    [this.D5, 1],
    [this.C5, 1],
    [null, 1]
  ];

  // Bassline pattern: [frequency, durationMultiplier]
  private readonly bassPattern: Array<[number, number]> = [
    [this.C3, 2],
    [this.C3, 2],
    [this.A3, 2],
    [this.A3, 2],
    [this.F3, 2],
    [this.F3, 2],
    [this.G3, 2],
    [this.G3, 2]
  ];

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGainNode = this.ctx.createGain();
        this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);
        this.bgmGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Background Music System ---
  public startBGM() {
    this.init();
    if (!this.ctx || this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    this.currentStep = 0;
    this.scheduleBgmLoop();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public pauseBGM() {
    if (!this.isBgmPlaying) return;
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public resumeBGM() {
    if (!this.isBgmPlaying || this.bgmTimer) return;
    this.scheduleBgmLoop();
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.ctx && this.bgmGainNode) {
      const now = this.ctx.currentTime;
      this.bgmGainNode.gain.cancelScheduledValues(now);
      this.bgmGainNode.gain.setValueAtTime(this.bgmGainNode.gain.value, now);
      this.bgmGainNode.gain.linearRampToValueAtTime(mute ? 0 : 0.12, now + 0.15);
    }
  }

  private scheduleBgmLoop() {
    if (!this.ctx || !this.bgmGainNode) return;

    const stepIntervalMs = 230; // ~130 BPM eighth notes

    const tick = () => {
      if (!this.ctx || !this.isBgmPlaying || !this.bgmGainNode) return;

      const now = this.ctx.currentTime;
      const step = this.currentStep % this.melodyPattern.length;
      const bassStep = (Math.floor(this.currentStep / 2)) % this.bassPattern.length;

      // 1. Play Lead Marimba/Bell Note
      const [melodyFreq, melDur] = this.melodyPattern[step];
      if (melodyFreq && !this.isMuted) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(melodyFreq, now);

        const dur = (melDur * stepIntervalMs) / 1000;
        noteGain.gain.setValueAtTime(0.35, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.9);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGainNode);

        osc.start(now);
        osc.stop(now + dur);
      }

      // 2. Play Bouncy Bass Note on every 2nd step
      if (this.currentStep % 2 === 0 && !this.isMuted) {
        const [bassFreq] = this.bassPattern[bassStep];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.4, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGainNode);

        bassOsc.start(now);
        bassOsc.stop(now + 0.35);
      }

      // 3. Play Soft Shaker/Hat Percussion
      if (!this.isMuted) {
        const isDownbeat = this.currentStep % 4 === 0;
        const hatOsc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();

        hatOsc.type = 'triangle';
        hatOsc.frequency.setValueAtTime(isDownbeat ? 1200 : 1800, now);

        hatGain.gain.setValueAtTime(isDownbeat ? 0.05 : 0.025, now);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        hatOsc.connect(hatGain);
        hatGain.connect(this.bgmGainNode);

        hatOsc.start(now);
        hatOsc.stop(now + 0.04);
      }

      this.currentStep++;
    };

    tick();
    this.bgmTimer = window.setInterval(tick, stepIntervalMs);
  }

  // --- Sound Effects ---
  public playCatch(points: number = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = points > 1 ? 659.25 : 523.25; // E5 or C5
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);

    // Crunch harmonic
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, now);
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.15);
  }

  public playCombo(comboCount: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    const noteIndex = Math.min(comboCount, notes.length - 1);
    const freq = notes[noteIndex];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playGoldenCatch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  public playCountdown(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = isFinal ? 880 : 440;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isFinal ? 0.35 : 0.15));
  }

  public playTimerTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = isUrgent ? 880 : 587.33; // A5 or D5
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(isUrgent ? 0.18 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isUrgent ? 0.12 : 0.06));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isUrgent ? 0.12 : 0.06));
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { freq: 440, time: 0 },
      { freq: 554.37, time: 0.12 },
      { freq: 659.25, time: 0.24 },
      { freq: 880, time: 0.38 },
      { freq: 1108.73, time: 0.52 }
    ];

    chords.forEach(({ freq, time }) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }
}

export const sound = new SoundFX();
