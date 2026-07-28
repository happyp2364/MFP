/**
 * Procedural Web Audio API Ambient Soundscape Synthesizer
 * Generates custom synthesized organic audio loops for each mood in real-time
 * with zero network footprint, perfect performance, and seamless transitions.
 */

let audioCtx: AudioContext | null = null;
let activeAmbientNodes: {
  sources: AudioNode[];
  gainNode: GainNode | null;
  intervals: any[];
} | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Ensure AudioContext resumes on first gesture
if (typeof window !== 'undefined') {
  const resume = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    window.removeEventListener('click', resume);
    window.removeEventListener('pointerdown', resume);
  };
  window.addEventListener('click', resume, { passive: true });
  window.addEventListener('pointerdown', resume, { passive: true });
}

/**
 * Generate 2 seconds of Stereo White Noise Buffer
 */
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return buffer;
}

/**
 * Stops any running procedural ambient soundscape smoothly
 */
export function stopProceduralAmbience() {
  if (!activeAmbientNodes) return;

  const { sources, gainNode, intervals } = activeAmbientNodes;
  
  // Clear any scheduled intervals
  intervals.forEach((it) => clearInterval(it));

  // Fade out master gain smoothly before stopping
  if (gainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    } catch (e) {}
  }

  // Stop sources after fade out
  setTimeout(() => {
    sources.forEach((node) => {
      try {
        if ((node as any).stop) {
          (node as any).stop();
        }
      } catch (e) {}
    });
  }, 1300);

  activeAmbientNodes = null;
}

/**
 * Play a custom synthesized organic soundscape for the given mood
 * @param mood The target website mood
 * @param masterVolume Volume level from 0 to 100
 */
