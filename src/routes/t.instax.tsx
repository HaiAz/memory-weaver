import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";

export const Route = createFileRoute("/t/instax")({
  head: () => ({
    meta: [
      { title: "Instax — Rút ảnh máy chụp lấy liền" },
      {
        name: "description",
        content:
          "Bấm nút chụp, ảnh polaroid trượt ra khỏi máy và hiện dần như thật.",
      },
    ],
  }),
  component: InstaxTemplate,
});

const shots = [
  {
    hue: "from-[#f7c8d8] via-[#e88aa8] to-[#c45c7c]",
    caption: "Nụ cười của em",
    date: "14 · 02 · 2024",
  },
  {
    hue: "from-[#ffd6a5] via-[#ffb088] to-[#c47a5c]",
    caption: "Hoàng hôn hôm đó",
    date: "07 · 07 · 2024",
  },
  {
    hue: "from-[#c9a0dc] via-[#a07ac4] to-[#6a4a9c]",
    caption: "Đêm pháo hoa",
    date: "31 · 12 · 2024",
  },
  {
    hue: "from-[#a8d8c0] via-[#7abfa0] to-[#4a8a7a]",
    caption: "Sáng chủ nhật",
    date: "22 · 03 · 2025",
  },
];

function InstaxTemplate() {
  const [taken, setTaken] = useState<number[]>([]);
  const [shooting, setShooting] = useState(false);
  const [flash, setFlash] = useState(false);

  const next = shots[taken.length % shots.length];
  const canShoot = taken.length < shots.length && !shooting;

  const shoot = () => {
    if (!canShoot) return;
    setShooting(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    setTimeout(() => {
      setTaken((t) => [...t, t.length]);
      setShooting(false);
    }, 600);
  };

  const reset = () => setTaken([]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f5efe4] to-[#e8d5c0]">
      <PetalsFall count={8} />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-3xl px-4 pt-10 pb-6 text-center">
        <p className="font-script text-3xl text-[#c45c7c]">Chụp lấy liền</p>
        <h1 className="mt-2 font-display text-4xl text-[#3a2418] sm:text-5xl">
          Bấm nút để lưu một khoảnh khắc
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#6b5544]">
          Mỗi lần bấm, một tấm polaroid sẽ trượt ra khỏi máy và hiện dần như thật.
        </p>
      </section>

      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-30 bg-white"
          />
        )}
      </AnimatePresence>

      <section className="relative z-20 mx-auto flex max-w-md flex-col items-center px-4">
        {/* Camera */}
        <div className="relative w-full max-w-[340px]">
          {/* Photo ejection area — behind camera body */}
          <div className="relative mx-auto h-[300px] w-[240px]">
            <AnimatePresence>
              {shooting && (
                <motion.div
                  key={`ejecting-${taken.length}`}
                  initial={{ y: -180, opacity: 0 }}
                  animate={{ y: 40, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 top-0 z-0 w-[210px] -translate-x-1/2 rounded-sm bg-white p-3 shadow-2xl"
                >
                  <div className="h-40 w-full bg-[#1a1a1a]" />
                  <div className="pt-3 text-center font-script text-lg text-[#3a2418]/40">
                    đang hiện...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Camera body */}
          <div className="relative z-10 -mt-[220px] rounded-[28px] bg-gradient-to-b from-[#f8b8c8] to-[#e88aa8] p-5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)]">
            <div className="rounded-2xl bg-white/40 p-4 backdrop-blur-sm">
              {/* Top bar with lens */}
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-red-500 shadow-inner" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                  Love · Instant
                </div>
                <div className="h-2 w-8 rounded-full bg-white/60" />
              </div>

              {/* Lens */}
              <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] shadow-inner">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#3a3a3a] to-[#111]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#5a7a9a] to-[#1a2a3a] shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                    <div className="h-6 w-6 rounded-full bg-white/30 blur-[2px]" />
                  </div>
                </div>
              </div>

              {/* Viewfinder + counter */}
              <div className="mt-4 flex items-center justify-between">
                <div className="h-6 w-10 rounded-sm bg-black/70" />
                <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#c45c7c]">
                  {shots.length - taken.length} kiểu còn lại
                </div>
              </div>
            </div>

            {/* Shutter */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={shoot}
                disabled={!canShoot}
                className="group relative h-14 w-14 rounded-full bg-white/80 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Chụp ảnh"
              >
                <span className="absolute inset-2 rounded-full bg-[#c45c7c] shadow-inner group-active:bg-[#a54460]" />
                <Camera className="absolute inset-0 m-auto h-5 w-5 text-white" />
              </button>
            </div>

            {/* Slot */}
            <div className="mx-auto mt-4 h-2 w-40 rounded-full bg-black/50 shadow-inner" />
          </div>
        </div>

        {taken.length > 0 && (
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#c45c7c]/30 bg-white/60 px-4 py-1.5 text-xs text-[#c45c7c] transition-colors hover:bg-white"
          >
            <RotateCcw className="h-3 w-3" /> Chụp lại từ đầu
          </button>
        )}

        {taken.length === shots.length && (
          <p className="mt-4 text-center font-script text-2xl text-[#c45c7c]">
            Hết phim rồi — nhưng kỷ niệm thì mãi ♡
          </p>
        )}
      </section>

      {/* Gallery of taken photos */}
      <section className="relative z-20 mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {taken.map((i) => {
            const s = shots[i];
            const rot = [-4, 3, -2, 5][i % 4];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotate: 0, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotate: rot, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="rounded-sm bg-white p-3 shadow-xl"
              >
                <motion.div
                  initial={{ filter: "brightness(0.1) contrast(0.3)" }}
                  animate={{ filter: "brightness(1) contrast(1)" }}
                  transition={{ duration: 2.4, delay: 0.3 }}
                  className={`h-36 w-full bg-gradient-to-br ${s.hue}`}
                />
                <div className="pt-2 text-center font-script text-lg text-[#3a2418]">
                  {s.caption}
                </div>
                <div className="pb-1 text-center text-[10px] uppercase tracking-widest text-[#8b6f5e]">
                  {s.date}
                </div>
              </motion.div>
            );
          })}
        </div>

        {taken.length === 0 && (
          <p className="text-center text-sm text-[#8b6f5e]">
            Chưa có tấm ảnh nào — bấm nút chụp ở trên nhé.
          </p>
        )}

        {/* Preview next caption teaser */}
        {taken.length < shots.length && (
          <p className="mt-8 text-center text-xs text-[#8b6f5e]/70">
            Tấm tiếp theo: <span className="font-script text-base">{next.caption}</span>
          </p>
        )}
      </section>
    </div>
  );
}
