import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Check } from 'lucide-react';

export const OrderSuccessCelebration: React.FC = () => {
  const { isCelebrating, orderCelebrationConfig } = useStore();
  const [shouldRender, setShouldRender] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Maintain local state for timing and cleanup
  useEffect(() => {
    if (isCelebrating && orderCelebrationConfig?.enabled) {
      // Device filter checks
      const width = window.innerWidth;
      const isMobile = width < 768;

      if (orderCelebrationConfig.mobileOnly && !isMobile) return;
      if (orderCelebrationConfig.desktopOnly && isMobile) return;

      setShouldRender(true);
      if (orderCelebrationConfig.sound) {
        playCelebrationSound();
      }
    } else {
      setShouldRender(false);
    }
  }, [isCelebrating, orderCelebrationConfig]);

  // 1. Web Audio API Triumphant Synthesizer
  const playCelebrationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Part A: Confetti Popper "Pop!" (Noise burst + Low Frequency Thump)
      const bufferSize = ctx.sampleRate * 0.15; // 150ms noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1000, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(150, now + 0.15);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start(now);

      // Part B: Shimmering Triumph Arpeggio (C5 - E5 - G5 - C6)
      const playTone = (freq: number, startDelay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // High premium sine + triangle mix
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + startDelay);

        gain.gain.setValueAtTime(0, now + startDelay);
        gain.gain.linearRampToValueAtTime(0.12, now + startDelay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + startDelay);
        osc.stop(now + startDelay + duration);
      };

      // Play major arpeggio notes sequentially
      playTone(523.25, 0.05, 0.35); // C5
      playTone(659.25, 0.12, 0.35); // E5
      playTone(783.99, 0.19, 0.35); // G5
      playTone(1046.5, 0.26, 0.45); // C6
    } catch (e) {
      console.warn('Web Audio Playback blocked or unsupported:', e);
    }
  };

  // 2. Self-contained 2D Canvas Animation loop
  useEffect(() => {
    if (!shouldRender || !canvasRef.current || !orderCelebrationConfig) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Speed multiplier setup
    let speedMult = 1.0;
    if (orderCelebrationConfig.speed === 'slow') speedMult = 0.5;
    if (orderCelebrationConfig.speed === 'fast') speedMult = 1.8;

    // Define particle categories
    interface ConfettiParticle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      shape: 'rect' | 'circle';
    }

    interface SparkleParticle {
      x: number;
      y: number;
      size: number;
      maxSize: number;
      speedX: number;
      speedY: number;
      alpha: number;
      alphaSpeed: number;
    }

    interface BalloonParticle {
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      color: string;
      speedY: number;
      swayRange: number;
      swaySpeed: number;
      swayOffset: number;
    }

    const confettiList: ConfettiParticle[] = [];
    const sparkleList: SparkleParticle[] = [];
    const balloonList: BalloonParticle[] = [];

    const colors = ['#0B8F63', '#3B82F6', '#EF4444', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'];

    // Generate initial batches if toggled
    if (orderCelebrationConfig.confetti) {
      for (let i = 0; i < 95; i++) {
        confettiList.push({
          x: Math.random() * canvas.width,
          y: Math.random() * -canvas.height - 20,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() * 4 - 2) * speedMult,
          speedY: (Math.random() * 5 + 4) * speedMult,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() * 6 - 3) * speedMult,
          shape: Math.random() > 0.45 ? 'rect' : 'circle',
        });
      }
    }

    if (orderCelebrationConfig.sparkles) {
      for (let i = 0; i < 45; i++) {
        sparkleList.push({
          x: canvas.width / 2 + (Math.random() * 300 - 150),
          y: canvas.height / 2 + (Math.random() * 200 - 100),
          size: Math.random() * 2 + 1,
          maxSize: Math.random() * 6 + 4,
          speedX: (Math.random() * 2 - 1) * speedMult,
          speedY: (Math.random() * -2 - 0.5) * speedMult,
          alpha: Math.random(),
          alphaSpeed: (Math.random() * 0.02 + 0.01) * speedMult,
        });
      }
    }

    if (orderCelebrationConfig.balloons) {
      for (let i = 0; i < 15; i++) {
        balloonList.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 300 + 50,
          radiusX: Math.random() * 8 + 14,
          radiusY: Math.random() * 10 + 18,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedY: (Math.random() * 1.5 + 1.2) * speedMult,
          swayRange: Math.random() * 30 + 15,
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    // Main Canvas Render Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Confetti
      if (orderCelebrationConfig.confetti) {
        confettiList.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // Physics updates
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;

          // Recycle bottom out
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        });
      }

      // Render Sparkles
      if (orderCelebrationConfig.sparkles) {
        sparkleList.forEach((p) => {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = '#FBBF24'; // Golden shimmer

          // Draw a standard 4-point star sparkle
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.quadraticCurveTo(p.x, p.y, p.x + p.size, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + p.size);
          ctx.quadraticCurveTo(p.x, p.y, p.x - p.size, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - p.size);
          ctx.fill();
          ctx.restore();

          // Star shimmer arithmetics
          p.alpha += p.alphaSpeed;
          if (p.alpha > 1 || p.alpha < 0) {
            p.alphaSpeed = -p.alphaSpeed;
          }
          p.x += p.speedX;
          p.y += p.speedY;
          p.size = Math.max(1, p.maxSize * p.alpha);

          // Recycle out of bounds
          if (p.y < 0 || p.x < 0 || p.x > canvas.width) {
            p.y = canvas.height / 2 + (Math.random() * 200 - 100);
            p.x = canvas.width / 2 + (Math.random() * 300 - 150);
            p.alpha = 0.1;
          }
        });
      }

      // Render Balloons
      if (orderCelebrationConfig.balloons) {
        balloonList.forEach((p) => {
          const currentSway = Math.sin(p.swayOffset) * p.swayRange;

          ctx.save();
          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;

          // Balloon Body (ellipse)
          ctx.beginPath();
          ctx.ellipse(p.x + currentSway, p.y, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Little balloon knot triangle
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(p.x + currentSway, p.y + p.radiusY);
          ctx.lineTo(p.x + currentSway - 4, p.y + p.radiusY + 6);
          ctx.lineTo(p.x + currentSway + 4, p.y + p.radiusY + 6);
          ctx.closePath();
          ctx.fill();

          // Swaying hanging string line
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x + currentSway, p.y + p.radiusY + 6);
          ctx.bezierCurveTo(
            p.x + currentSway - 10,
            p.y + p.radiusY + 22,
            p.x + currentSway + 10,
            p.y + p.radiusY + 38,
            p.x + currentSway,
            p.y + p.radiusY + 50
          );
          ctx.stroke();

          ctx.restore();

          // Float updates
          p.y -= p.speedY;
          p.swayOffset += p.swaySpeed;

          // Recycle rising balloons
          if (p.y < -100) {
            p.y = canvas.height + Math.random() * 200 + 40;
            p.x = Math.random() * canvas.width;
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [shouldRender, orderCelebrationConfig]);

  if (!shouldRender || !orderCelebrationConfig) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-transparent"
      id="order-success-celebration-container"
    >
      {/* Immersive interactive Canvas background layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Prominent success animation card if toggled */}
      {orderCelebrationConfig.successAnimation && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-neutral-100 shadow-2xl flex items-center gap-3.5 z-20 pointer-events-auto max-w-sm text-left animate-in zoom-in-90 slide-in-from-bottom-6 duration-300">
          <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner animate-pulse">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-serif-heading font-extrabold text-neutral-800 text-xs uppercase tracking-wider">
              Order Confirmed Successfully!
            </h4>
            <p className="text-[11px] text-neutral-500 leading-normal">
              Thank you for shopping with us! Your VIP festival order has been registered and is being prepared.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
