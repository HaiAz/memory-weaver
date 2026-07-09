import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";

export const Route = createFileRoute("/t/vinyl")({
  head: () => ({
    meta: [
      { title: "Vinyl — Bản nhạc dành riêng cho em" },
      {
        name: "description",
        content: "Đĩa than xoay, lời bài hát tình yêu hiện dần theo giai điệu.",
      },
    ],
  }),
  component: VinylTemplate,
});

const lyrics = [
  "Có phải em là bản nhạc,",
  "mà anh muốn nghe cả đời?",
  "Từng nhịp tim, từng hơi thở,",
  "đều mang tên em, không đổi thay.",
  "Anh yêu em — như yêu bài hát đầu tiên,",
  "cứ nghe hoài mà chẳng thấy cũ.",
];

function VinylTemplate() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.volume = 0.35;
      a.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#2a1520] via-[#3d1f2e] to-[#1a0f18] text-white">
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc7f4d7.mp3?filename=romantic-piano-116233.mp3"
        loop
        preload="none"
      />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[400px_1fr] lg:items-center">
          {/* Vinyl */}
          <div className="relative mx-auto">
            <motion.div
              animate={playing ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                repeat: playing ? Infinity : 0,
                duration: 6,
                ease: "linear",
              }}
              className="relative h-80 w-80 rounded-full bg-gradient-to-br from-[#0a0a0a] to-[#2a2a2a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
            >
              {/* Grooves */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-white/5"
                  style={{ inset: `${(i + 1) * 18}px` }}
                />
              ))}
              {/* Label */}
              <div className="absolute inset-[120px] flex items-center justify-center rounded-full bg-gradient-to-br from-[#e88aab] to-[#c45c7c] shadow-inner">
                <Music className="h-8 w-8 text-white" />
              </div>
              {/* Center hole */}
              <div className="absolute inset-[150px] rounded-full bg-[#0a0a0a]" />
            </motion.div>

            {/* Tone arm */}
            <motion.div
              animate={{ rotate: playing ? 25 : 0 }}
              transition={{ duration: 0.8 }}
              style={{ transformOrigin: "top right" }}
              className="absolute -right-6 top-4 h-2 w-40 origin-right rounded-full bg-gradient-to-r from-[#8a6a5a] to-[#c9a084]"
            />

            <button
              onClick={toggle}
              className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-[#e88aab] px-6 py-3 font-medium text-white shadow-petal transition-transform hover:scale-105"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Tạm dừng" : "Phát nhạc"}
            </button>
          </div>

          {/* Lyrics */}
          <div>
            <p className="font-script text-3xl text-[#e88aab]">Track 01</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">Bài hát tên em</h1>
            <div className="mt-8 space-y-4">
              {lyrics.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="font-display text-xl leading-relaxed text-white/85 sm:text-2xl"
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto max-w-xl px-4 pb-24 text-center">
        <p className="font-script text-4xl text-[#e88aab]">
          Bật lên nhé — anh viết bài này cho em ♫
        </p>
      </section>
    </div>
  );
}
