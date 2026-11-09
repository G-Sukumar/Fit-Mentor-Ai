import React, { useEffect, useRef, useState } from 'react';

export type BackgroundThemeMode = 'kinetic' | 'studio' | 'stealth';

interface ParticleCloakProps {
  className?: string;
  theme?: BackgroundThemeMode;
}

export const ParticleCloakBackground: React.FC<ParticleCloakProps> = ({
  className = '',
  theme: initialTheme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTheme, setCurrentTheme] = useState<BackgroundThemeMode>(() => {
    return initialTheme || (localStorage.getItem('fitmentor_bg_theme') as BackgroundThemeMode) || 'kinetic';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem('fitmentor_bg_theme') as BackgroundThemeMode;
      if (savedTheme && savedTheme !== currentTheme) {
        setCurrentTheme(savedTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fitmentor_bg_theme_change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fitmentor_bg_theme_change', handleStorageChange);
    };
  }, [currentTheme]);

  useEffect(() => {
    if (currentTheme === 'stealth') return; // Canvas particles disabled in pure stealth mode

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;
    let dpr = 1;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      color: string;
      pulseSpeed: number;
      pulseAngle: number;
    }

    let particles: Particle[] = [];
    const particleCount = currentTheme === 'studio' ? 22 : 30;

    function initParticles() {
      if (!canvas || !ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = [];

      for (let i = 0; i < particleCount; i++) {
        const isStudio = currentTheme === 'studio';
        const colorOptions = isStudio 
          ? ['245, 158, 11', '217, 119, 6', '34, 211, 238']
          : ['34, 211, 238', '139, 92, 246', '56, 189, 248'];
        
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        const baseAlpha = 0.08 + Math.random() * 0.22;

        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.15 - Math.random() * 0.25, // Gentle upward ambient drift
          radius: 1.2 + Math.random() * 1.8,
          alpha: baseAlpha,
          baseAlpha,
          color,
          pulseSpeed: 0.008 + Math.random() * 0.012,
          pulseAngle: Math.random() * Math.PI * 2,
        });
      }
    }

    window.addEventListener('resize', initParticles);
    initParticles();

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * delta * 60;
        p.y += p.vy * delta * 60;
        p.pulseAngle += p.pulseSpeed;

        // Soft breathing pulse
        p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.08;

        // Wrap around boundaries smoothly
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        if (p.alpha > 0.01) {
          ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', initParticles);
      cancelAnimationFrame(animId);
    };
  }, [currentTheme]);

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#070a11] ${className}`}>
      {/* Background Gradient Mesh Spheres */}
      {currentTheme === 'kinetic' && (
        <>
          <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse pointer-events-none" />
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
        </>
      )}

      {currentTheme === 'studio' && (
        <>
          <div className="absolute -top-32 left-1/3 w-[600px] h-[400px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
        </>
      )}

      {currentTheme === 'stealth' && (
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />
      )}

      {/* Subtle Precision Engineering Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Dynamic Canvas Particles */}
      {currentTheme !== 'stealth' && (
        <canvas
          ref={canvasRef}
          id="bg-canvas"
          className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80"
        />
      )}
    </div>
  );
};

