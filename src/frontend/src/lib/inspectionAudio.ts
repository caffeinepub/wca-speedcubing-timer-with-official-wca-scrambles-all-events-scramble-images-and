// Web Audio API utility for inspection warnings
class InspectionAudio {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  // Initialize audio context on user gesture
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  // Play a beep at specified frequency and duration
  private playBeep(frequency: number, duration: number) {
    if (!this.audioContext) {
      return;
    }

    // Try to resume context if needed
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    if (this.audioContext.state !== 'running') {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play beep:', error);
    }
  }

  // Play 8-second warning (lower pitch)
  play8SecondWarning() {
    this.playBeep(600, 0.15);
  }

  // Play 5-second warning (higher pitch)
  play5SecondWarning() {
    this.playBeep(800, 0.15);
  }
}

export const inspectionAudio = new InspectionAudio();
