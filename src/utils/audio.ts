import { AudioSettings } from '../types';

const AUDIO_STORAGE_KEY = 'ai_omnitest_audio_settings';

class SoundSystem {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.6,
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public setEnabled(enabled: boolean) {
    this.settings.enabled = enabled;
    this.saveSettings();
  }

  public setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick() {
    if (!this.settings.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);

      gain.gain.setValueAtTime(0.12 * this.settings.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch {
      // silent fallback
    }
  }

  public playSelect() {
    if (!this.settings.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.08); // E5

      gain.gain.setValueAtTime(0.15 * this.settings.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // silent fallback
    }
  }

  public playCorrect() {
    if (!this.settings.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + index * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18 * this.settings.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch {
      // silent fallback
    }
  }

  public playIncorrect() {
    if (!this.settings.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Gentle, non-punitive two-tone reminder
      const notes = [349.23, 311.13]; // F4, Eb4
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + index * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.14 * this.settings.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch {
      // silent fallback
    }
  }

  public playVictory() {
    if (!this.settings.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Fanfare: C5, E5, G5, C6 (ascending jubilant chord)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.1;
        const duration = i === notes.length - 1 ? 0.45 : 0.18;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2 * this.settings.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + duration + 0.05);
      });
    } catch {
      // silent fallback
    }
  }

  public playUploadSuccess() {
    if (!this.settings.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15 * this.settings.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {
      // silent fallback
    }
  }

  public playAlert() {
    if (!this.settings.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(415, t + 0.08);

      gain.gain.setValueAtTime(0.12 * this.settings.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch {
      // silent fallback
    }
  }
}

export const soundManager = new SoundSystem();
