// Web Audio API Procedural Sound Engine & Speech Synthesizer for Toddlers
// Designed with Pentatonic Harmony (always pleasant when mashed) and safe dynamics limiting.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.speechEnabled = true;
    this.bgmPlaying = false;
    this.bgmTimer = null;

    // Pentatonic scale frequencies (C Major Pentatonic across 3 octaves)
    // C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6, D6, E6, G6, A6
    this.pentatonicNotes = [
      261.63, 293.66, 329.63, 392.00, 440.00, // Octave 4
      523.25, 587.33, 659.25, 783.99, 880.00, // Octave 5
      1046.50, 1174.66, 1318.51, 1567.98, 1760.00 // Octave 6
    ];

    // Alphabet cognition mapping (Letter -> { cn, en, emoji })
    this.letterWords = {
      'A': { cn: '苹果', en: 'Apple', emoji: '🍎' },
      'B': { cn: '小熊', en: 'Bear', emoji: '🐻' },
      'C': { cn: '小猫', en: 'Cat', emoji: '🐱' },
      'D': { cn: '小鸭', en: 'Duck', emoji: '🦆' },
      'E': { cn: '大象', en: 'Elephant', emoji: '🐘' },
      'F': { cn: '小鱼', en: 'Fish', emoji: '🐟' },
      'G': { cn: '长颈鹿', en: 'Giraffe', emoji: '🦒' },
      'H': { cn: '爱心', en: 'Heart', emoji: '💖' },
      'I': { cn: '冰淇淋', en: 'Ice cream', emoji: '🍦' },
      'J': { cn: '果汁', en: 'Juice', emoji: '🧃' },
      'K': { cn: '风筝', en: 'Kite', emoji: '🪁' },
      'L': { cn: '狮子', en: 'Lion', emoji: '🦁' },
      'M': { cn: '小猴', en: 'Monkey', emoji: '🐵' },
      'N': { cn: '鸟巢', en: 'Nest', emoji: '🪺' },
      'O': { cn: '橙子', en: 'Orange', emoji: '🍊' },
      'P': { cn: '熊猫', en: 'Panda', emoji: '🐼' },
      'Q': { cn: '王冠', en: 'Queen', emoji: '👑' },
      'R': { cn: '小兔', en: 'Rabbit', emoji: '🐰' },
      'S': { cn: '星星', en: 'Star', emoji: '⭐' },
      'T': { cn: '老虎', en: 'Tiger', emoji: '🐯' },
      'U': { cn: '雨伞', en: 'Umbrella', emoji: '☂️' },
      'V': { cn: '小提琴', en: 'Violin', emoji: '🎻' },
      'W': { cn: '小鲸鱼', en: 'Whale', emoji: '🐳' },
      'X': { cn: '木琴', en: 'Xylophone', emoji: '🎵' },
      'Y': { cn: '小船', en: 'Yacht', emoji: '⛵' },
      'Z': { cn: '斑马', en: 'Zebra', emoji: '🦓' },
      '0': { cn: '圆甜甜圈', en: 'Zero', emoji: '🍩' },
      '1': { cn: '一只小鸭', en: 'One', emoji: '🐥' },
      '2': { cn: '两只小兔', en: 'Two', emoji: '🐰' },
      '3': { cn: '三朵红花', en: 'Three', emoji: '🌸' },
      '4': { cn: '四只气球', en: 'Four', emoji: '🎈' },
      '5': { cn: '五角红星', en: 'Five', emoji: '⭐' },
      '6': { cn: '六颗草莓', en: 'Six', emoji: '🍓' },
      '7': { cn: '七彩糖果', en: 'Seven', emoji: '🍬' },
      '8': { cn: '八个泡泡', en: 'Eight', emoji: '🫧' },
      '9': { cn: '九个铃铛', en: 'Nine', emoji: '🔔' }
    };
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    // Dynamics Compressor to prevent harsh loud sounds when toddler mashes keyboard
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Master volume control
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // Play a harmonious pentatonic marimba / xylophone note
  playMarimba(noteIndex = 0, duration = 0.8) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const freq = this.pentatonicNotes[Math.abs(noteIndex) % this.pentatonicNotes.length];
    const now = this.ctx.currentTime;

    // Primary fundamental tone
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Second harmonic for wooden marimba resonance
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 3, now); // wood overtone

    // Envelopes
    gain1.gain.setValueAtTime(0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.3);

    osc1.connect(gain1);
    gain1.connect(this.compressor);

    osc2.connect(gain2);
    gain2.connect(this.compressor);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration * 0.35);
  }

  // Cartoon Boing / Spring sound
  playBoing(baseFreq = 220) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency glide up & wobble
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.8, now + 0.35);

    // Tremolo LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(16, now);
    lfoGain.gain.setValueAtTime(30, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.compressor);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.5);
    osc.stop(now + 0.5);
  }

  // Cute Bubble Pop sound
  playBubblePop(freq = 600) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Magic Sparkle / Fairy Chime
  playMagicSparkle(startFreq = 880) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [startFreq, startFreq * 1.25, startFreq * 1.5, startFreq * 2];
    const now = this.ctx.currentTime;

    notes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteStart = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, noteStart);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.4);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(noteStart);
      osc.stop(noteStart + 0.45);
    });
  }

  // Soft Cartoon Drum / Thump for Space/Enter
  playDrum() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Play based on key or general random trigger
  playKeySound(key = '') {
    const cleanKey = key.toUpperCase();

    if (cleanKey === ' ' || cleanKey === 'ENTER') {
      this.playDrum();
      this.playBoing(180);
      return;
    }

    if (cleanKey === 'BACKSPACE' || cleanKey === 'ESCAPE') {
      this.playBoing(260);
      return;
    }

    // Determine sound type by hash of key
    const charCode = cleanKey.charCodeAt(0) || Math.floor(Math.random() * 100);
    const soundType = charCode % 4;

    switch (soundType) {
      case 0:
        this.playMarimba(charCode, 0.7);
        break;
      case 1:
        this.playBubblePop(450 + (charCode % 8) * 60);
        break;
      case 2:
        this.playBoing(200 + (charCode % 5) * 40);
        break;
      case 3:
      default:
        this.playMagicSparkle(523 + (charCode % 6) * 70);
        break;
    }

    // Speech trigger for letters or numbers
    if (this.speechEnabled && this.letterWords[cleanKey]) {
      this.speakCognitive(cleanKey);
    }
  }

  // Web Speech API for Cognitive Learning
  speakCognitive(key) {
    if (!window.speechSynthesis || !this.speechEnabled || this.isMuted) return;

    try {
      window.speechSynthesis.cancel(); // Stop previous utterance so baby doesn't get flooded
      const item = this.letterWords[key];
      if (!item) return;

      const text = `${key}，${item.cn}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.25; // slightly higher friendly pitch for kids
      utterance.lang = 'zh-CN';

      // Pick a cute voice if available
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Speech may not be supported or allowed, gracefully ignore
    }
  }

  // Procedural gentle music box BGM
  toggleBGM() {
    this.bgmPlaying = !this.bgmPlaying;
    if (this.bgmPlaying) {
      this.ensureContext();
      this.stepBGM();
    } else {
      if (this.bgmTimer) clearTimeout(this.bgmTimer);
    }
    return this.bgmPlaying;
  }

  stepBGM() {
    if (!this.bgmPlaying) return;

    // Play a gentle pentatonic chord note
    const randomNote = this.pentatonicNotes[Math.floor(Math.random() * 8) + 2];
    if (this.ctx && !this.isMuted) {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomNote, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(now);
      osc.stop(now + 1.3);
    }

    // Schedule next note between 400ms and 900ms
    const nextInterval = 450 + Math.random() * 450;
    this.bgmTimer = setTimeout(() => this.stepBGM(), nextInterval);
  }
}

export const soundEngine = new SoundEngine();
