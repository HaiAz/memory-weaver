import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";

export const Route = createFileRoute("/t/notebook")({
  head: () => ({
    meta: [
      { title: "Notebook — Sổ tay tình yêu" },
      { name: "description", content: "Sổ tay lật từng trang với lời nhắn viết tay." },
    ],
  }),
  component: NotebookTemplate,
});

const pages = [
  {
    title: "01 · Lần đầu",
    body: "Anh còn nhớ ngày đầu tiên gặp em — trời hơi lạnh, em quấn khăn kín cổ và cười rất tươi. Từ khoảnh khắc đó, anh đã biết mình gặp đúng người rồi.",
  },
  {
    title: "02 · Những ngày yêu",
    body: "Yêu em không phải chuyện gì to tát cả. Là tin nhắn 'ăn cơm chưa', là bàn tay đưa ra chờ em nắm, là ngồi im cạnh nhau mà chẳng thấy nhàm.",
  },
  {
    title: "03 · Điều anh học được",
    body: "Anh học được rằng — yêu ai đó không phải để họ trở thành phiên bản anh muốn, mà là để họ được là chính họ, và anh vẫn thấy hạnh phúc.",
  },
  {
    title: "04 · Lời hứa",
    body: "Anh không hứa những điều lớn lao. Chỉ hứa sẽ ở đây, giữ tay em thật chặt, đi qua từng mùa hoa, từng cơn mưa, từng năm tháng phía trước.",
  },
  {
    title: "05 · Cuối cùng",
    body: "Cảm ơn em vì đã là em. Và vì đã chọn anh mỗi ngày. Yêu em ♡",
  },
];

function NotebookTemplate() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = (d: 1 | -1) => {
    const next = idx + d;
    if (next < 0 || next >= pages.length) return;
    setDir(d);
    setIdx(next);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f5efe4] to-[#e8d5b8]">
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-3xl px-4 py-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8b6f5e]/30 bg-white/60 px-4 py-1.5 text-xs text-[#6b5544] backdrop-blur">
          <BookOpen className="h-3.5 w-3.5" /> Trang {idx + 1} / {pages.length}
        </div>
        <h1 className="mt-4 font-display text-4xl text-[#3a2418] sm:text-5xl">
          Sổ tay của anh, viết cho em
        </h1>
      </section>

      <section className="relative z-20 mx-auto max-w-3xl px-4 pb-16">
        <div
          className="relative mx-auto h-[520px] w-full max-w-xl overflow-hidden rounded-r-3xl rounded-l-md bg-[#fffbf0] shadow-[0_30px_80px_-20px_rgba(60,30,10,0.35)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(180, 140, 100, 0.15) 32px)",
          }}
        >
          {/* Spine */}
          <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#c9a084] to-transparent" />
          {/* Red margin line */}
          <div className="absolute inset-y-0 left-16 w-[1px] bg-red-300/50" />

          <motion.div
            key={idx}
            initial={{ rotateY: dir === 1 ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ transformOrigin: dir === 1 ? "left center" : "right center" }}
            className="relative h-full w-full px-20 py-16"
          >
            <div className="font-script text-3xl text-[#c45c7c]">{pages[idx].title}</div>
            <p className="mt-6 font-display text-lg leading-[2] text-[#3a2418] sm:text-xl">
              {pages[idx].body}
            </p>
            <div className="absolute bottom-8 right-8 font-script text-xl text-[#8b6f5e]">
              — trang {idx + 1}
            </div>
          </motion.div>
        </div>

        <div className="mx-auto mt-6 flex max-w-xl items-center justify-between">
          <button
            onClick={() => go(-1)}
            disabled={idx === 0}
            className="inline-flex items-center gap-1 rounded-full bg-[#3a2418] px-5 py-2.5 text-sm text-white shadow-lg transition-opacity disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Trang trước
          </button>
          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDir(i > idx ? 1 : -1);
                  setIdx(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-8 bg-[#c45c7c]" : "w-2 bg-[#8b6f5e]/40"
                }`}
                aria-label={`Trang ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            disabled={idx === pages.length - 1}
            className="inline-flex items-center gap-1 rounded-full bg-[#3a2418] px-5 py-2.5 text-sm text-white shadow-lg transition-opacity disabled:opacity-30"
          >
            Trang sau <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
