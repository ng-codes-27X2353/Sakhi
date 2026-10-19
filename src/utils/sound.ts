/**
 * Web Audio API Sound Generator for Emergency Alarm Siren
 */

class AlarmAudioController {
  private ctx: AudioContext | null = null;
  private oscillator1: OscillatorNode | null = null;
  private oscillator2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSiren(type: 'siren' | 'pulse' | 'police' = 'siren') {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Master Gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.7, now);
    this.gainNode.connect(this.ctx.destination);

    // Primary Oscillator
    this.oscillator1 = this.ctx.createOscillator();
    this.oscillator1.type = 'sawtooth';

    // Secondary Oscillator for detuned harshness
    this.oscillator2 = this.ctx.createOscillator();
    this.oscillator2.type = 'square';
    this.oscillator2.detune.setValueAtTime(15, now);

    // LFO for pitch modulation (wailing effect)
    this.lfo = this.ctx.createOscillator();
    this.lfoGain = this.ctx.createGain();

    if (type === 'siren') {
      // Classic emergency wailing siren: 600Hz to 1200Hz, modulated at 1.8Hz
      this.oscillator1.frequency.setValueAtTime(800, now);
      this.oscillator2.frequency.setValueAtTime(800, now);
      this.lfo.frequency.setValueAtTime(1.8, now);
      this.lfoGain.gain.setValueAtTime(350, now);
    } else if (type === 'police') {
      // Faster two-tone police yelp: 700Hz to 1400Hz at 4Hz
      this.oscillator1.frequency.setValueAtTime(950, now);
      this.oscillator2.frequency.setValueAtTime(950, now);
      this.lfo.frequency.setValueAtTime(4.5, now);
      this.lfoGain.gain.setValueAtTime(450, now);
    } else {
      // Rapid staccato pulse
      this.oscillator1.frequency.setValueAtTime(1100, now);
      this.oscillator2.frequency.setValueAtTime(1100, now);
      this.lfo.frequency.setValueAtTime(6, now);
      this.lfoGain.gain.setValueAtTime(200, now);
    }

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.oscillator1.frequency);
    this.lfoGain.connect(this.oscillator2.frequency);

    const oscMix = this.ctx.createGain();
    oscMix.gain.setValueAtTime(0.5, now);
    this.oscillator1.connect(this.gainNode);
    this.oscillator2.connect(oscMix);
    oscMix.connect(this.gainNode);

    this.oscillator1.start(now);
    this.oscillator2.start(now);
    this.lfo.start(now);
  }

  public stopSiren() {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0, now, 0.05);
      }
      setTimeout(() => {
        try {
          this.oscillator1?.stop();
          this.oscillator2?.stop();
          this.lfo?.stop();
          this.oscillator1?.disconnect();
          this.oscillator2?.disconnect();
          this.lfo?.disconnect();
        } catch (_) {}
        this.oscillator1 = null;
        this.oscillator2 = null;
        this.lfo = null;
        this.lfoGain = null;
        this.gainNode = null;
        this.isPlaying = false;
      }, 100);
    } catch (_) {
      this.isPlaying = false;
    }
  }

  public playBeep(freq = 880, duration = 0.15) {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playDisarmSuccess() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  public playError() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [220, 196].forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + idx * 0.12;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, startTime);
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const alarmAudio = new AlarmAudioController();
