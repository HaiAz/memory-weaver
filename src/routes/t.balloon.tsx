import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { fireConfetti, heartsBurst } from "@/components/love/confettiHelpers";

export const Route = createFileRoute("/t/balloon")({
  head: () => ({
    meta: [
      { title: "Balloon — Bóng bay tình yêu" },
      {
        name: "description",
        content: "Bấm nổ từng quả bóng bay để lộ lời tỏ tình — có tiếng nổ và pháo giấy thật.",
      },
    ],
  }),
  component: BalloonTemplate,
});

const words = ["Anh", "muốn", "được", "ở", "bên", "em", "mãi", "mãi", "❤"];

/** [gradient bóng, màu mảnh vụn khi nổ] */
const palettes: [string, string][] = [
  ["from-[#ff9ec4] to-[#e84393]", "#e84393"],
  ["from-[#ffd6a5] to-[#f7931e]", "#f7931e"],
  ["from-[#c9a0dc] to-[#9b72cf]", "#9b72cf"],
  ["from-[#a0e7e5] to-[#4a9aa8]", "#4a9aa8"],
  ["from-[#ffb3c1] to-[#c45c7c]", "#c45c7c"],
];

/** Bóng bay chữ: vị trí rải đều, nhịp bồng bềnh lệch nhau. */
const balloons = words.map((word, i) => ({
  id: i,
  word,
  left: 4 + ((i * 31 + 7) % 84),
  top: 12 + ((i * 23 + 5) % 55),
  bobDur: 3.4 + (i % 4) * 0.7,
  delay: (i * 7) % 5,
  palette: palettes[i % palettes.length],
}));

/** Bóng bay nền bay lên liên tục cho không khí lễ hội.
 *  Kích thước set bằng width/height — KHÔNG dùng CSS property `scale`,
 *  vì scale nhân vào trước transform sẽ co cả translateY của keyframes bay lên. */
const decoBalloons = Array.from({ length: 6 }, (_, i) => ({
  left: (i * 37 + 11) % 94,
  size: 0.4 + ((i * 13) % 45) / 100, // hệ số 0.4..0.84
  duration: 11 + ((i * 29) % 10),
  delay: -((i * 41) % 17),
  sway: 14 + ((i * 19) % 26),
  palette: palettes[(i * 3 + 1) % palettes.length],
}));

const clouds = [
  { top: "6%", left: "-5%", w: 220, dur: 46 },
  { top: "16%", left: "55%", w: 300, dur: 62 },
  { top: "30%", left: "20%", w: 180, dur: 54 },
];

/** Thời gian bóng bay vụt lên trước khi nổ (ms). */
const FLIGHT_MS = 720;

