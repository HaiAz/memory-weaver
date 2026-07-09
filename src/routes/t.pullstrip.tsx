import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Camera, Upload, RotateCcw, Download } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";

export const Route = createFileRoute("/t/pullstrip")({
  head: () => ({
    meta: [
      { title: "Kéo phim ảnh — Love Letters" },
      {
        name: "description",
        content:
          "Bấm chụp, kéo dải phim polaroid dài ra khỏi máy ảnh với ảnh của bạn.",
      },
    ],
  }),
  component: PullStripTemplate,
});

const DEFAULT_PHOTOS = [
  { hue: "from-[#f8b8c8] to-[#c45c7c]", caption: "Ngày mình gặp nhau" },
  { hue: "from-[#ffd8b8] to-[#ff9a76]", caption: "Chuyến đi đầu tiên" },
  { hue: "from-[#c8b8f8] to-[#7c5cc4]", caption: "Đêm pháo hoa" },
  { hue: "from-[#b8f8d8] to-[#5cc47c]", caption: "Sáng chủ nhật" },
  { hue: "from-[#f8e8b8] to-[#c4a45c]", caption: "Mình mãi bên nhau" },
];

type PhotoItem = { url?: string; hue?: string; caption: string };

const CARD_H = 180;
const CARD_GAP = 12;

function PullStripTemplate() {
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [shot, setShot] = useState(false);
  const [flash, setFlash] = useState(false);
  const y = useMotionValue(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const stripLen = photos.length * (CARD_H + CARD_GAP);
  const maxPull = stripLen + 40;

  // Hint arrow opacity fades as user pulls
  const hintOp = useTransform(y, [0, 120], [1, 0]);

  const shoot = () => {
    if (shot) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    setTimeout(() => setShot(true), 250);
  };

  const reset = () => {
    animate(y, 0, { duration: 0.4 });
    setTimeout(() => setShot(false), 400);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const items: PhotoItem[] = files.map((f, i) => ({
      url: URL.createObjectURL(f),
      caption: `Khoảnh khắc ${i + 1}`,
    }));
    setPhotos(items);
    reset();
  };

  useEffect(() => {
    return () => {
      photos.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-blossom">
      <PetalsFall count={12} />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="font-script text-2xl text-primary">Kéo dải phim kỷ niệm</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">
          Bấm chụp — rồi kéo dài mãi…
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tải ảnh của hai đứa lên, bấm nút chụp, và kéo dải phim polaroid xuống.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-card"
          >
            <Upload className="h-4 w-4" /> Tải ảnh lên
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-card"
          >
            <RotateCcw className="h-4 w-4" /> Chụp lại
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onUpload}
          />
        </div>
      </section>

      <section className="relative z-20 mx-auto flex max-w-xl flex-col items-center px-4 pb-16">
        {/* Camera body */}
        <div className="relative z-30 w-full max-w-[380px] rounded-[32px] bg-gradient-to-b from-[#2a1a24] to-[#1a0e16] p-6 shadow-2xl">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
            <span>LoveShot</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              REC
            </span>
          </div>

          {/* Lens */}
          <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-black to-[#1a0e16] ring-4 ring-white/10">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#3a1a2a] to-black ring-2 ring-primary/30">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black ring-2 ring-primary/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary shadow-inner" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-white/50">
              {photos.length} shots
            </div>
            <button
              onClick={shoot}
              disabled={shot}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg ring-4 ring-white/20 transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
              aria-label="Chụp"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <div className="text-[10px] uppercase tracking-widest text-white/50">
              ISO 400
            </div>
          </div>

          {/* Slot at bottom */}
          <div className="mt-6 h-3 rounded-full bg-black/70 shadow-inner" />
        </div>

        {/* Strip area */}
        <div className="relative mt-[-8px] w-full max-w-[380px]" style={{ height: maxPull + 60 }}>
          {shot && (
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: maxPull }}
              dragElastic={0.05}
              style={{ y }}
              className="absolute left-1/2 top-0 -translate-x-1/2 cursor-grab active:cursor-grabbing"
            >
              {/* Grip tab */}
              <div className="mx-auto flex h-6 w-40 items-end justify-center rounded-b-2xl bg-gradient-to-b from-white to-neutral-200 shadow-md">
                <div className="mb-1 h-1 w-10 rounded-full bg-neutral-400" />
              </div>

              {/* Photo strip */}
              <div className="mt-1 flex w-[280px] flex-col items-center gap-3 rounded-lg bg-white p-3 shadow-2xl">
                {photos.map((p, i) => (
                  <div key={i} className="w-full">
                    <div
                      className={`h-[180px] w-full overflow-hidden rounded-sm bg-gradient-to-br ${
                        p.hue ?? "from-neutral-200 to-neutral-300"
                      }`}
                    >
                      {p.url && (
                        <img
                          src={p.url}
                          alt={p.caption}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="pt-2 pb-1 text-center font-script text-lg text-neutral-700">
                      {p.caption}
                    </div>
                    {i < photos.length - 1 && (
                      <div className="mt-1 border-b border-dashed border-neutral-300" />
                    )}
                  </div>
                ))}
                <div className="pt-2 pb-1 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                  ♥ End of roll ♥
                </div>
              </div>

              {/* Hint */}
              <motion.div
                style={{ opacity: hintOp }}
                className="pointer-events-none absolute left-1/2 top-full mt-4 -translate-x-1/2 text-center text-xs text-primary"
              >
                <div className="animate-bounce">↓ Kéo xuống ↓</div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {shot && (
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-petal"
          >
            <Download className="h-4 w-4" /> Lưu kỷ niệm
          </a>
        )}
      </section>

      {/* Flash overlay */}
      {flash && (
        <div className="pointer-events-none fixed inset-0 z-50 animate-fade-in bg-white" />
      )}
    </div>
  );
}
