import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ImagePlus, X } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";

export const Route = createFileRoute("/t/orbit")({
  head: () => ({
    meta: [
      { title: "Orbit — Vòng xoay kỷ niệm" },
      {
        name: "description",
        content: "Ảnh của hai đứa xoay quanh trái tim theo vòng quỹ đạo trên nền hologram.",
      },
    ],
  }),
  component: OrbitTemplate,
});

/** 3 vòng quỹ đạo: bán kính, số ảnh, thời gian 1 vòng, chiều quay. */
const RINGS = [
  { radius: 130, count: 4, duration: 38, reverse: false },
  { radius: 225, count: 6, duration: 56, reverse: true },
  { radius: 320, count: 8, duration: 78, reverse: false },
];

/** Tổng slot ảnh: 1 tâm + ảnh trên các vòng. */
const TOTAL_SLOTS = 1 + RINGS.reduce((s, r) => s + r.count, 0);

const PLACEHOLDER_HUES = [
  "linear-gradient(135deg,#f7c8d8,#c45c7c)",
  "linear-gradient(135deg,#c9a0dc,#7a5cc4)",
  "linear-gradient(135deg,#a8d8e8,#5c8ac4)",
  "linear-gradient(135deg,#ffd9a0,#e88a5c)",
  "linear-gradient(135deg,#b8e8c8,#4aa47a)",
];

/** Sao lấp lánh rải quanh sân khấu (tất định để ổn định giữa các render). */
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 41 + 13) % 100,
  top: (i * 29 + 7) % 100,
  size: 1.5 + ((i * 7) % 3),
  dur: 2 + (i % 5) * 0.7,
  delay: (i % 9) * 0.4,
}));

