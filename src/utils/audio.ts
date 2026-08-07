import { SoundType, SoundConfig, CustomerSoundSettings } from '../types';

export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: true,
  masterVolume: 80,
  enableHoverSounds: true,
  enableButtonClicks: true,
  enableAddToCartSounds: true,
  enableOrderSuccessSounds: true,
  customSoundUrls: {},
};

export const DEFAULT_CUSTOMER_SOUND_SETTINGS: CustomerSoundSettings = {
  muted: false,
  volume: 80,
};

// Global active configuration state
let activeSoundConfig: SoundConfig = { ...DEFAULT_SOUND_CONFIG };
let activeCustomerSettings: CustomerSoundSettings = { ...DEFAULT_CUSTOMER_SOUND_SETTINGS };

// Load customer settings from localStorage if available
try {
  const savedCustomerSettings = localStorage.getItem('nwd_customer_sound_settings');
  if (savedCustomerSettings) {
    activeCustomerSettings = { ...DEFAULT_CUSTOMER_SOUND_SETTINGS, ...JSON.parse(savedCustomerSettings) };
  }
} catch (e) {
  // fallback
}

// Load sound config from localStorage if available
try {
  const savedSoundConfig = localStorage.getItem('nwd_sound_config');
  if (savedSoundConfig) {
    activeSoundConfig = { ...DEFAULT_SOUND_CONFIG, ...JSON.parse(savedSoundConfig) };
  }
} catch (e) {
  // fallback
}

// Singleton AudioContext with lazy resume
let audioCtxSingleton: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtxSingleton) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtxSingleton = new AudioCtx();
    }
  }
  if (audioCtxSingleton && audioCtxSingleton.state === 'suspended') {
    audioCtxSingleton.resume().catch(() => {});
  }
  return audioCtxSingleton;
}

