import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";

export const Route = createFileRoute("/t/fireworks")({
  head: () => ({
    meta: [
      { title: "Fireworks — Đêm pháo hoa" },
      { name: "description", content: "Bấm vào đâu cũng nổ pháo hoa — trang tỏ tình đêm rực rỡ." },
    ],
  }),
  component: FireworksTemplate,
});

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const palette = ["#ff9ec4", "#ffd6a5", "#c9a0dc", "#a0e7e5", "#ffb3c1"];

function FireworksTemplate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

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

    const burst = (x: number, y: number) => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const count = 60;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
        });
      }
    };

    const onClick = (e: MouseEvent) => burst(e.clientX, e.clientY);
    window.addEventListener("click", onClick);

    // Auto-fire fireworks occasionally
    const auto = setInterval(() => {
      burst(
        Math.random() * canvas.width,
        canvas.height * 0.2 + Math.random() * canvas.height * 0.4,
      );
    }, 1800);

    let raf = 0;
    const loop = () => {
      ctx.fillStyle = "rgba(6, 4, 22, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life -= 0.012;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle =
          p.color +
          Math.floor(p.life * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(auto);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06041a] text-white">
      <canvas ref={canvasRef} className="fixed inset-0 z-0" aria-hidden />
      {/* City silhouette */}
      <svg
        className="pointer-events-none fixed bottom-0 left-0 z-10 w-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          fill="#0a0728"
          d="M0 120 L0 80 L40 80 L40 60 L80 60 L80 90 L120 90 L120 40 L160 40 L160 70 L200 70 L200 55 L260 55 L260 85 L300 85 L300 45 L340 45 L340 75 L400 75 L400 60 L460 60 L460 90 L520 90 L520 50 L580 50 L580 80 L640 80 L640 40 L700 40 L700 70 L760 70 L760 55 L820 55 L820 85 L880 85 L880 45 L940 45 L940 75 L1000 75 L1000 60 L1060 60 L1060 90 L1120 90 L1120 50 L1200 50 L1200 120 Z"
        />
      </svg>

      <div className="relative z-30">
        <SiteHeader />
      </div>

      <section className="relative z-20 mx-auto flex min-h-[85vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#ffb3c1]" /> Bấm chuột để bắn pháo hoa
          </div>
          <h1 className="mt-6 font-display text-6xl leading-tight sm:text-8xl">
            Đêm đẹp nhất <br />
            <span className="italic text-[#ffb3c1]">là đêm có em</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-white/70">
            Không cần lễ hội — chỉ cần em ở đây là bầu trời đã sáng rồi.
          </p>
        </motion.div>
      </section>

      <section className="relative z-20 mx-auto max-w-xl px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-md"
        >
          <p className="font-script text-3xl text-[#ffd6a5]">
            "Anh sẽ mua vé cho từng mùa pháo hoa,
            <br /> nếu em hứa sẽ luôn ngồi cạnh anh."
          </p>
        </motion.div>
      </section>
    </div>
  );
}