export function playProceduralAmbience(mood: string, masterVolume: number) {
  // Stop existing ambient loop first
  stopProceduralAmbience();

  if (masterVolume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterVolumeRatio = masterVolume / 100;

  const sources: AudioNode[] = [];
  const intervals: any[] = [];

  // Create master gain for fade-in & volume control
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.connect(ctx.destination);
  masterGain.gain.linearRampToValueAtTime(0.12 * masterVolumeRatio, now + 2.0); // Safe gentle background volume

  activeAmbientNodes = {
    sources,
    gainNode: masterGain,
    intervals,
  };

  try {
    switch (mood) {
      case 'morning': {
        // --- MORNING AMBIENCE: Soft gentle breeze + procedurally generated bird calls ---
        // 1. Soft Morning Breeze
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(ctx);
        noise.loop = true;

        const lpFilter = ctx.createBiquadFilter();
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(350, now);

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.4, now);

        noise.connect(lpFilter);
        lpFilter.connect(modGain);
        modGain.connect(masterGain);

        noise.start(now);
        sources.push(noise, lpFilter, modGain);

        // Slow breeze frequency modulation (breeze gusts)
        let phase = 0;
        const breezeInterval = setInterval(() => {
          if (!audioCtx) return;
          phase += 0.05;
          const targetFreq = 300 + Math.sin(phase) * 120;
          lpFilter.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 1.2);
        }, 100);
        intervals.push(breezeInterval);

        // 2. Procedural Bird Calls (triggered randomly every 4-8 seconds)
        const triggerBirdCall = () => {
          if (!audioCtx || !activeAmbientNodes) return;
          const birdCtx = getAudioContext();
          if (!birdCtx) return;

          const startTime = birdCtx.currentTime;
          const osc = birdCtx.createOscillator();
          const birdGain = birdCtx.createGain();
          
          osc.type = 'sine';
          // High-pitched organic chirp starting around 2.8kHz
          osc.frequency.setValueAtTime(2800 + Math.random() * 400, startTime);
          birdGain.gain.setValueAtTime(0, startTime);
          birdGain.gain.linearRampToValueAtTime(0.06 * masterVolumeRatio, startTime + 0.03);

          // Fast frequency pitch sweeping up and down
          osc.frequency.exponentialRampToValueAtTime(3600 + Math.random() * 300, startTime + 0.12);
          birdGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

          osc.connect(birdGain);
          birdGain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.3);
        };

        // Trigger first call in 2 seconds, then periodically
        setTimeout(triggerBirdCall, 2000);
        const birdsTimer = setInterval(triggerBirdCall, 6000);
        intervals.push(birdsTimer);
        break;
      }

      case 'rain': {
        // --- RAIN AMBIENCE: Rich continuous rain patter + soft background rumble ---
        // 1. Rain Patter (Filtered Noise)
        const rainNoise = ctx.createBufferSource();
        rainNoise.buffer = createNoiseBuffer(ctx);
        rainNoise.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'bandpass';
        rainFilter.frequency.setValueAtTime(900, now);
        rainFilter.Q.setValueAtTime(1.2, now);

        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.7, now);

        rainNoise.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(masterGain);

        rainNoise.start(now);
        sources.push(rainNoise, rainFilter, rainGain);

        // 2. Rain drops (high-pitched popping particles)
        const dropInterval = setInterval(() => {
          if (!audioCtx || !activeAmbientNodes) return;
          const actCtx = getAudioContext();
          if (!actCtx) return;

          const t = actCtx.currentTime;
          const osc = actCtx.createOscillator();
          const gn = actCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200 + Math.random() * 1500, t);
          gn.gain.setValueAtTime(0.015 * masterVolumeRatio, t);
          gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

          osc.connect(gn);
          gn.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.05);
        }, 180);
        intervals.push(dropInterval);
        break;
      }

      case 'evening': {
        // --- EVENING AMBIENCE: Golden hour crickets + soft dusk breeze ---
        // 1. Dusk Breeze
        const duskNoise = ctx.createBufferSource();
        duskNoise.buffer = createNoiseBuffer(ctx);
        duskNoise.loop = true;

        const duskFilter = ctx.createBiquadFilter();
        duskFilter.type = 'lowpass';
        duskFilter.frequency.setValueAtTime(250, now);

        duskNoise.connect(duskFilter);
        duskFilter.connect(masterGain);
        duskNoise.start(now);
        sources.push(duskNoise, duskFilter);

        // 2. Twilight Crickets (modulated ultra-fast pulse)
        const triggerCrickets = () => {
          if (!audioCtx || !activeAmbientNodes) return;
          const cricketCtx = getAudioContext();
          if (!cricketCtx) return;

          const startTime = cricketCtx.currentTime;
          const osc = cricketCtx.createOscillator();
          const cGain = cricketCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(4200, startTime);
          cGain.gain.setValueAtTime(0, startTime);

          // Simulate cricket chirp pulses: 4 chirps in a row
          for (let i = 0; i < 4; i++) {
            const chirpStart = startTime + i * 0.06;
            cGain.gain.setValueAtTime(0.012 * masterVolumeRatio, chirpStart);
            cGain.gain.exponentialRampToValueAtTime(0.001, chirpStart + 0.04);
          }

          osc.connect(cGain);
          cGain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 0.3);
        };

        const cricketsTimer = setInterval(triggerCrickets, 2400);
        intervals.push(cricketsTimer);
        break;
      }

      case 'night': {
        // --- NIGHT AMBIENCE: Soft galaxy hum + deep room resonance & rare crickets ---
        // Deep Night Hum (sine chord)
        const freqs = [55, 110, 165]; // low resonant frequencies
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const og = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          
          og.gain.setValueAtTime(0.12 / (idx + 1), now);
          
          // Add a slow sweep
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.1 + idx * 0.05, now);
          lfoGain.gain.setValueAtTime(0.02, now);
          lfo.connect(lfoGain);
          lfoGain.connect(og.gain);

          osc.connect(og);
          og.connect(masterGain);

          osc.start(now);
          lfo.start(now);
          sources.push(osc, og, lfo, lfoGain);
        });
        break;
      }

      case 'diwali': {
        // --- DIWALI FESTIVE AMBIENCE: Warm Indian Tanpura droning + rich temple bells ---
        // 1. Tanpura Vibe (Low C2 + G2 warm triangle waves)
        const rootFreq = 65.41; // C2
        const droneNotes = [rootFreq, rootFreq * 1.5, rootFreq * 2]; // C2, G2, C3
        
        droneNotes.forEach((f) => {
          const osc = ctx.createOscillator();
          const og = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          // Warm filter
          const ftr = ctx.createBiquadFilter();
          ftr.type = 'lowpass';
          ftr.frequency.setValueAtTime(140, now);

          og.gain.setValueAtTime(0.06, now);

          osc.connect(ftr);
          ftr.connect(og);
          og.connect(masterGain);

          osc.start(now);
          sources.push(osc, ftr, og);
        });

        // 2. Beautiful resonant temple bells
        const triggerDiwaliBell = () => {
          if (!audioCtx || !activeAmbientNodes) return;
          const bellCtx = getAudioContext();
          if (!bellCtx) return;

          const t = bellCtx.currentTime;
          const harmonics = [440, 554.37, 659.25, 880, 1100]; // Rich bell chord (A major)
          
          harmonics.forEach((freq, idx) => {
            const osc = bellCtx.createOscillator();
            const bg = bellCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            const weight = 1 / (idx + 1);
            bg.gain.setValueAtTime(0.02 * weight * masterVolumeRatio, t);
            bg.gain.exponentialRampToValueAtTime(0.0001, t + 3.0 - idx * 0.3);

            osc.connect(bg);
            bg.connect(masterGain);
            osc.start(t);
            osc.stop(t + 4.0);
          });
        };

        triggerDiwaliBell();
        const diwaliTimer = setInterval(triggerDiwaliBell, 12000);
        intervals.push(diwaliTimer);
        break;
      }

      case 'christmas': {
        // --- CHRISTMAS AMBIENCE: Enchanting wind chimes & soft sleigh bell sparkles ---
        // Slow sweeping chime generator
        const triggerChimes = () => {
          if (!audioCtx || !activeAmbientNodes) return;
          const chimeCtx = getAudioContext();
          if (!chimeCtx) return;

          const t = chimeCtx.currentTime;
          // Random chime note from pentatonic scale (C6, D6, E6, G6, A6, C7)
          const notes = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0];
          const freq = notes[Math.floor(Math.random() * notes.length)];

          const osc = chimeCtx.createOscillator();
          const cg = chimeCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          cg.gain.setValueAtTime(0.025 * masterVolumeRatio, t);
          cg.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

          osc.connect(cg);
          cg.connect(masterGain);
          osc.start(t);
          osc.stop(t + 2.0);
        };

        // Fast spark sleigh bell shake
        const triggerSleighBell = () => {
          if (!audioCtx || !activeAmbientNodes) return;
          const bellCtx = getAudioContext();
          if (!bellCtx) return;

          const t = bellCtx.currentTime;
          // Sleigh bells are clusters of random high frequencies (3kHz to 8kHz)
          for (let i = 0; i < 5; i++) {
            const osc = bellCtx.createOscillator();
            const bg = bellCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(3000 + Math.random() * 4000, t);

            bg.gain.setValueAtTime(0.006 * masterVolumeRatio, t);
            bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.15 + Math.random() * 0.1);

            osc.connect(bg);
            bg.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.3);
          }
        };

        // Chimes every 3 seconds, Sleigh bells every 6 seconds
        const chimeTimer = setInterval(triggerChimes, 3200);
        const bellTimer = setInterval(triggerSleighBell, 7000);
        intervals.push(chimeTimer, bellTimer);
        break;
      }

      case 'holi': {
        // --- HOLI AMBIENCE: Warm joyous drumbeat vibration (low dynamic synth hits) ---
        const triggerDhol = () => {
          if (!audioCtx || !activeAmbientNodes) return;
          const dholCtx = getAudioContext();
          if (!dholCtx) return;

          const t = dholCtx.currentTime;
          
          // Dhol boom: Low pitch sweeping down fast
          const osc = dholCtx.createOscillator();
          const dg = dholCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.exponentialRampToValueAtTime(65, t + 0.18);

          dg.gain.setValueAtTime(0.08 * masterVolumeRatio, t);
          dg.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          osc.connect(dg);
          dg.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.4);
        };

        const holiTimer = setInterval(triggerDhol, 3600);
        intervals.push(holiTimer);
        break;
      }

      case 'new_year': {
        // --- NEW YEAR AMBIENCE: Magical star sparkles & celebration wind chime sparks ---
        const triggerNewYearChime = () => {
          if (!audioCtx || !activeAmbientNodes) return;
          const chimeCtx = getAudioContext();
          if (!chimeCtx) return;

          const t = chimeCtx.currentTime;
          const notes = [1318.51, 1568.0, 1975.53, 2637.02]; // E6, G6, B6, E7 beautiful chord
          notes.forEach((f, i) => {
            const osc = chimeCtx.createOscillator();
            const cg = chimeCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + i * 0.08);

            cg.gain.setValueAtTime(0.02 * masterVolumeRatio, t + i * 0.08);
            cg.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 1.2);

            osc.connect(cg);
            cg.connect(masterGain);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 1.5);
          });
        };

        const newYearTimer = setInterval(triggerNewYearChime, 4500);
        intervals.push(newYearTimer);
        break;
      }

      case 'independence_day': {
        // --- INDEPENDENCE DAY: Patriotic sitar/flute atmospheric chord (C Major / Shudh Kalyan scale) ---
        const root = 130.81; // C3
        const harmonics = [root, root * 1.25, root * 1.5, root * 1.875]; // C, E, G, B Kalyan vibe
        harmonics.forEach((f) => {
          const osc = ctx.createOscillator();
          const og = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          const filt = ctx.createBiquadFilter();
          filt.type = 'lowpass';
          filt.frequency.setValueAtTime(250, now);

          og.gain.setValueAtTime(0.04, now);

          osc.connect(filt);
          filt.connect(og);
          og.connect(masterGain);

          osc.start(now);
          sources.push(osc, filt, og);
        });
        break;
      }

      case 'afternoon':
      default: {
        // Afternoon has no continuous ambient loop, keeps the crisp, quiet environment pristine
        break;
      }
    }
  } catch (err) {
    console.warn('Could not launch procedural background soundscape:', err);
  }
}
