import { useEffect, useRef } from "react";

interface Heart {
  x: number;
  y: number;
  life: number;
  size: number;
  vx: number;
  vy: number;
}

export function HeartCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let lastSpawn = 0;
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawn < 40) return;
      lastSpawn = now;
      heartsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
        size: 10 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -0.5 - Math.random() * 1.2,
      });
    };
    window.addEventListener("mousemove", onMove);

    const drawHeart = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 30, size / 30);
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(-14, -8, -14, -20, 0, -10);
      ctx.bezierCurveTo(14, -20, 14, -8, 0, 6);
      ctx.closePath();
      const grad = ctx.createLinearGradient(-10, -10, 10, 10);
      grad.addColorStop(0, `rgba(232, 138, 171, ${alpha})`);
      grad.addColorStop(1, `rgba(196, 92, 124, ${alpha})`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      heartsRef.current = heartsRef.current.filter((h) => h.life > 0);
      for (const h of heartsRef.current) {
        h.x += h.vx;
        h.y += h.vy;
        h.life -= 0.015;
        drawHeart(h.x, h.y, h.size, Math.max(0, h.life));
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-20" aria-hidden />;
}
