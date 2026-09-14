import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FeedbackService {
  private audioContext: AudioContext | null = null;

  async playSound(): Promise<boolean> {
    if (typeof AudioContext === 'undefined') return false;
    try {
      this.audioContext ??= new AudioContext();
      if (this.audioContext.state === 'suspended') await this.audioContext.resume();

      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.075, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.23);
      return true;
    } catch {
      return false;
    }
  }

  playHaptic(): boolean {
    if (!('vibrate' in navigator)) return false;
    return navigator.vibrate([18, 28, 32]);
  }

  async completion(sound: boolean, haptics: boolean): Promise<void> {
    if (haptics) this.playHaptic();
    if (sound) await this.playSound();
  }
}
