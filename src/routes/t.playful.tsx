import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";
import { HeartCursor } from "@/components/love/HeartCursor";
import { LoveClock } from "@/components/love/LoveClock";
import { heartsBurst, fireConfetti } from "@/components/love/confettiHelpers";

export const Route = createFileRoute("/t/playful")({
  head: () => ({
    meta: [
      { title: "Vui tươi — Love Letters" },
      { name: "description", content: "Trái tim theo con trỏ, hoa rơi và nút bung pháo giấy." },
    ],
  }),
  component: PlayfulTemplate,
});

const reasons = [
  "Vì em cười — cả ngày anh cũng cười theo.",
  "Vì em nấu ăn không ngon lắm, nhưng anh vẫn ăn hết.",
  "Vì em bật nhạc to lúc dọn nhà.",
  "Vì em ngủ lúc nào cũng ôm gối như ôm anh.",
  "Vì em đọc tin nhắn xong 3 tiếng mới trả lời — mà anh vẫn chờ.",
  "Vì em là em.",
];

function PlayfulTemplate() {
  return (
    <div className="relative min-h-screen bg-gradient-sunset">
      <PetalsFall count={22} />
      <HeartCursor />
      <SiteHeader />

      <section className="relative z-30 mx-auto max-w-3xl px-4 pt-20 pb-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-petal"
        >
          <Heart className="h-10 w-10 animate-heart-pulse fill-primary text-primary" />
        </motion.div>
        <h1 className="mt-6 font-script text-6xl text-primary sm:text-7xl">Này em ơi</h1>
        <p className="mt-4 text-lg text-foreground/80">
          Di chuột đi — sẽ có trái tim bay theo đó. Cuộn xuống nữa nhé.
        </p>
      </section>

      <section className="relative z-30 mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center font-display text-3xl">Chúng ta đã bên nhau</h2>
        <div className="mt-6">
          <LoveClock since="2023-05-20T00:00:00" />
        </div>
      </section>

      <section className="relative z-30 mx-auto max-w-3xl px-4 py-16">
        <div className="mb-8 flex items-center justify-center gap-2 text-center">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-3xl">Vì sao anh yêu em</h2>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {reasons.map((r, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/60 bg-white/60 p-5 text-foreground/90 shadow-soft backdrop-blur transition-transform hover:-translate-y-1"
            >
              <span className="mr-2 font-script text-2xl text-primary">
                {String(i + 1).padStart(2, "0")}.
              </span>
              {r}
            </motion.li>
          ))}
        </ul>
      </section>

      <section className="relative z-30 mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="font-script text-5xl text-primary sm:text-6xl">Mãi bên nhau nhé?</h2>
        <p className="mt-4 text-foreground/70">Nhấn nút — anh có một điều bất ngờ.</p>
        <button
          onClick={() => {
            heartsBurst();
            setTimeout(fireConfetti, 200);
            setTimeout(fireConfetti, 600);
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-lg font-medium text-primary-foreground shadow-petal transition-transform hover:scale-110 active:scale-95"
        >
          Mãi bên nhau ❤️
        </button>
      </section>
    </div>
  );
}
