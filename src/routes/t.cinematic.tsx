import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Heart } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";
import { fireConfetti } from "@/components/love/confettiHelpers";

export const Route = createFileRoute("/t/cinematic")({
  head: () => ({
    meta: [
      { title: "Câu chuyện điện ảnh — Love Letters" },
      {
        name: "description",
        content: "Loading với tên người nhận, nhạc nền, pháo giấy cuối trang.",
      },
    ],
  }),
  component: CinematicTemplate,
});

const scenes = [
  {
    heading: "Buổi sáng ấy",
    body: "Nắng tràn qua cửa sổ, và anh nhận ra — điều đẹp nhất của ngày là được thức dậy cùng em.",
  },
  {
    heading: "Buổi chiều nào đó",
    body: "Chúng ta đi bộ chậm rãi, chẳng nói gì nhiều. Nhưng im lặng cạnh em cũng đủ ấm.",
  },
  {
    heading: "Đêm hôm ấy",
    body: "Ánh đèn thành phố phản chiếu trong mắt em. Anh biết mình sẽ nhớ khoảnh khắc này rất lâu.",
  },
];

function CinematicTemplate() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const n = p + 2 + Math.random() * 4;
        if (n >= 100) {
          clearInterval(t);
          setTimeout(() => setLoading(false), 400);
          return 100;
        }
        return n;
      });
    }, 80);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            fireConfetti();
            setTimeout(fireConfetti, 400);
            setTimeout(fireConfetti, 800);
          }
        }
      },
      { threshold: 0.5 },
    );
    if (endRef.current) io.observe(endRef.current);
    return () => io.disconnect();
  }, [loading]);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    if (muted) {
      a.volume = 0.4;
      a.play().catch(() => {});
      setMuted(false);
    } else {
      a.pause();
      setMuted(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[oklch(0.15_0.03_355)] text-[oklch(0.98_0.01_20)]">
      {/* Ambient background music (silent by default). Replace src with your own track. */}
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc7f4d7.mp3?filename=romantic-piano-116233.mp3"
        loop
        preload="none"
      />

      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[oklch(0.12_0.04_355)]"
          >
            <Heart className="h-14 w-14 animate-heart-pulse fill-[oklch(0.78_0.14_355)] text-[oklch(0.78_0.14_355)]" />
            <div className="mt-6 font-script text-4xl text-[oklch(0.9_0.06_350)]">
              Đang chuẩn bị cho em…
            </div>
            <div className="mt-8 h-1 w-64 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-[oklch(0.78_0.14_355)]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
            <div className="mt-3 text-xs uppercase tracking-widest text-white/60">
              {Math.round(progress)}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <>
          <div className="relative z-30">
            <SiteHeader />
          </div>
          <PetalsFall count={10} />

          <button
            onClick={toggleMute}
            className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.78_0.14_355)] text-white shadow-petal transition-transform hover:scale-110"
            aria-label={muted ? "Bật nhạc" : "Tắt nhạc"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <section className="relative z-20 mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="font-script text-3xl text-[oklch(0.85_0.1_350)]">
                Một câu chuyện, gửi em
              </p>
              <h1 className="mt-4 font-display text-6xl leading-tight sm:text-8xl">
                Chỉ có <span className="italic text-[oklch(0.8_0.13_355)]">chúng ta</span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-white/70">
                Cuộn xuống để đi qua vài khoảnh khắc anh không muốn quên.
              </p>
            </motion.div>
          </section>

          {scenes.map((s, i) => (
            <section key={i} className="relative z-20 mx-auto max-w-3xl px-4 py-24">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-sm uppercase tracking-[0.3em] text-[oklch(0.8_0.13_355)]">
                  Cảnh {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-3 font-display text-4xl sm:text-5xl">{s.heading}</h2>
                <p className="mt-6 text-lg leading-relaxed text-white/80">{s.body}</p>
              </motion.div>
            </section>
          ))}

          <section
            ref={endRef}
            className="relative z-20 mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Heart className="mx-auto h-12 w-12 animate-heart-pulse fill-[oklch(0.78_0.14_355)] text-[oklch(0.78_0.14_355)]" />
              <h2 className="mt-6 font-script text-5xl text-[oklch(0.9_0.06_350)] sm:text-6xl">
                Mãi bên nhau nhé
              </h2>
              <p className="mt-4 text-white/70">Cảm ơn em vì đã là em. Và vì đã ở đây, với anh.</p>
              <button
                onClick={() => {
                  fireConfetti();
                  setTimeout(fireConfetti, 300);
                }}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[oklch(0.78_0.14_355)] px-8 py-4 font-medium text-white shadow-petal transition-transform hover:scale-105"
              >
                Mãi bên nhau ❤️
              </button>
            </motion.div>
          </section>
        </>
      )}
    </div>
  );
}
