import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";

export const Route = createFileRoute("/t/classic")({
  head: () => ({
    meta: [
      { title: "Thư tỏ tình cổ điển — Love Letters" },
      {
        name: "description",
        content: "Phong bì niêm sáp mở ra như thật — lá thư gấp ba trượt ra và mở từng nếp.",
      },
    ],
  }),
  component: ClassicTemplate,
});

/**
 * Trình tự mở thư (mô phỏng ngoài đời):
 * 1. Sáp niêm phong vỡ  2. Nắp phong bì lật ngửa ra sau (3D)
 * 3. Lá thư (gấp ba) trượt ra khỏi túi  4. Thư bay ra giữa, phong bì hạ xuống
 * 5. Mở nếp gấp trên → nếp gấp dưới  6. Chữ hiện dần từng dòng
 * Đóng thư chạy ngược lại toàn bộ.
 *
 * Lưu ý bố cục: mỗi tấm giấy cao cố định 184px — câu chữ phải NGẮN,
 * mỗi dòng nguồn tối đa wrap thành 2 dòng hiển thị, tổng ≤ 5 dòng/tấm.
 */
type Phase = "closed" | "opening" | "reading" | "closing";

const topLines = ["Có những buổi chiều, anh chỉ ngồi yên và nhớ về em."];
const midLines = [
  "Cảm ơn em vì đã đến, đã ở lại, và chọn anh mỗi ngày.",
  "Anh chỉ hứa một điều — nắm tay em thật chặt,",
  "đi cùng em qua hết mọi mùa.",
];
const botLines = ["Chỉ cần em cười, thế giới của anh lại sáng.", "Yêu em, mãi mãi."];

/** Giấy thư kem ấm: vignette hồng nhẹ 2 góc + dòng kẻ rất mờ cách 28px (khớp leading-7). */
const paperStyle: React.CSSProperties = {
  backgroundColor: "#fffcf4",
  backgroundImage:
    "radial-gradient(ellipse at 15% 8%, rgba(196,92,124,0.05), transparent 55%)," +
    "radial-gradient(ellipse at 88% 94%, rgba(196,92,124,0.06), transparent 50%)," +
    "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(196,92,124,0.05) 28px)",
};

/** Pháo sáp li ti khi bẻ sáp niêm phong. */
function sealPop() {
  confetti({
    particleCount: 26,
    spread: 80,
    startVelocity: 16,
    gravity: 0.55,
    scalar: 0.75,
    ticks: 55,
    zIndex: 60,
    origin: { x: 0.5, y: 0.45 },
    colors: ["#9d2c4a", "#e88aab", "#f8c8d8", "#fff"],
  });
}