function OrbitTemplate() {
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  // Vòng đang hover ảnh thì tạm dừng quay để dễ nhìn/bấm.
  const [pausedRing, setPausedRing] = useState<number | null>(null);

  const createdUrls = useRef<string[]>([]);
  const onFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    createdUrls.current.push(...urls);
    setImages((prev) => [...prev, ...urls].slice(0, TOTAL_SLOTS));
    e.target.value = "";
  }, []);
  useEffect(() => {
    const urls = createdUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const imgFor = (slot: number) => (images.length ? images[slot % images.length] : undefined);

  let slotCursor = 1; // slot 0 dành cho ảnh tâm

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        backgroundColor: "#12081f",
        backgroundImage:
          "radial-gradient(ellipse at 20% 15%, rgba(232,138,171,0.22), transparent 50%)," +
          "radial-gradient(ellipse at 82% 25%, rgba(120,200,170,0.16), transparent 45%)," +
          "radial-gradient(ellipse at 70% 85%, rgba(240,200,120,0.14), transparent 50%)," +
          "radial-gradient(ellipse at 25% 80%, rgba(140,90,220,0.2), transparent 50%)",
      }}
    >
      <style>{`
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbitSpinRev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes orbitTwinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        @keyframes orbitSheen { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbitPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>

      {/* Lớp sheen hologram xoay chậm */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-2xl"
        style={{
          background:
            "conic-gradient(from 0deg, #e88aab, #c9a0dc, #7ac8aa, #f0c878, #a8d8e8, #e88aab)",
          animation: "orbitSheen 90s linear infinite",
        }}
        aria-hidden
      />

      {/* Sao lấp lánh */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              boxShadow: "0 0 6px 1px rgba(255,255,255,0.5)",
              animation: `orbitTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-30">
        <SiteHeader />
      </div>

      <section className="relative z-20 mx-auto max-w-2xl px-4 pt-8 text-center">
        <p className="font-script text-3xl text-[#e88aab]">Vòng xoay kỷ niệm</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">
          Mọi khoảnh khắc đều <span className="italic text-[#c9a0dc]">xoay quanh em</span>
        </h1>
      </section>

      {/* ---- Sân khấu quỹ đạo ---- */}
      <div className="relative z-10 flex h-[420px] items-center justify-center sm:h-[600px] lg:h-[740px]">
        <div className="relative h-[700px] w-[700px] shrink-0 scale-[0.52] sm:scale-[0.78] lg:scale-100">
          {RINGS.map((ring, ri) => (
            <div
              key={ri}
              className="absolute left-1/2 top-1/2 rounded-full border border-white/15"
              style={{
                width: ring.radius * 2,
                height: ring.radius * 2,
                marginLeft: -ring.radius,
                marginTop: -ring.radius,
                animation: `${ring.reverse ? "orbitSpinRev" : "orbitSpin"} ${ring.duration}s linear infinite`,
                animationPlayState: pausedRing === ri ? "paused" : "running",
              }}
            >
              {Array.from({ length: ring.count }, (_, pi) => {
                const slot = slotCursor++;
                const angle = (360 / ring.count) * pi;
                const size = 76 + ((slot * 17) % 22);
                const img = imgFor(slot);
                return (
                  <div
                    key={pi}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      width: size,
                      height: size,
                      marginLeft: -size / 2,
                      marginTop: -size / 2,
                      transform: `rotate(${angle}deg) translateX(${ring.radius}px)`,
                    }}
                  >
                    {/* Quay ngược để ảnh luôn đứng thẳng khi vòng xoay */}
                    <div
                      className="h-full w-full"
                      style={{
                        animation: `${ring.reverse ? "orbitSpin" : "orbitSpinRev"} ${ring.duration}s linear infinite`,
                        animationPlayState: pausedRing === ri ? "paused" : "running",
                      }}
                    >
                      <button
                        onClick={() => setLightbox(img ?? "")}
                        onMouseEnter={() => setPausedRing(ri)}
                        onMouseLeave={() => setPausedRing(null)}
                        className="block h-full w-full overflow-hidden rounded-xl border-2 border-white/70 shadow-[0_0_18px_rgba(232,138,171,0.45)] transition-transform hover:scale-110"
                        style={{
                          transform: `rotate(${-angle}deg)`,
                          background: img
                            ? undefined
                            : PLACEHOLDER_HUES[slot % PLACEHOLDER_HUES.length],
                        }}
                        aria-label={`Ảnh kỷ niệm ${slot}`}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <Heart className="h-5 w-5 fill-white/70 text-white/70" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Tâm: ảnh chính + quầng sáng đập nhịp */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,138,171,0.45),rgba(140,90,220,0.15)_60%,transparent_75%)]"
              style={{ animation: "orbitPulse 3.4s ease-in-out infinite" }}
              aria-hidden
            />
            <button
              onClick={() => setLightbox(imgFor(0) ?? "")}
              className="relative block h-32 w-32 overflow-hidden rounded-full border-4 border-white/80 shadow-[0_0_40px_rgba(232,138,171,0.7)] transition-transform hover:scale-105"
              style={{
                background: imgFor(0) ? undefined : "linear-gradient(135deg,#e88aab,#7a5cc4)",
              }}
              aria-label="Ảnh trung tâm"
            >
              {imgFor(0) ? (
                <img
                  src={imgFor(0)}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Heart className="h-10 w-10 fill-white text-white" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <section className="relative z-20 mx-auto max-w-xl px-4 pb-32 text-center">
        <p className="font-display text-lg text-white/80">
          Dù thế giới có xoay bao nhiêu vòng, tâm của mọi quỹ đạo vẫn là em.
        </p>
        <p className="mt-3 font-script text-4xl text-[#e88aab]">— Mãi bên nhau ♡</p>
      </section>

      {/* Nút thêm ảnh */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
        <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#e88aab] px-6 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(232,138,171,0.6)] transition-transform hover:scale-105">
          <ImagePlus className="h-4 w-4" />
          {images.length
            ? `Đã thêm ${images.length} ảnh — thêm nữa`
            : "Thả ảnh của hai đứa vào đây"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && lightbox !== "" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#12081f]/85 p-6 backdrop-blur-md"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.6, rotate: 4 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="relative max-h-[82vh] max-w-[90vw] overflow-hidden rounded-3xl border border-white/25 shadow-[0_0_80px_rgba(232,138,171,0.5)]"
            >
              <img
                src={lightbox}
                alt=""
                className="max-h-[82vh] max-w-[90vw] object-contain"
                draggable={false}
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white/90 backdrop-blur transition-colors hover:bg-black/70"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
