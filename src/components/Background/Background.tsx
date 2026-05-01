import { useEffect, useRef } from 'react';
import './Background.css';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface Ripple {
  x: number; y: number;
  r: number; maxR: number;
  alpha: number;
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const ripples = useRef<Ripple[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let particles: Particle[] = [];
    let W = 0, H = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function spawn(): Particle {
      const blue = Math.random() > 0.4;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5,
        color: blue ? '0,212,255' : '155,93,229',
        opacity: Math.random() * 0.55 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.022 + 0.008,
      };
    }

    function init() {
      particles = Array.from({ length: 150 }, spawn);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // subtle grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,212,255,0.04)';
      const g = 90;
      for (let x = 0; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const mx = mouse.current.x, my = mouse.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += p.pulseSpeed;

        // mouse repulsion
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.22;
          p.vy += (dy / dist) * force * 0.22;
        }

        p.vx *= 0.982; p.vy *= 0.982;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // connection lines
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const lx = p.x - q.x, ly = p.y - q.y;
          const ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < 100) {
            ctx.strokeStyle = `rgba(0,212,255,${(1 - ld / 100) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }

        // glow dot
        const glow = Math.sin(p.pulse) * 0.3 + 0.7;
        const r = p.radius * glow;
        const op = p.opacity * glow;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
        grad.addColorStop(0, `rgba(${p.color},${op})`);
        grad.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${Math.min(op * 2.2, 1)})`; ctx.fill();
      }

      // click ripples
      ripples.current = ripples.current.filter(rp => rp.alpha > 0.01);
      for (const rp of ripples.current) {
        rp.r += 3.5;
        rp.alpha *= 0.92;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,212,255,${rp.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(155,93,229,${rp.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    function onClick(e: MouseEvent) {
      ripples.current.push({ x: e.clientX, y: e.clientY, r: 2, maxR: 120, alpha: 0.7 });
    }

    resize();
    init();
    draw();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.current = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseleave', () => { mouse.current = { x: -9999, y: -9999 }; });
    window.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" />;
}
