import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";

export const Route = createFileRoute("/t/polaroid")({
  head: () => ({
    meta: [
      { title: "Polaroid — Album kiểu vintage" },
      {
        name: "description",
        content: "Ảnh polaroid treo dây đèn, kẹp gỗ, kéo thả trên tường — thay ảnh thật của bạn.",
      },
    ],
  }),
  component: PolaroidTemplate,
});

/** 3 ảnh treo trên dây (slot 0-2) + 6 ảnh dán tường (slot 3-8). */
const hangingCards = [
  {
    hue: "from-[#f8c8d8] to-[#c45c7c]",
    caption: "Nụ cười đó",
    date: "05 · 2022",
    left: 6,
    top: 76,
    sway: 5.2,
  },
  {
    hue: "from-[#ffe0b3] to-[#e88a5c]",
    caption: "Lần đầu nắm tay",
    date: "06 · 2022",
    left: 40,
    top: 60,
    sway: 6.4,
  },
  {
    hue: "from-[#c9e4d8] to-[#4a9a7a]",
    caption: "Sinh nhật em",
    date: "09 · 2022",
    left: 72,
    top: 42,
    sway: 5.8,
  },
];

const wallCards = [
  {
    hue: "from-[#f7c8d8] to-[#c45c7c]",
    caption: "Chuyến đi đầu tiên",
    date: "07 · 2022",
    rot: -6,
    top: 6,
    left: 6,
  },
  {
    hue: "from-[#ffe0b3] to-[#e88a5c]",
    caption: "Buổi sáng đó",
    date: "10 · 2022",
    rot: 5,
    top: 2,
    left: 38,
  },
  {
    hue: "from-[#c9a0dc] to-[#7a5cc4]",
    caption: "Đêm pháo hoa",
    date: "12 · 2022",
    rot: -3,
    top: 10,
    left: 68,
  },
  {
    hue: "from-[#a8d8c0] to-[#4a9a7a]",
    caption: "Cà phê chiều",
    date: "02 · 2023",
    rot: 7,
    top: 44,
    left: 12,
  },
  {
    hue: "from-[#f8c8d8] to-[#9b72cf]",
    caption: "Ngày mưa",
    date: "05 · 2023",
    rot: -4,
    top: 48,
    left: 44,
  },
  {
    hue: "from-[#ffd0a8] to-[#c45c7c]",
    caption: "Bên biển",
    date: "08 · 2023",
    rot: 8,
    top: 42,
    left: 72,
  },
];

const TOTAL_SLOTS = hangingCards.length + wallCards.length;

/** Bóng đèn dọc theo dây (toạ độ khớp path trong viewBox 1000×80). */
const bulbs = [
  { x: 60, y: 38, c: "#ffd9a0" },
  { x: 145, y: 47, c: "#f8c8d8" },
  { x: 235, y: 53, c: "#fff3c4" },
  { x: 325, y: 53, c: "#ffd9a0" },
  { x: 415, y: 47, c: "#f8c8d8" },
  { x: 500, y: 37, c: "#fff3c4" },
  { x: 590, y: 24, c: "#ffd9a0" },
  { x: 690, y: 17, c: "#f8c8d8" },
  { x: 790, y: 16, c: "#fff3c4" },
  { x: 890, y: 21, c: "#ffd9a0" },
  { x: 960, y: 27, c: "#f8c8d8" },
];

type Lightbox = { img?: string; hue: string; caption: string; date: string } | null;

