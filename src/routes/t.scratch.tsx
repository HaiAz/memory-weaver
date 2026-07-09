import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";
import { heartsBurst } from "@/components/love/confettiHelpers";

export const Route = createFileRoute("/t/scratch")({
  head: () => ({
    meta: [
      { title: "Scratch — Cào để lộ điều bí mật" },
      {
        name: "description",
        content: "Thẻ cào tình yêu — dùng chuột hoặc ngón tay để lộ lời nhắn.",
      },
    ],
  }),
  component: ScratchTemplate,
});

function ScratchTemplate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [percent, setPercent] = useState(0);
  const drawing = useRef(false);

  const paint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#e88aab");
    grad.addColorStop(0.5, "#c45c7c");
    grad.addColorStop(1, "#9b72cf");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "600 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("✿ Cào để lộ bí mật ✿", canvas.width / 2, canvas.height / 2);
    setPercent(0);
    setRevealed(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = 480 * ratio;
    canvas.height = 300 * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    paint();
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const px = (x - rect.left) * (canvas.width / rect.width);
    const py = (y - rect.top) * (canvas.height / rect.height);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(px, py, 30, 0, Math.PI * 2);
    ctx.fill();

    // Sample coverage every few strokes
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    for (let i = 3; i < imgData.data.length; i += 4 * 200) {
      if (imgData.data[i] === 0) clear++;
    }
    const total = imgData.data.length / (4 * 200);
    const p = clear / total;
    setPercent(p);
    if (p > 0.55 && !revealed) {
      setRevealed(true);
      heartsBurst();
    }
  };

  const handle = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  return (
    <div className="relative min-h-screen bg-gradient-blossom">
      <PetalsFall count={10} />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="font-script text-3xl text-primary">Có gì đó cho em</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Cào lớp phủ ra nhé</h1>
        <p className="mt-3 text-muted-foreground">
          Giữ chuột và di để lộ lời nhắn bên dưới ({Math.round(percent * 100)}%)
        </p>
      </section>

      <section className="relative z-20 mx-auto max-w-lg px-4 pb-16">
        <div className="relative mx-auto aspect-[8/5] w-full overflow-hidden rounded-3xl border border-border/60 bg-card shadow-petal">
          {/* Message underneath */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#fff5f9] to-[#ffe0ec] p-6 text-center">
            <p className="font-script text-3xl text-primary sm:text-4xl">Anh yêu em ♡</p>
            <p className="mt-3 font-display text-lg text-foreground/80 sm:text-xl">
              Cảm ơn em vì đã là điều đẹp nhất trong đời anh.
            </p>
          </div>
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              drawing.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratch(e.clientX, e.clientY);
            }}
            onPointerMove={handle}
            onPointerUp={() => (drawing.current = false)}
            className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing"
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={paint}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" /> Cào lại
          </button>
        </div>

        {revealed && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center font-script text-3xl text-primary"
          >
            Em thấy chưa? ❤
          </motion.p>
        )}
      </section>
    </div>
  );
}
