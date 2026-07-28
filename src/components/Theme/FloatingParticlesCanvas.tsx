import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
  color: string;
  // Custom extensions for advanced particles
  angle?: number;
  spin?: number;
  shape?: 'circle' | 'square' | 'line' | 'diya' | 'balloon' | 'star';
  length?: number;
  decay?: number;
  rippleRadius?: number;
  isShootingStar?: boolean;
}

export const FloatingParticlesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isDark, activeMood, moodConfig } = useTheme();

  useEffect(() => {
    // 1. Respect system level reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 2. Determine particle density and battery optimizations
    let densityMultiplier = moodConfig.particleDensity ?? 1.0;
    if (moodConfig.lowEndReduction) {
      densityMultiplier *= 0.25; // 75% reduction on low-end device mode
    }

    const baseCount = Math.min(Math.floor((width * height) / 80000), 12);
    const particleCount = Math.max(3, Math.floor(baseCount * densityMultiplier));

    // Colors according to mood
    const getColorsByMood = (): string[] => {
      switch (activeMood) {
        case 'morning':
          return ['#FFB703', '#FB8500', '#219EBC', '#8ECAE6']; // Sunrise amber/sky
        case 'evening':
          return ['#EA580C', '#D97706', '#E11D48', '#818CF8']; // Sunset orange/purple
        case 'night':
          return ['#F1F5F9', '#93C5FD', '#FCD34D', '#A78BFA']; // Twitching cosmic star colors
        case 'rain':
          return ['#A5F3FC', '#38BDF8', '#0EA5E9', '#64748B']; // Cold rain drops
        case 'diwali':
          return ['#FBBF24', '#F59E0B', '#EF4444', '#DC2626']; // Diyas & clay colors
        case 'christmas':
          return ['#FFFFFF', '#E2E8F0', '#EF4444', '#10B981']; // Red, Green & Pure white snow
        case 'holi':
          return ['#EC4899', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']; // Splash color burst
        case 'new_year':
          return ['#A855F7', '#EC4899', '#3B82F6', '#F59E0B', '#10B981', '#F43F5E']; // Sparkling confetti
        case 'independence_day':
          return ['#FF9933', '#FFFFFF', '#128807', '#000080']; // Saffron, White, Green, Navy Blue
        case 'afternoon':
        default:
          return ['#10B981', '#34D399', '#64748B', '#F59E0B']; // Crisp afternoon forest colors
      }
    };

    const colors = getColorsByMood();
    const particles: Particle[] = [];

    // Create custom particles based on the active atmosphere
    const createParticle = (initRandomY = false): Particle => {
      const radius = 1.0 + Math.random() * 4.0;
      const x = Math.random() * width;
      const y = initRandomY ? Math.random() * height : -10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const maxAlpha = 0.15 + Math.random() * 0.35; // Soft opacity limits
      const pulseSpeed = 0.003 + Math.random() * 0.012;

      let vx = (Math.random() - 0.5) * 0.3;
      let vy = -0.15 - Math.random() * 0.4; // upward
      let shape: Particle['shape'] = 'circle';
      let length = 0;
      let angle = Math.random() * Math.PI * 2;
      let spin = (Math.random() - 0.5) * 0.04;
      let isShootingStar = false;

      // Customize velocities & physical rules per mood
      if (activeMood === 'rain') {
        vy = 5.0 + Math.random() * 7.0; // falling rain fast
        vx = -0.8 - Math.random() * 0.6; // wind angle
        shape = 'line';
        length = 15 + Math.random() * 15;
      } else if (activeMood === 'christmas') {
        vy = 0.5 + Math.random() * 1.0; // falling snowflakes
        vx = (Math.random() - 0.5) * 0.4; // sway left-right
        shape = 'circle';
      } else if (activeMood === 'new_year') {
        vy = 1.2 + Math.random() * 1.5; // falling confetti flutter
        vx = (Math.random() - 0.5) * 1.0;
        shape = Math.random() > 0.5 ? 'square' : 'circle';
      } else if (activeMood === 'diwali') {
        shape = Math.random() > 0.8 ? 'diya' : 'circle';
        vy = -0.12 - Math.random() * 0.25; // slow rising hot lamps
      } else if (activeMood === 'independence_day') {
        shape = Math.random() > 0.75 ? 'balloon' : 'circle';
        vy = -0.3 - Math.random() * 0.5; // rising balloons
        vx = (Math.random() - 0.5) * 0.2;
      } else if (activeMood === 'night') {
        // Starry night with twinkling and occasional shooting stars
        vy = 0;
        vx = 0;
        shape = 'star';
        // 3% chance of a shooting star in creation
        if (Math.random() < 0.03) {
          isShootingStar = true;
          shape = 'line';
          vx = -6.0 - Math.random() * 4.0;
          vy = 4.0 + Math.random() * 3.0;
          length = 50 + Math.random() * 60;
        }
      }

      return {
        x,
        y,
        radius,
        vx,
        vy,
        alpha: Math.random() * maxAlpha,
        maxAlpha,
        pulseSpeed,
        color,
        shape,
        length,
        angle,
        spin,
        isShootingStar,
      };
    };

    // Initialize particles across the full screen viewport
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    // Main animation canvas loop
    const render = () => {
      // Create a very subtle trailing fade for shooting stars or night sky glow
      if (activeMood === 'night' || activeMood === 'new_year') {
        ctx.fillStyle = isDark ? 'rgba(5, 11, 20, 0.22)' : 'rgba(250, 250, 250, 0.22)';
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      particles.forEach((p, idx) => {
        // Apply physics
        if (activeMood === 'night' && !p.isShootingStar) {
          // Twinkle in place
          p.alpha += p.pulseSpeed;
          if (p.alpha > p.maxAlpha || p.alpha < 0.02) {
            p.pulseSpeed = -p.pulseSpeed;
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;

          if (p.angle !== undefined && p.spin !== undefined) {
            p.angle += p.spin;
          }

          // Pulse opacity softly
          p.alpha += p.pulseSpeed;
          if (p.alpha > p.maxAlpha || p.alpha < 0.02) {
            p.pulseSpeed = -p.pulseSpeed;
          }
        }

        // --- DRAW PATTERNS ---
        ctx.save();
        ctx.globalAlpha = Math.max(0.01, Math.min(1.0, p.alpha));

        switch (p.shape) {
          case 'line': {
            // Rain streaks or shooting stars
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.isShootingStar ? 1.5 : 0.8;
            ctx.moveTo(p.x, p.y);
            // Draw streak tail
            const len = p.length || 15;
            // Angle wind vector
            ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
            ctx.stroke();
            break;
          }

          case 'square': {
            // Spinning confetti
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle || 0);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.radius, -p.radius * 0.6, p.radius * 2, p.radius * 1.2);
            break;
          }

          case 'diya': {
            // Draw a beautiful glowing clay lamp
            ctx.translate(p.x, p.y);
            ctx.beginPath();
            // Clay body
            ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI, false);
            ctx.closePath();
            ctx.fillStyle = '#D97706'; // Terracotta clay orange
            ctx.fill();
            
            // Oil wick line
            ctx.beginPath();
            ctx.moveTo(-p.radius, 0);
            ctx.lineTo(p.radius, 0);
            ctx.strokeStyle = '#78350F';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Flickering yellow flame tip
            ctx.beginPath();
            const flameHeight = p.radius * 2.2 + Math.sin(Date.now() * 0.02 + p.x) * 1.5;
            ctx.moveTo(0, -1);
            ctx.quadraticCurveTo(p.radius * 0.8, -flameHeight * 0.4, 0, -flameHeight);
            ctx.quadraticCurveTo(-p.radius * 0.8, -flameHeight * 0.4, 0, -1);
            ctx.fillStyle = '#FBBF24'; // Golden fire glow
            ctx.fill();
            break;
          }

          case 'balloon': {
            // Draw a floating tricolor balloon
            ctx.translate(p.x, p.y);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius * 1.2, p.radius * 1.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Balloon string line
            ctx.beginPath();
            ctx.moveTo(0, p.radius * 1.6);
            ctx.lineTo(Math.sin(Date.now() * 0.005 + p.x) * 3, p.radius * 1.6 + 12);
            ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            break;
          }

          case 'star': {
            // Draw standard glowing star with 4 points
            ctx.translate(p.x, p.y);
            ctx.beginPath();
            const r = p.radius * 1.5;
            ctx.moveTo(0, -r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.quadraticCurveTo(0, 0, 0, r);
            ctx.quadraticCurveTo(0, 0, -r, 0);
            ctx.quadraticCurveTo(0, 0, 0, -r);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            break;
          }

          case 'circle':
          default: {
            // Standard smooth circle particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            break;
          }
        }

        ctx.restore();

        // Wrap around boundary logic
        if (activeMood === 'rain') {
          if (p.y > height + 10) {
            // Reset to top
            p.y = -20;
            p.x = Math.random() * width;
            p.alpha = Math.random() * p.maxAlpha;
          }
        } else if (activeMood === 'christmas' || activeMood === 'new_year') {
          // Falling flakes and flutter
          if (p.y > height + 10) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        } else {
          // Rising dust or balloon
          if (p.y < -30) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        // Shooting star boundary reset
        if (p.isShootingStar) {
          if (p.y > height + 50 || p.x < -100) {
            // Reset shooting star with low chance
            if (Math.random() < 0.005) {
              p.x = Math.random() * width + width * 0.3;
              p.y = -50;
              p.vx = -6.0 - Math.random() * 4.0;
              p.vy = 4.0 + Math.random() * 3.0;
              p.alpha = 0.8;
            }
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark, activeMood, moodConfig.particleDensity, moodConfig.lowEndReduction]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