function PolaroidTemplate() {
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<Lightbox>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  // Phân biệt kéo-thả với click mở lightbox.
  const wasDragged = useRef(false);

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

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f5efe4]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(255,250,235,0.9), transparent 60%)," +
          "radial-gradient(#d9c9a8 1px, transparent 1px)",
        backgroundSize: "100% 100%, 22px 22px",
      }}
    >
      <style>{`
        @keyframes polaroidSway {
          0%, 100% { transform: rotate(-2.2deg); }
          50% { transform: rotate(2.2deg); }
        }
        @keyframes bulbGlow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
      <PetalsFall count={8} />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-4xl px-4 pb-4 pt-8 text-center">
        <p className="font-script text-3xl text-[#c45c7c]">Kỷ niệm của mình</p>
        <h1 className="mt-2 font-display text-5xl text-[#3a2418]">Những mảnh ghép đẹp nhất</h1>
        <p className="mx-auto mt-3 max-w-lg text-[#6b5544]">
          Kéo ảnh trên tường để sắp xếp lại, chạm vào ảnh để xem to — và thay bằng ảnh của hai đứa.
        </p>
      </section>

      {/* ---- Dây đèn + ảnh treo bằng kẹp gỗ ---- */}
      <section className="relative z-20 mx-auto h-[340px] max-w-5xl sm:h-[360px]">
        <svg
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1000 80"
        >
          {/* Dây đôi cho có chiều sâu */}
          <path
            d="M0 20 Q 250 70, 500 30 T 1000 25"
            stroke="#7a5f4e"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M0 22 Q 250 72, 500 32 T 1000 27"
            stroke="#a98c74"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
          {/* Bóng đèn phát sáng nhấp nháy */}
          {bulbs.map((b, i) => (
            <g key={i}>
              <line x1={b.x} y1={b.y - 6} x2={b.x} y2={b.y - 1} stroke="#7a5f4e" strokeWidth="1" />
              <circle
                cx={b.x}
                cy={b.y + 3}
                r="4.5"
                fill={b.c}
                style={{
                  filter: `drop-shadow(0 0 6px ${b.c}) drop-shadow(0 0 14px ${b.c})`,
                  animation: `bulbGlow ${2.2 + (i % 3) * 0.7}s ease-in-out ${i * 0.35}s infinite`,
                }}
              />
            </g>
          ))}
        </svg>

        {hangingCards.map((p, i) => {
          const img = imgFor(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.18, type: "spring", stiffness: 90, damping: 14 }}
              className="absolute z-20 w-36 cursor-pointer sm:w-44"
              style={{ left: `${p.left}%`, top: p.top }}
              onClick={() => setLightbox({ img, hue: p.hue, caption: p.caption, date: p.date })}
            >
              {/* Đung đưa quanh điểm kẹp */}
              <div
                style={{
                  transformOrigin: "top center",
                  animation: `polaroidSway ${p.sway}s ease-in-out infinite`,
                }}
              >
                {/* Kẹp gỗ */}
                <div className="absolute -top-4 left-1/2 z-10 h-8 w-3 -translate-x-1/2 rounded-[3px] bg-gradient-to-b from-[#c69c6d] to-[#a87f52] shadow-sm">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#7a5f4e]/60" />
                </div>
                <div className="rounded-sm bg-white p-2.5 pb-1 shadow-[0_10px_24px_rgba(90,60,40,0.28)]">
                  <PolaroidPhoto img={img} hue={p.hue} delay={0.5 + i * 0.2} />
                  <div className="pt-2 text-center font-script text-lg text-[#3a2418]">
                    {p.caption}
                  </div>
                  <div className="pb-1 text-center text-[9px] uppercase tracking-widest text-[#8b6f5e]">
                    {p.date}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ---- Tường ảnh: kéo thả tự do ---- */}
      <section className="relative z-20 mx-auto max-w-5xl px-4 pb-16">
        <div ref={wallRef} className="relative h-[880px] sm:h-[660px]">
          {/* Doodle vẽ tay trang trí */}
          <svg
            className="pointer-events-none absolute left-[30%] top-[36%] h-14 w-20 text-[#c45c7c]/50"
            viewBox="0 0 80 56"
            fill="none"
          >
            <path
              d="M40 48 C 12 30, 16 8, 32 12 C 38 14, 40 20, 40 22 C 40 20, 42 14, 48 12 C 64 8, 68 30, 40 48 Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="pointer-events-none absolute right-[6%] top-[30%] h-10 w-24 text-[#8b6f5e]/50"
            viewBox="0 0 96 40"
            fill="none"
          >
            <path
              d="M4 30 C 30 10, 60 10, 86 22 M 78 14 L 86 22 L 76 26"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="pointer-events-none absolute left-[4%] top-[34%] -rotate-6 font-script text-2xl text-[#c45c7c]/50">
            mãi yêu ♡
          </p>

          {wallCards.map((p, i) => {
            const slot = hangingCards.length + i;
            const img = imgFor(slot);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: p.rot }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 120, damping: 15 }}
                whileHover={{ scale: 1.06, rotate: 0, zIndex: 40 }}
                whileDrag={{ scale: 1.1, rotate: 0, zIndex: 50 }}
                drag
                dragConstraints={wallRef}
                dragMomentum={false}
                onDragStart={() => {
                  wasDragged.current = true;
                }}
                onDragEnd={() => {
                  window.setTimeout(() => {
                    wasDragged.current = false;
                  }, 80);
                }}
                onClick={() => {
                  if (!wasDragged.current)
                    setLightbox({ img, hue: p.hue, caption: p.caption, date: p.date });
                }}
                className="absolute w-48 cursor-grab rounded-sm bg-white p-3 shadow-xl active:cursor-grabbing sm:w-56"
                style={{ top: `${p.top}%`, left: `${p.left}%` }}
              >
                {/* Băng dính washi */}
                <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-3 bg-[#f0e5c9]/85 shadow-sm" />
                <PolaroidPhoto img={img} hue={p.hue} delay={0.3 + i * 0.15} />
                <div className="pt-3 text-center font-script text-xl text-[#3a2418]">
                  {p.caption}
                </div>
                <div className="pb-1 text-center text-[10px] uppercase tracking-widest text-[#8b6f5e]">
                  {p.date}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-20 mx-auto max-w-xl px-4 pb-28 text-center">
        <div className="mx-auto max-w-md -rotate-2 rounded bg-[#fffbf0] p-8 shadow-xl">
          <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 bg-[#f8c8d8]/70 shadow-sm" />
          <p className="font-script text-3xl leading-snug text-[#3a2418]">
            "Cảm ơn em vì đã đứng lại trong từng khung hình của anh."
          </p>
          <p className="mt-4 text-right text-sm text-[#8b6f5e]">— Của em ♡</p>
        </div>
      </section>

      {/* Nút thêm ảnh */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
        <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#c45c7c] px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(196,92,124,0.45)] transition-transform hover:scale-105">
          <ImagePlus className="h-4 w-4" />
          {images.length ? `Đã thêm ${images.length} ảnh — thêm nữa` : "Thay bằng ảnh của hai đứa"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </div>

      {/* Lightbox: polaroid phóng to */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a2418]/70 p-6 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -5 }}
              animate={{ scale: 1, rotate: -1.5 }}
              exit={{ scale: 0.7, rotate: 5 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative w-full max-w-sm rounded-sm bg-white p-4 pb-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.img ? (
                <img
                  src={lightbox.img}
                  alt=""
                  className="aspect-square w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className={`aspect-square w-full bg-gradient-to-br ${lightbox.hue}`} />
              )}
              <div className="pt-4 text-center font-script text-3xl text-[#3a2418]">
                {lightbox.caption}
              </div>
              <div className="pb-2 pt-1 text-center text-xs uppercase tracking-widest text-[#8b6f5e]">
                {lightbox.date}
              </div>
              <button
                onClick={() => setLightbox(null)}
                aria-label="Đóng"
                className="absolute -right-3 -top-3 rounded-full bg-[#3a2418] p-2 text-white shadow-lg transition-colors hover:bg-[#5a4030]"
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

/** Ảnh polaroid với hiệu ứng "tráng phim": hiện dần từ tối sepia sang rõ nét. */
function PolaroidPhoto({ img, hue, delay }: { img?: string; hue: string; delay: number }) {
  return (
    <motion.div
      initial={{ filter: "sepia(0.7) brightness(0.35) contrast(0.85)" }}
      whileInView={{ filter: "sepia(0) brightness(1) contrast(1)" }}
      viewport={{ once: true }}
      transition={{ duration: 2.4, delay, ease: "easeOut" }}
      className="aspect-square w-full overflow-hidden"
    >
      {img ? (
        <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className={`h-full w-full bg-gradient-to-br ${hue}`} />
      )}
    </motion.div>
  );
}
