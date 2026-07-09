import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/love/SiteHeader";

export const Route = createFileRoute("/t/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Tin nhắn tỏ tình" },
      { name: "description", content: "Cuộc trò chuyện iMessage hiện dần, kiểu viral TikTok." },
    ],
  }),
  component: ChatTemplate,
});

type Msg = { from: "me" | "you"; text: string; delay?: number };
const script: Msg[] = [
  { from: "you", text: "Alo, anh còn thức không?" },
  { from: "me", text: "Còn nè, sao thế em?" },
  { from: "you", text: "Không có gì...", delay: 800 },
  { from: "you", text: "Chỉ là tự nhiên nhớ anh 🥺" },
  { from: "me", text: "Ơ..." },
  { from: "me", text: "Em có biết là anh đợi câu đó cả năm nay không?" },
  { from: "you", text: "Ehe 🙈" },
  { from: "me", text: "Này em..." },
  { from: "me", text: "Làm người yêu anh nhé?" },
  { from: "you", text: "Uhm ❤️" },
];

function Bubble({ m }: { m: Msg }) {
  const me = m.from === "me";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`flex ${me ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug shadow-sm ${
          me
            ? "rounded-br-md bg-gradient-to-br from-[#4a9eff] to-[#0a7cff] text-white"
            : "rounded-bl-md bg-[#e9e9eb] text-black"
        }`}
      >
        {m.text}
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-[#e9e9eb] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-[#8e8e93]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatTemplate() {
  const [shown, setShown] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < script.length; i++) {
        const m = script[i];
        await new Promise((r) => setTimeout(r, m.delay ?? 700));
        if (cancelled) return;
        setTyping(true);
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
        if (cancelled) return;
        setTyping(false);
        setShown((s) => [...s, m]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#fdf3f7] to-[#f8c8d8]">
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-md px-4 py-10">
        <div className="overflow-hidden rounded-[2.5rem] border-[10px] border-black bg-white shadow-2xl">
          {/* Phone header */}
          <div className="flex items-center justify-between border-b bg-[#f5f5f7] px-4 py-3 text-xs">
            <span className="text-[#0a7cff]">‹ Messages</span>
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#e88aab] to-[#c45c7c]" />
              <span className="mt-0.5 text-[11px] font-medium">Người ấy 💌</span>
            </div>
            <span className="w-14 text-right">FaceTime</span>
          </div>

          {/* Chat body */}
          <div className="h-[520px] space-y-2.5 overflow-y-auto bg-white px-4 py-4">
            <AnimatePresence>
              {shown.map((m, i) => (
                <Bubble key={i} m={m} />
              ))}
              {typing && <Typing key="typing" />}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t bg-[#f5f5f7] px-3 py-2">
            <div className="flex-1 rounded-full border bg-white px-4 py-2 text-sm text-[#8e8e93]">
              iMessage
            </div>
          </div>
        </div>

        <p className="mt-6 text-center font-script text-2xl text-[#c45c7c]">
          Câu chuyện của mình — bắt đầu từ một tin nhắn ✿
        </p>
      </section>
    </div>
  );
}