// Ensure AudioContext resumes on first user gesture
if (typeof window !== 'undefined') {
  const resumeAudio = () => {
    if (audioCtxSingleton && audioCtxSingleton.state === 'suspended') {
      audioCtxSingleton.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', resumeAudio);
    window.removeEventListener('keydown', resumeAudio);
  };
  window.addEventListener('pointerdown', resumeAudio, { passive: true });
  window.addEventListener('keydown', resumeAudio, { passive: true });
}

// Last trigger timestamps for throttling rapid repeat sounds
const lastTriggerMap: Record<string, number> = {};

function isThrottled(key: string, limitMs: number): boolean {
  const now = Date.now();
  if (lastTriggerMap[key] && now - lastTriggerMap[key] < limitMs) {
    return true;
  }
  lastTriggerMap[key] = now;
  return false;
}

export function setSoundConfig(config: SoundConfig) {
  activeSoundConfig = { ...config };
  try {
    localStorage.setItem('nwd_sound_config', JSON.stringify(config));
  } catch (e) {}
}

export function setCustomerSoundSettings(settings: CustomerSoundSettings) {
  activeCustomerSettings = { ...settings };
  try {
    localStorage.setItem('nwd_customer_sound_settings', JSON.stringify(settings));
  } catch (e) {}
}

export function getActiveSoundConfig(): SoundConfig {
  return activeSoundConfig;
}

export function getActiveCustomerSettings(): CustomerSoundSettings {
  return activeCustomerSettings;
}

// Calculate combined effective gain volume (0.0 to 1.0)
function getEffectiveGain(): number {
  if (!activeSoundConfig.enabled || activeCustomerSettings.muted) return 0;
  const masterRatio = (activeSoundConfig.masterVolume ?? 80) / 100;
  const customerRatio = (activeCustomerSettings.volume ?? 80) / 100;
  return Math.max(0, Math.min(1, masterRatio * customerRatio));
}

/**
 * Primary Sound Player
 */
export function playSound(type: SoundType) {
  const effectiveGain = getEffectiveGain();
  if (effectiveGain <= 0) return;

  // Custom audio URL override if defined by Admin
  const customUrl = activeSoundConfig.customSoundUrls?.[type];
  if (customUrl && typeof customUrl === 'string' && customUrl.trim().length > 5) {
    if (isThrottled(`custom_${type}`, 100)) return;
    try {
      const audio = new Audio(customUrl.trim());
      audio.volume = Math.min(1, effectiveGain * 0.8);
      audio.play().catch((err) => {
        console.warn('Custom audio playback notice:', err);
        // Fallback to synthesized audio on error
        playSynthesizedSound(type, effectiveGain);
      });
      return;
    } catch (e) {
      // Fallback to synth
    }
  }

  playSynthesizedSound(type, effectiveGain);
}

/**
 * Web Audio API Synthesizer with Precision Audio Nodes
 */
function playSynthesizedSound(type: SoundType, effectiveGain: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    switch (type) {
      case 'click': {
        if (!activeSoundConfig.enableButtonClicks) return;
        if (isThrottled('click', 50)) return;

        // Short luxury click (50ms duration)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.05);

        const vol = 0.12 * effectiveGain;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'hover': {
        if (!activeSoundConfig.enableHoverSounds) return;
        // Desktop check: do not play hover sound on touch devices
        if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
          return;
        }
        if (isThrottled('hover', 70)) return;

        // Tiny, whisper-quiet micro-tick (25ms duration)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, now);

        const vol = 0.025 * effectiveGain;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
        break;
      }

      case 'addToCart': {
        if (!activeSoundConfig.enableAddToCartSounds) return;
        if (isThrottled('addToCart', 200)) return;

        // Luxury Dual Chime: E5 (659Hz) -> B5 (987Hz)
        const vol = 0.18 * effectiveGain;

        // Note 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(vol, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        // Note 2
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, now + 0.08);
        gain2.gain.setValueAtTime(vol * 1.1, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.32);
        break;
      }

      case 'wishlist': {
        if (isThrottled('wishlist', 150)) return;

        // Sweet Sparkle: F#5 (740Hz) -> C#6 (1109Hz)
        const vol = 0.16 * effectiveGain;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(739.99, now);
        gain1.gain.setValueAtTime(vol, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1108.73, now + 0.06);
        gain2.gain.setValueAtTime(vol * 1.2, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.28);
        break;
      }

      case 'paymentSuccess': {
        if (isThrottled('paymentSuccess', 400)) return;

        // Premium Success Chime (C5 -> G5 -> C6)
        const vol = 0.22 * effectiveGain;
        const notes = [523.25, 783.99, 1046.5];
        const times = [0, 0.1, 0.2];
        const durations = [0.25, 0.3, 0.5];

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + times[idx];

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol * (1 + idx * 0.1), startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + durations[idx]);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + durations[idx]);
        });
        break;
      }

      case 'orderSuccess': {
        if (!activeSoundConfig.enableOrderSuccessSounds) return;
        if (isThrottled('orderSuccess', 500)) return;

        // Premium Grand Bell Chime (E5 -> G#5 -> B5 -> E6)
        const vol = 0.25 * effectiveGain;
        const chord = [659.25, 830.61, 987.77, 1318.51];
        const times = [0, 0.12, 0.24, 0.36];

        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + times[idx];

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.55);
        });
        break;
      }

      case 'notification': {
        if (isThrottled('notification', 250)) return;

        // Subtle Double Chime (D5 -> A5)
        const vol = 0.18 * effectiveGain;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(vol, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.12);
        gain2.gain.setValueAtTime(vol * 1.1, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.35);
        break;
      }

      case 'error': {
        if (isThrottled('error', 250)) return;

        // Gentle Low Error Tone (F3 -> C3 soft warm triangle)
        const vol = 0.16 * effectiveGain;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(174.61, now);
        gain1.gain.setValueAtTime(vol, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(130.81, now + 0.08);
        gain2.gain.setValueAtTime(vol, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.28);
        break;
      }

      case 'login': {
        if (isThrottled('login', 300)) return;

        // Uplifting Ascending Welcome (G4 -> C5 -> E5)
        const vol = 0.2 * effectiveGain;
        const freqs = [392.0, 523.25, 659.25];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.09;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.3);
        });
        break;
      }

      case 'logout': {
        if (isThrottled('logout', 300)) return;

        // Soft Descending Calm Tone (E5 -> C5 -> G4)
        const vol = 0.18 * effectiveGain;
        const freqs = [659.25, 523.25, 392.0];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.09;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.28);
        });
        break;
      }
    }
  } catch (e) {
    console.warn('Synthesizer audio playback warning:', e);
  }
}

// Backward compatibility export
export function applyAudioCustomerSettings(settings: CustomerSoundSettings) {
  activeCustomerSettings = { ...activeCustomerSettings, ...settings };
}

export function playNotificationSound() {
  playSound('notification');
}
