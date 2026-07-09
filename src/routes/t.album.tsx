import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";
import { LoveClock } from "@/components/love/LoveClock";

export const Route = createFileRoute("/t/album")({
  head: () => ({
    meta: [
      { title: "Album kỷ niệm — Love Letters" },
      {
        name: "description",
        content: "Album ảnh chuyển cảnh, timeline và đồng hồ đếm ngày yêu nhau.",
      },
    ],
  }),
  component: AlbumTemplate,
});

const photos = [
  { hue: "from-[oklch(0.9_0.06_20)] to-[oklch(0.75_0.12_355)]", caption: "Lần đầu gặp gỡ" },
  { hue: "from-[oklch(0.88_0.08_350)] to-[oklch(0.7_0.14_355)]", caption: "Chuyến đi đầu tiên" },
  { hue: "from-[oklch(0.92_0.05_30)] to-[oklch(0.78_0.11_350)]", caption: "Đêm pháo hoa" },
  { hue: "from-[oklch(0.85_0.09_355)] to-[oklch(0.65_0.13_355)]", caption: "Buổi sáng bên nhau" },
];

const timeline = [
  {
    date: "14 · 02 · 2022",
    title: "Ngày đầu tiên",
    text: "Anh gõ một câu chào rụt rè. Em cười — thế là bắt đầu.",
  },
  {
    date: "07 · 07 · 2022",
    title: "Chuyến đi Đà Lạt",
    text: "Sương mù, cà phê nóng và bàn tay em trong tay anh.",
  },
  {
    date: "24 · 12 · 2022",
    title: "Giáng sinh đầu",
    text: "Không quà cầu kỳ, chỉ có nhau và một ly chocolate nóng.",
  },
  {
    date: "14 · 02 · 2024",
    title: "Hai năm bên nhau",
    text: "Cảm ơn em vì mọi buổi sáng thức dậy đều thấy nhẹ lòng.",
  },
];

function AlbumTemplate() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % photos.length);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);

  return (
    <div className="relative min-h-screen bg-gradient-blossom">
      <PetalsFall count={14} />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="font-script text-2xl text-primary">Kỷ niệm của chúng ta</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Album những ngày bên nhau</h1>
      </section>

      <section className="relative z-20 mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-petal">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
              className={`aspect-[16/10] w-full bg-gradient-to-br ${photos[idx].hue}`}
            >
              <div className="flex h-full items-end p-8">
                <div className="rounded-full bg-white/70 px-5 py-2 font-script text-2xl text-primary shadow-soft backdrop-blur">
                  {photos[idx].caption}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-soft transition-transform hover:scale-110"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-soft transition-transform hover:scale-110"
            aria-label="Ảnh sau"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx ? "w-8 bg-primary" : "w-2 bg-primary/30"
              }`}
              aria-label={`Ảnh ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="relative z-20 mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center font-display text-3xl">Đã bên nhau</h2>
        <div className="mt-6">
          <LoveClock since="2022-02-14T00:00:00" />
        </div>
      </section>

      <section className="relative z-20 mx-auto max-w-3xl px-4 pb-24">
        <h2 className="text-center font-display text-3xl">Dòng thời gian</h2>
        <div className="relative mt-10 border-l-2 border-primary/30 pl-6">
          {timeline.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative mb-10 last:mb-0"
            >
              <span className="absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                <Heart className="h-3 w-3 fill-current" />
              </span>
              <div className="rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur">
                <div className="text-xs uppercase tracking-widest text-primary">{t.date}</div>
                <h3 className="mt-1 font-display text-xl">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