function ClassicTemplate() {
  const [phase, setPhase] = useState<Phase>("closed");
  // Nắp lật quá 90° thì chuyển ra sau phong bì; thư rút hẳn ra thì nổi lên trên cùng.
  const [flapBehind, setFlapBehind] = useState(false);
  const [letterFront, setLetterFront] = useState(false);
  // Chưa từng mở thư thì không được chạy keyframes "nhét thư vào" lúc mới vào trang
  // (initial={false} không chặn được animate dạng mảng keyframes).
  const [everOpened, setEverOpened] = useState(false);

  const timers = useRef<number[]>([]);
  const schedule = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const isOpen = phase === "opening" || phase === "reading";
  const reading = phase === "reading";

  const openLetter = useCallback(() => {
    if (phase !== "closed") return;
    setPhase("opening");
    setEverOpened(true);
    sealPop();
    schedule(750, () => setFlapBehind(true)); // nắp vượt 90°
    schedule(2050, () => setLetterFront(true)); // thư đã rút hẳn ra ngoài
    schedule(3900, () => setPhase("reading"));
  }, [phase, schedule]);

  const closeLetter = useCallback(() => {
    if (phase !== "reading") return;
    setPhase("closing");
    schedule(1550, () => setLetterFront(false)); // thư chui lại vào túi
    schedule(2500, () => setFlapBehind(false)); // nắp quay lại vượt 90°
    schedule(3400, () => setPhase("closed"));
  }, [phase, schedule]);

  // Phong bì (các lớp rời để xếp z-index quanh lá thư) hạ sâu và mờ hẳn,
  // nhường trọn sân khấu cho lá thư.
  const drop = {
    y: isOpen ? 330 : 0,
    scale: isOpen ? 0.9 : 1,
    opacity: isOpen ? 0.2 : 1,
    rotate: isOpen ? 3 : 0,
  };
  const dropTransition = {
    delay: isOpen ? 2.0 : 0.8,
    duration: isOpen ? 0.7 : 0.6,
    ease: "easeInOut" as const,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-blossom">
      <style>{`
        @keyframes envFloat {
          0%, 100% { transform: translateY(0) rotate(-0.6deg); }
          50% { transform: translateY(-9px) rotate(0.6deg); }
        }
      `}</style>
      <PetalsFall count={12} />
      <SiteHeader />

      <div className="relative z-20 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-16">
        <div className="scale-[0.82] sm:scale-100">
          {/* Bọc idle-float: cả phong bì lẫn thư bồng bềnh khi đang đóng */}
          <div
            className="relative h-[256px] w-[384px]"
            style={{
              perspective: 1400,
              animation: phase === "closed" ? "envFloat 5s ease-in-out infinite" : undefined,
            }}
          >
            {/* Bóng đổ dưới phong bì */}
            <motion.div
              initial={false}
              animate={{ opacity: isOpen ? 0.15 : 0.5, scaleX: isOpen ? 0.8 : 1, y: drop.y }}
              transition={dropTransition}
              className="absolute -bottom-10 left-1/2 h-6 w-72 -translate-x-1/2 rounded-[50%] bg-[#c45c7c]/40 blur-md"
            />

            {/* LỚP 1 — Lưng phong bì + ruột bên trong */}
            <motion.div
              initial={false}
              animate={drop}
              transition={dropTransition}
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-[oklch(0.94_0.05_355)] to-[oklch(0.82_0.11_355)] shadow-petal"
              style={{ zIndex: 0 }}
            >
              {/* Ruột phong bì tối hơn — lộ ra khi nắp mở */}
              <div className="absolute inset-x-1 top-1 h-32 rounded-t-md bg-[oklch(0.72_0.09_350)]" />
              <div className="absolute inset-x-1 top-1 h-32 rounded-t-md bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(157,44,74,0.08)_10px,rgba(157,44,74,0.08)_20px)]" />
            </motion.div>

            {/* LỚP 2 — Nắp phong bì (lật 3D 2 mặt, gốc xoay cạnh trên) */}
            <motion.div
              initial={false}
              animate={drop}
              transition={dropTransition}
              className="absolute inset-x-0 top-0 h-full"
              style={{ zIndex: flapBehind ? 1 : 40, transformStyle: "preserve-3d" }}
            >
              <motion.div
                initial={false}
                animate={{ rotateX: isOpen ? -178 : 0 }}
                transition={{
                  delay: isOpen ? 0.3 : 2.15,
                  duration: isOpen ? 0.85 : 0.7,
                  ease: "easeInOut",
                }}
                className="absolute inset-x-0 top-0 h-[132px]"
                style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
              >
                {/* Mặt ngoài nắp */}
                <div
                  className="absolute inset-0 bg-gradient-to-b from-[oklch(0.88_0.08_350)] to-[oklch(0.83_0.1_352)] shadow-[0_4px_10px_rgba(157,44,74,0.25)]"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 88%)",
                    backfaceVisibility: "hidden",
                  }}
                />
                {/* Mặt trong nắp — clip-path soi gương dọc để sau khi
                    rotateX(180) khớp đúng hình tam giác mặt ngoài */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[oklch(0.92_0.04_350)] to-[oklch(0.88_0.06_350)]"
                  style={{
                    clipPath: "polygon(0 100%, 100% 100%, 50% 12%)",
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* LỚP 3 — Lá thư gấp ba (giữa ruột và túi trước) */}
            <motion.div
              initial={false}
              animate={{
                // Chưa từng mở: thư nằm im trong phong bì (giá trị tĩnh, không keyframes).
                y: isOpen ? [0, -300, -46] : everOpened ? [-46, -300, 0] : 0,
                scale: isOpen ? 1.06 : 1,
              }}
              transition={{
                y: {
                  delay: isOpen ? 1.2 : 0.75,
                  duration: isOpen ? 1.5 : 1.3,
                  times: [0, 0.55, 1],
                  ease: "easeInOut",
                },
                scale: { delay: isOpen ? 2.0 : 0.75, duration: 0.6 },
              }}
              className="absolute bottom-[26px] h-[184px] w-[344px]"
              style={{
                left: "50%",
                marginLeft: -172,
                zIndex: letterFront ? 50 : 10,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Tấm GIỮA (thân thư) */}
              <div
                className="relative h-full w-full overflow-hidden px-6 py-4"
                style={{
                  ...paperStyle,
                  boxShadow:
                    "inset 0 8px 10px -10px rgba(120,60,80,0.15), inset 0 -8px 10px -10px rgba(120,60,80,0.12), 0 16px 32px -18px rgba(157,44,74,0.35)",
                }}
              >
                <Heart
                  className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 -rotate-6 fill-primary/5 text-primary/5"
                  aria-hidden
                />
                <div className="relative font-display text-[15px] leading-7 text-[#4a3b44]">
                  {midLines.map((line, i) => (
                    <motion.p
                      key={line}
                      initial={false}
                      animate={{ opacity: reading ? 1 : 0 }}
                      transition={{
                        delay: reading ? 0.15 + (topLines.length + i) * 0.35 : 0,
                        duration: 0.5,
                      }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              </div>

              {/* Tấm TRÊN — gấp úp xuống trước thân, mở lật lên (gốc cạnh dưới) */}
              <motion.div
                initial={false}
                animate={{ rotateX: isOpen ? 0 : -179 }}
                transition={{
                  delay: isOpen ? 2.75 : 0.25,
                  duration: 0.7,
                  ease: "easeInOut",
                }}
                className="absolute bottom-full left-0 h-full w-full"
                style={{
                  transformOrigin: "bottom center",
                  transformStyle: "preserve-3d",
                  zIndex: 30,
                }}
              >
                <div
                  className="absolute inset-0 overflow-hidden rounded-t-md px-6 py-4"
                  style={{
                    ...paperStyle,
                    backfaceVisibility: "hidden",
                    boxShadow: "inset 0 -10px 12px -12px rgba(120,60,80,0.18)",
                  }}
                >
                  <p className="font-script text-2xl leading-9 text-primary">
                    Gửi người thương của anh,
                  </p>
                  <div className="mb-2 mt-1 flex items-center gap-3" aria-hidden>
                    <span className="h-px flex-1 bg-primary/15" />
                    <Heart className="h-3 w-3 fill-primary/35 text-primary/35" />
                    <span className="h-px flex-1 bg-primary/15" />
                  </div>
                  <div className="font-display text-[15px] leading-7 text-[#4a3b44]">
                    {topLines.map((line, i) => (
                      <motion.p
                        key={line}
                        initial={false}
                        animate={{ opacity: reading ? 1 : 0 }}
                        transition={{ delay: reading ? 0.15 + i * 0.35 : 0, duration: 0.5 }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                </div>
                {/* Mặt sau tấm trên — mặt ngoài của thư khi còn gấp */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-b-md"
                  style={{
                    ...paperStyle,
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    boxShadow: "inset 0 0 28px rgba(157,44,74,0.06)",
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-1.5">
                    <Heart className="h-6 w-6 fill-primary/40 text-primary/40" />
                    <p className="font-script text-2xl text-primary/70">Gửi em ♡</p>
                  </div>
                </div>
              </motion.div>

              {/* Tấm DƯỚI — gấp ngửa lên trước thân, mở lật xuống (gốc cạnh trên) */}
              <motion.div
                initial={false}
                animate={{ rotateX: isOpen ? 0 : 179 }}
                transition={{
                  delay: isOpen ? 3.2 : 0,
                  duration: 0.7,
                  ease: "easeInOut",
                }}
                className="absolute top-full left-0 h-full w-full"
                style={{ transformOrigin: "top center", transformStyle: "preserve-3d", zIndex: 20 }}
              >
                <div
                  className="absolute inset-0 overflow-hidden rounded-b-md px-6 py-4"
                  style={{
                    ...paperStyle,
                    backfaceVisibility: "hidden",
                    boxShadow: "inset 0 10px 12px -12px rgba(120,60,80,0.18)",
                  }}
                >
                  <div className="font-display text-[15px] leading-7 text-[#4a3b44]">
                    {botLines.map((line, i) => (
                      <motion.p
                        key={line}
                        initial={false}
                        animate={{ opacity: reading ? 1 : 0 }}
                        transition={{
                          delay: reading
                            ? 0.15 + (topLines.length + midLines.length + i) * 0.35
                            : 0,
                          duration: 0.5,
                        }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                  <motion.p
                    initial={false}
                    animate={{ opacity: reading ? 1 : 0 }}
                    transition={{
                      delay: reading
                        ? 0.3 + (topLines.length + midLines.length + botLines.length) * 0.35
                        : 0,
                      duration: 0.6,
                    }}
                    className="mt-1 text-right font-script text-2xl text-primary"
                  >
                    — Của em ❤
                  </motion.p>
                </div>
                <div
                  className="absolute inset-0 overflow-hidden rounded-t-md"
                  style={{
                    ...paperStyle,
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* LỚP 4 — Túi trước phong bì (2 tam giác bên + 1 tam giác đáy) */}
            <motion.div
              initial={false}
              animate={drop}
              transition={dropTransition}
              className="absolute inset-0"
              style={{ zIndex: 30 }}
            >
              <div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[oklch(0.9_0.06_352)] to-[oklch(0.86_0.08_353)]"
                style={{ clipPath: "polygon(0 2%, 50% 55%, 0 100%)" }}
              />
              <div
                className="absolute inset-0 rounded-lg bg-gradient-to-l from-[oklch(0.9_0.06_352)] to-[oklch(0.86_0.08_353)]"
                style={{ clipPath: "polygon(100% 2%, 50% 55%, 100% 100%)" }}
              />
              <div
                className="absolute inset-0 rounded-lg bg-gradient-to-t from-[oklch(0.92_0.05_353)] to-[oklch(0.87_0.08_352)] shadow-[0_-3px_8px_rgba(157,44,74,0.12)]"
                style={{ clipPath: "polygon(0 100%, 50% 42%, 100% 100%)" }}
              />
            </motion.div>

            {/* LỚP 5 — Sáp niêm phong ở chóp nắp */}
            <motion.div
              initial={false}
              animate={{
                scale: isOpen ? 0 : 1,
                opacity: isOpen ? 0 : 1,
                rotate: isOpen ? 30 : 0,
                y: drop.y,
              }}
              transition={{
                scale: isOpen
                  ? { delay: 0.02, duration: 0.4, ease: "backIn" }
                  : { delay: 2.95, type: "spring", stiffness: 420, damping: 15 },
                opacity: { delay: isOpen ? 0.02 : 2.95, duration: 0.35 },
                rotate: { delay: isOpen ? 0.02 : 2.95, duration: 0.4 },
                y: dropTransition,
              }}
              className="absolute left-1/2 top-[96px] -ml-7 h-14 w-14"
              style={{ zIndex: 45 }}
            >
              <div
                className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#c04a68,#9d2c4a_55%,#7a1f38)] shadow-[0_3px_8px_rgba(122,31,56,0.5),inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-3px_5px_rgba(0,0,0,0.3)]"
                style={{ borderRadius: "47% 53% 50% 50% / 52% 48% 52% 48%" }}
              >
                <Heart className="h-6 w-6 fill-[#f3c1cf] text-[#f3c1cf] drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
              </div>
            </motion.div>

            {/* Nút vô hình phủ lên phong bì để mở thư */}
            {phase === "closed" && (
              <button
                onClick={openLetter}
                aria-label="Mở phong bì"
                className="absolute inset-0 cursor-pointer"
                style={{ zIndex: 55 }}
              />
            )}
          </div>
        </div>

        {/* Chú thích khi thư đang đóng */}
        <div className="mt-14 h-10 text-center">
          <AnimatePresence>
            {phase === "closed" && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-script text-2xl text-primary"
              >
                Nhấn để mở thư ✿
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nút đóng thư — cố định góc màn hình, không đè lên lá thư */}
      <AnimatePresence>
        {reading && (
          <motion.button
            key="close"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ delay: 1.0 }}
            onClick={closeLetter}
            className="fixed bottom-6 right-6 z-50 rounded-full border border-primary/40 bg-white/80 px-5 py-2.5 font-script text-xl text-primary shadow-petal backdrop-blur transition-transform hover:scale-105"
          >
            Gấp thư lại ✉
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