function BalloonTemplate() {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  // Bóng đang bay lên chờ nổ — không cho bấm lại.
  const [flying, setFlying] = useState<Set<number>>(new Set());
  const [accepted, setAccepted] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const btnRefs = useRef(new Map<number, HTMLElement>());
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  /** Tiếng "bụp" tổng hợp bằng WebAudio — không cần file âm thanh. */
  const popSound = useCallback(() => {
    try {
      audioCtx.current ??= new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.13);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Trình duyệt chặn audio thì bỏ qua, không làm hỏng trải nghiệm.
    }
  }, []);
  useEffect(() => {
    return () => {
      audioCtx.current?.close().catch(() => {});
    };
  }, []);

  // Guard đồng bộ chống bấm trùng — KHÔNG dùng cờ gán trong updater của setState:
  // React chỉ chạy updater ngay khi hàng đợi rỗng, bấm nhanh nhiều bóng sẽ bị hoãn
  // khiến cờ chưa kịp bật và timeout nổ không bao giờ được đặt.
  const inFlight = useRef<Set<number>>(new Set());

  /** Bấm bóng: bay vụt lên trước, hết đà mới nổ tại chỗ trên cao. */
  const launch = useCallback(
    (id: number) => {
      if (inFlight.current.has(id)) return;
      inFlight.current.add(id);
      setFlying((f) => new Set(f).add(id));

      timers.current.push(
        window.setTimeout(() => {
          // Nổ đúng vị trí bóng đang ở trên cao (đọc từ chính element).
          const el = btnRefs.current.get(id);
          let origin = { x: 0.5, y: 0.25 };
          if (el) {
            const r = el.getBoundingClientRect();
            origin = {
              x: (r.left + r.width / 2) / window.innerWidth,
              y: (r.top + r.height / 4) / window.innerHeight,
            };
          }
          popSound();
          confetti({
            particleCount: 32,
            spread: 360,
            startVelocity: 22,
            gravity: 0.9,
            ticks: 55,
            scalar: 0.9,
            zIndex: 45,
            origin,
            colors: [balloons[id].palette[1], "#fff", "#ffe3f0"],
          });
          setPopped((p) => new Set(p).add(id));
        }, FLIGHT_MS),
      );
    },
    [popSound],
  );

  const allPopped = popped.size === words.length;

  // Pop hết → tự bắn pháo giấy ăn mừng.
  useEffect(() => {
    if (allPopped) fireConfetti();
  }, [allPopped]);

  const accept = useCallback(() => {
    setAccepted(true);
    fireConfetti();
    heartsBurst();
    window.setTimeout(heartsBurst, 600);
    window.setTimeout(fireConfetti, 1200);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#dceefe] via-[#fdf3f7] to-[#f8c8d8]">
      <style>{`
        @keyframes balloonRise {
          0% { transform: translateY(112vh) translateX(0) rotate(-4deg); }
          50% { transform: translateY(44vh) translateX(var(--bx, 20px)) rotate(4deg); }
          100% { transform: translateY(-28vh) translateX(0) rotate(-3deg); }
        }
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(60px); }
        }
        @keyframes balloonBob {
          0%, 100% { transform: translateY(-12px); }
          50% { transform: translateY(12px); }
        }
      `}</style>

      {/* Mây trôi */}
      {clouds.map((c, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-0 rounded-full bg-white/70 blur-xl"
          style={{
            top: c.top,
            left: c.left,
            width: c.w,
            height: c.w * 0.32,
            animation: `cloudDrift ${c.dur}s ease-in-out infinite`,
          }}
          aria-hidden
        />
      ))}

      {/* Bóng bay nền bay lên liên tục */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {decoBalloons.map((b, i) => (
          <div
            key={i}
            className="absolute top-0 opacity-55"
            style={{
              left: `${b.left}%`,
              ["--bx" as string]: `${b.sway}px`,
              animation: `balloonRise ${b.duration}s linear ${b.delay}s infinite`,
            }}
          >
            <div
              className={`relative bg-gradient-to-b ${b.palette[0]}`}
              style={{ width: 64 * b.size, height: 80 * b.size, borderRadius: "50% 50% 47% 47%" }}
            >
              <div className="absolute left-[15%] top-[12%] h-[28%] w-[18%] -rotate-[24deg] rounded-full bg-white/50 blur-[1px]" />
            </div>
            <div className="mx-auto w-px bg-[#b97a94]/50" style={{ height: 40 * b.size }} />
          </div>
        ))}
      </div>

      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-3xl px-4 pb-2 pt-10 text-center">
        <p className="font-script text-3xl text-primary">Bấm hết bóng bay nhé</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Em sẽ thấy điều anh muốn nói</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {allPopped ? "Xong rồi đó ❤" : `Đã nổ ${popped.size}/${words.length} quả bóng`}
        </p>
      </section>

      {/* Câu được ghép dần */}
      <div className="relative z-20 mx-auto flex min-h-24 max-w-2xl flex-wrap items-center justify-center gap-2 px-4 py-4">
        {words.map((w, i) =>
          popped.has(i) ? (
            <motion.span
              key={i}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="rounded-2xl bg-white/75 px-4 py-1.5 font-display text-2xl text-primary shadow-soft backdrop-blur"
            >
              {w}
            </motion.span>
          ) : (
            <span
              key={i}
              className="rounded-2xl border-2 border-dashed border-primary/30 px-4 py-1.5 text-2xl text-transparent"
              aria-hidden
            >
              {w}
            </span>
          ),
        )}
      </div>

      {/* Vườn bóng bay chữ — overflow visible để bóng bay vụt lên khỏi field trước khi nổ */}
      <div className="relative z-10 h-[520px] w-full sm:h-[560px]">
        {balloons.map((b) => (
          <div key={b.id} className="absolute" style={{ left: `${b.left}%`, top: `${b.top}%` }}>
            <AnimatePresence>
              {!popped.has(b.id) && (
                <motion.button
                  ref={(el) => {
                    if (el) btnRefs.current.set(b.id, el);
                    else btnRefs.current.delete(b.id);
                  }}
                  onClick={() => launch(b.id)}
                  initial={{ y: 180, opacity: 0 }}
                  // Bấm rồi thì bay vụt lên (tăng tốc dần) chờ nổ; chưa bấm thì vào vị trí.
                  animate={flying.has(b.id) ? { y: -340, opacity: 1 } : { y: 0, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.15 } }}
                  transition={
                    flying.has(b.id)
                      ? { duration: FLIGHT_MS / 1000, ease: "easeIn" }
                      : { delay: b.id * 0.1, duration: 0.8, ease: "easeOut" }
                  }
                  whileHover={{ scale: 1.12 }}
                  className="group relative block"
                  style={{ cursor: flying.has(b.id) ? "default" : "pointer" }}
                  aria-label={`Bóng bay số ${b.id + 1}`}
                >
                  {/* Bồng bềnh bằng CSS keyframes, tách khỏi transform của framer */}
                  <div
                    style={{
                      animation: `balloonBob ${b.bobDur}s ease-in-out ${-b.delay}s infinite`,
                    }}
                  >
                    {/* Thân bóng: bóng loáng + chữ */}
                    <div
                      className={`relative h-24 w-20 bg-gradient-to-b ${b.palette[0]} shadow-[0_10px_24px_rgba(196,92,124,0.3)]`}
                      style={{ borderRadius: "50% 50% 47% 47%" }}
                    >
                      <div className="absolute left-3 top-3 h-7 w-3.5 -rotate-[24deg] rounded-full bg-white/55 blur-[1.5px]" />
                      {/* Giữ bí ẩn: không lộ chữ, chỉ gợi ý có điều gì bên trong */}
                      <span className="absolute inset-0 flex items-center justify-center font-script text-2xl text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                        ?
                      </span>
                    </div>
                    {/* Nút thắt */}
                    <div
                      className={`mx-auto -mt-1 h-2.5 w-3.5 bg-gradient-to-b ${b.palette[0]}`}
                      style={{ clipPath: "polygon(50% 0, 0 100%, 100% 100%)" }}
                    />
                    {/* Dây xoăn */}
                    <svg className="mx-auto h-14 w-4" viewBox="0 0 16 56" fill="none" aria-hidden>
                      <path
                        d="M8 0 C 14 10, 2 18, 8 28 C 14 38, 2 46, 8 56"
                        stroke="#b97a94"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Finale */}
      <AnimatePresence>
        {allPopped && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative z-20 mx-auto max-w-xl px-4 pb-20 text-center"
          >
            {accepted ? (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
              >
                <Heart className="mx-auto h-12 w-12 animate-heart-pulse fill-primary text-primary" />
                <h2 className="mt-4 font-script text-5xl text-primary">Yêu em ngàn lần ❤</h2>
                <p className="mt-3 text-muted-foreground">
                  Từ hôm nay, mọi quả bóng anh thả lên trời đều mang tên em.
                </p>
              </motion.div>
            ) : (
              <>
                <h2 className="font-script text-5xl text-primary">Em đồng ý nhé?</h2>
                <button
                  onClick={accept}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-petal transition-transform hover:scale-110"
                >
                  Đồng ý <Heart className="h-4 w-4 fill-current" />
                </button>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
