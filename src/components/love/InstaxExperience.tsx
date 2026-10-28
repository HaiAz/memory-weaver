import { Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useAnimate, useMotionValue } from "framer-motion";
import { Camera, Heart, ImagePlus, Link2, PencilLine, RotateCcw, X } from "lucide-react";
import { RollEditor } from "@/components/love/RollEditor";
import { ShareDialog } from "@/components/love/ShareDialog";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";
import { heartsBurst } from "@/components/love/confettiHelpers";
import type { Note, Roll } from "@/lib/rollStore";

/** `date` là chuỗi hiển thị; `iso` (yyyy-mm-dd) giữ lại để mở sửa ảnh người dùng. */
type Shot = { img?: string; hue: string; caption: string; date: string; iso?: string };

const DEFAULT_SHOTS: Shot[] = [
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
  {
    hue: "from-[#ffe0b3] via-[#f3a97a] to-[#c4705c]",
    caption: "Lần đầu nắm tay",
    date: "06 · 05 · 2025",
  },
  { hue: "from-[#f8c8d8] via-[#c9a0dc] to-[#9b72cf]", caption: "Ngày mưa", date: "18 · 08 · 2025" },
];

const MAX_SHOTS = 9;

const DEFAULT_NOTE: Note = {
  message: "Cảm ơn em vì đã đứng lại trong từng khung hình của anh.",
  signature: "Của em ♡",
};
/** Kích thước dải phim (px) — dùng để đẩy dải xuống đúng 1 tấm mỗi lần chụp. */
const STRIP_W = 200;
const FRAME_H = 244;
const LEADER_H = 36;
const TAIL_H = 64;
const EJECT_S = 1.5;
const EJECT_EASE = [0.3, 0.75, 0.35, 1] as const;
const PULL_THRESHOLD = 70;

/** Dây đèn: mỗi hàng 3 ảnh, độ cao dây tại 3 cột (khớp path trong viewBox 1000×80). */
const ROPE_Y = [43, 30, 10];

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

/** shooting → ready (hết phim, đuôi phim lộ ra) → pulling (đang kéo tuột) → hung (đã treo lên dây). */
type Stage = "shooting" | "ready" | "pulling" | "hung";

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmtIso = (iso: string) => (iso ? iso.split("-").reverse().join(" · ") : "");

const rollToShots = (roll: Roll): Shot[] =>
  roll.shots.map((s, i) => ({
    img: s.img,
    hue: DEFAULT_SHOTS[i % DEFAULT_SHOTS.length].hue,
    caption: s.caption.trim() || `Khoảnh khắc ${i + 1}`,
    date: fmtIso(s.date),
    iso: s.date,
  }));

const cleanNote = (note: Note): Note => ({
  message: note.message.trim().replace(/^["“”]+|["“”]+$/g, "") || DEFAULT_NOTE.message,
  signature: note.signature.trim(),
});

/**
 * Máy Instax → dải phim → dây đèn treo ảnh.
 * - `edit`: người tạo — được thay ảnh, sửa chú thích/lời nhắn, chụp lại, tạo link gửi.
 * - `view`: người nhận mở link — chỉ bấm chụp, kéo phim và xem.
 */
export function InstaxExperience(props: { mode: "edit" } | { mode: "view"; roll: Roll }) {
  const editable = props.mode === "edit";
  const [shots, setShots] = useState<Shot[]>(() =>
    props.mode === "view" ? rollToShots(props.roll) : DEFAULT_SHOTS,
  );
  const [note, setNote] = useState<Note>(() =>
    props.mode === "view" ? cleanNote(props.roll.note) : DEFAULT_NOTE,
  );
  const [taken, setTaken] = useState(0);
  const [ejecting, setEjecting] = useState(false);
  const [stage, setStage] = useState<Stage>("shooting");
  const [flash, setFlash] = useState(false);
  const [lightbox, setLightbox] = useState<Shot | null>(null);
  const [sharing, setSharing] = useState(false);

  const [cameraRef, animateCamera] = useAnimate<HTMLDivElement>();
  const wallRef = useRef<HTMLElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fromRects = useRef<(DOMRect | null)[]>([]);
  const timers = useRef<number[]>([]);
  const y = useMotionValue(0);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const tailOut = stage === "ready" || stage === "pulling";
  const stripH =
    stage === "hung" || taken === 0 ? 0 : LEADER_H + taken * FRAME_H + (tailOut ? TAIL_H : 0);

  // Mỗi khi dải phim dài thêm (thêm ảnh / lộ đuôi), dịch ngược lên đúng phần mới
  // (giấu sau thân máy) rồi trượt xuống — cảm giác ảnh "chui" ra khỏi khe.
  const prevStripH = useRef(0);
  useLayoutEffect(() => {
    const diff = stripH - prevStripH.current;
    prevStripH.current = stripH;
    if (diff <= 0) return;
    y.set(y.get() - diff);
    animate(y, 0, { duration: EJECT_S, ease: EJECT_EASE });
  }, [stripH, y]);

  const canShoot = stage === "shooting" && !ejecting && taken < shots.length;

  const shoot = () => {
    if (!canShoot) return;
    const isLast = taken + 1 === shots.length;
    setEjecting(true);
    setFlash(true);
    animateCamera(
      cameraRef.current,
      { y: [0, 4, -2, 1, 0], rotate: [0, -0.8, 0.5, -0.2, 0] },
      { duration: 0.4 },
    );
    later(() => setFlash(false), 180);
    later(() => setTaken((t) => t + 1), 260);
    later(
      () => {
        setEjecting(false);
        if (isLast) setStage("ready");
      },
      260 + EJECT_S * 1000,
    );
  };

  // Kéo tuột dải phim: trượt mạnh xuống, chụp lại vị trí từng tấm rồi chuyển sang dây treo.
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const release = () => {
    if (stageRef.current !== "ready") return;
    stageRef.current = "pulling";
    setStage("pulling");
    animate(y, Math.max(y.get(), 0) + 220, { duration: 0.55, ease: [0.55, 0, 0.75, 0.2] }).then(
      () => {
        if (stageRef.current !== "pulling") return; // đã bấm "Chụp lại" giữa chừng
        fromRects.current = frameRefs.current.map((el) => el?.getBoundingClientRect() ?? null);
        setStage("hung");
      },
    );
  };

  // Kéo bằng chuột ở bất kỳ đâu trên dải; trên cảm ứng chỉ ở phần đuôi để không chặn cuộn trang.
  const pull = useRef<{ id: number; startY: number; moved: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== "ready") return;
    if (e.pointerType !== "mouse" && !(e.target as HTMLElement).closest("[data-grip]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pull.current = { id: e.pointerId, startY: e.clientY, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pull.current;
    if (!p || p.id !== e.pointerId) return;
    const dy = e.clientY - p.startY;
    p.moved = Math.max(p.moved, Math.abs(dy));
    y.set(Math.max(0, dy) * 0.85);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pull.current;
    pull.current = null;
    if (!p || p.id !== e.pointerId) return;
    // Kéo đủ xa, hoặc chỉ "ấn" một cái, đều tính là kéo tuột phim.
    if (e.clientY - p.startY > PULL_THRESHOLD || p.moved < 6) release();
    else animate(y, 0, { type: "spring", stiffness: 300, damping: 22 });
  };
  const onPointerCancel = () => {
    pull.current = null;
    animate(y, 0, { type: "spring", stiffness: 300, damping: 22 });
  };

  useEffect(() => {
    if (stage !== "hung") return;
    y.set(0);
    const scroll = window.setTimeout(() => {
      const el = wallRef.current;
      if (!el) return;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - (editable ? 72 : 16),
        behavior: "smooth",
      });
    }, 150);
    const burst = window.setTimeout(heartsBurst, 900 + shots.length * 160);
    return () => {
      window.clearTimeout(scroll);
      window.clearTimeout(burst);
    };
  }, [stage, shots.length, y, editable]);

  const reset = (scrollTop = true) => {
    clearTimers();
    stageRef.current = "shooting";
    y.stop();
    y.set(0);
    fromRects.current = [];
    setTaken(0);
    setEjecting(false);
    setFlash(false);
    setStage("shooting");
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ảnh của người dùng: chọn file → soạn tên + ngày trong RollEditor → lắp vào máy.
  const createdUrls = useRef<string[]>([]);
  const pickRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Roll | null>(null);
  const hasCustom = shots.some((s) => s.img);
  // Cuộn phim hiện tại ở dạng lưu/chia sẻ được (chỉ khi đã dùng ảnh riêng).
  const roll = useMemo<Roll | null>(
    () =>
      hasCustom
        ? {
            shots: shots.map((s) => ({ img: s.img ?? "", caption: s.caption, date: s.iso ?? "" })),
            note,
          }
        : null,
    [hasCustom, shots, note],
  );

  const toDrafts = (files: File[]) =>
    files.map((f) => {
      const img = URL.createObjectURL(f);
      createdUrls.current.push(img);
      return { img, caption: "", date: isoDate(f.lastModified) };
    });
  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length) setEditing({ shots: toDrafts(files.slice(0, MAX_SHOTS)), note });
  };
  const addDraftFiles = (files: File[]) => {
    const current = editing?.shots ?? [];
    setEditing({
      note: editing?.note ?? note,
      shots: [...current, ...toDrafts(files.slice(0, MAX_SHOTS - current.length))],
    });
  };
  const openEditor = () => {
    if (!roll) return pickRef.current?.click();
    setEditing(roll);
  };
  const confirmRoll = () => {
    if (!editing?.shots.length) return;
    setShots(rollToShots(editing));
    setNote(cleanNote(editing.note));
    setEditing(null);
    reset(false);
  };
  const resetToSamples = () => {
    setShots(DEFAULT_SHOTS);
    setNote(DEFAULT_NOTE);
    setEditing(null);
    reset(false);
  };
  useEffect(() => {
    const urls = createdUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const hint =
    stage === "hung"
      ? "Kỷ niệm đã treo lên dây rồi ♡"
      : stage !== "shooting"
        ? "Hết phim rồi — kéo dải ảnh xuống để treo lên nhé"
        : taken === 0
          ? "Bấm nút chụp trên máy để bắt đầu ♡"
          : `Tấm tiếp theo: ${shots[taken]?.caption ?? ""}`;

  const order = Array.from({ length: taken }, (_, k) => taken - 1 - k); // mới nhất ở sát khe
  const rows = Array.from({ length: Math.ceil(shots.length / 3) }, (_, r) =>
    shots.slice(r * 3, r * 3 + 3).map((_, c) => r * 3 + c),
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-[#f5efe4] to-[#e8d5c0]">
      <style>{`
        @keyframes polaroidSway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2.2deg); }
          75% { transform: rotate(-2.2deg); }
        }
        @keyframes bulbGlow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
      <PetalsFall count={8} />
      {editable && <SiteHeader />}

      <section className="relative z-20 mx-auto max-w-3xl px-4 pt-10 pb-6 text-center">
        {editable ? (
          <>
            <p className="font-script text-3xl text-[#c45c7c]">Chụp lấy liền</p>
            <h1 className="mt-2 font-display text-4xl text-[#3a2418] sm:text-5xl">
              Bấm chụp — kỷ niệm trượt ra từng tấm
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#6b5544]">
              Mỗi lần bấm, một tấm ảnh chui ra khỏi máy và hiện dần. Hết phim thì kéo cả dải xuống
              để treo lên dây đèn.
            </p>
          </>
        ) : (
          <>
            <p className="font-script text-3xl text-[#c45c7c]">Gửi bạn ♡</p>
            <h1 className="mt-2 font-display text-4xl text-[#3a2418] sm:text-5xl">
              Có một cuộn phim dành cho bạn
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#6b5544]">
              Bấm nút chụp trên máy — từng khoảnh khắc sẽ chui ra. Hết phim thì kéo cả dải xuống
              nhé.
            </p>
          </>
        )}

        {editable && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {roll && (
              <button
                onClick={() => setSharing(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#3a2418] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(58,36,24,0.3)] transition-transform hover:scale-105"
              >
                <Link2 className="h-4 w-4" /> Tạo link gửi
              </button>
            )}
            <button
              onClick={openEditor}
              className="inline-flex items-center gap-2 rounded-full bg-[#c45c7c] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(196,92,124,0.35)] transition-transform hover:scale-105"
            >
              {hasCustom ? (
                <>
                  <PencilLine className="h-4 w-4" /> Sửa ảnh & chú thích
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" /> Dùng ảnh của hai đứa
                </>
              )}
            </button>
            <input
              ref={pickRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickFiles}
            />
            {(taken > 0 || stage !== "shooting") && (
              <button
                onClick={() => reset()}
                className="inline-flex items-center gap-2 rounded-full border border-[#c45c7c]/30 bg-white/60 px-4 py-2 text-sm text-[#c45c7c] transition-colors hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" /> Chụp lại từ đầu
              </button>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.p
            key={hint}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-5 font-script text-2xl text-[#c45c7c]"
          >
            {hint}
          </motion.p>
        </AnimatePresence>
      </section>

      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>

      <section className="relative z-20 mx-auto flex max-w-md flex-col items-center px-4">
        {/* Camera body */}
        <div
          ref={cameraRef}
          className="relative z-30 w-full max-w-[340px] rounded-[28px] bg-gradient-to-b from-[#f8b8c8] to-[#e88aa8] p-5 pb-7 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)]"
        >
          <div className="rounded-2xl bg-white/40 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div
                className={`h-3 w-3 rounded-full bg-red-500 shadow-inner ${ejecting ? "animate-pulse" : ""}`}
              />
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
                {shots.length - taken} kiểu còn lại
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

          {/* Khe nhả ảnh — sát mép dưới thân máy */}
          <div className="absolute bottom-0 left-1/2 h-2.5 w-[216px] -translate-x-1/2 rounded-t-md bg-black/45 shadow-inner" />
        </div>

        {/* Dải phim chui ra từ khe */}
        <motion.div
          className="relative z-20 w-full"
          animate={{ height: stripH + (stripH ? 40 : 0) }}
          initial={false}
          transition={{ duration: stripH ? EJECT_S : 0, ease: EJECT_EASE }}
        >
          {stage !== "hung" && taken > 0 && (
            <motion.div
              style={{ y, width: STRIP_W, marginLeft: -STRIP_W / 2 }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              className={`absolute left-1/2 top-0 select-none drop-shadow-[0_14px_18px_rgba(90,60,40,0.28)] ${
                stage === "ready" ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              {tailOut && (
                <button
                  data-grip
                  onClick={(e) => e.detail === 0 && release()}
                  aria-label="Kéo dải ảnh xuống để treo lên dây"
                  className="flex w-full touch-none flex-col items-center justify-center gap-1 border-b border-dashed border-[#d9c9b8] bg-white"
                  style={{ height: TAIL_H }}
                >
                  <span className="h-1 w-10 rounded-full bg-[#c45c7c]/40" />
                  <span className="animate-bounce font-script text-lg text-[#c45c7c]">
                    Kéo xuống ↓
                  </span>
                </button>
              )}
              {order.map((i) => (
                <StripFrame
                  key={i}
                  shot={shots[i]}
                  frameRef={(el) => {
                    frameRefs.current[i] = el;
                  }}
                />
              ))}
              <div
                className="flex items-center justify-center rounded-b-xl bg-white text-[9px] uppercase tracking-[0.3em] text-[#c45c7c]/60"
                style={{ height: LEADER_H }}
              >
                ♥ love · instant ♥
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Dây đèn treo ảnh */}
      {stage === "hung" && (
        <section ref={wallRef} className="relative z-20 mx-auto max-w-4xl px-4 pt-6 pb-12">
          {/* Nền tường chấm bi kiểu polaroid, mờ dần ở hai đầu */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(#d9c9a8 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "linear-gradient(transparent, black 120px, black calc(100% - 80px), transparent)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="font-script text-3xl text-[#c45c7c]">Kỷ niệm của mình</p>
            <h2 className="mt-1 font-display text-4xl text-[#3a2418] sm:text-5xl">
              Những mảnh ghép đẹp nhất
            </h2>
            <p className="mt-2 text-sm text-[#6b5544]">Chạm vào ảnh để xem to ♡</p>
          </motion.div>

          {rows.map((row, r) => (
            <div key={r} className="relative mt-8 sm:mt-12">
              <LightString flipped={r % 2 === 1} delay={r * 0.2} />
              <div className="relative grid grid-cols-3">
                {row.map((i, c) => (
                  <HangingCard
                    key={i}
                    index={i}
                    shot={shots[i]}
                    from={fromRects.current[i] ?? null}
                    delay={0.35 + i * 0.16}
                    ropeY={ROPE_Y[r % 2 === 1 ? 2 - c : c]}
                    onOpen={() => setLightbox(shots[i])}
                  />
                ))}
              </div>
            </div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + shots.length * 0.16, duration: 0.8 }}
            className="relative mx-auto mt-16 max-w-md -rotate-2 rounded bg-[#fffbf0] p-8 text-center shadow-xl"
          >
            <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 bg-[#f8c8d8]/70 shadow-sm" />
            <p className="whitespace-pre-line break-words font-script text-3xl leading-snug text-[#3a2418]">
              “{note.message}”
            </p>
            {note.signature && (
              <p className="mt-4 text-right text-sm text-[#8b6f5e]">— {note.signature}</p>
            )}
          </motion.div>
        </section>
      )}

      {editable ? (
        <div className="h-16" />
      ) : (
        <footer className="relative z-20 px-4 pt-6 pb-10 text-center text-xs text-[#8b6f5e]">
          <Link
            to="/t/instax"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-white/60 hover:text-[#c45c7c]"
          >
            <Heart className="h-3.5 w-3.5 fill-[#c45c7c] text-[#c45c7c]" />
            Tạo cuộn phim của riêng bạn với{" "}
            <span className="font-script text-base">Love Letters</span>
          </Link>
        </footer>
      )}

      {editable && (
        <>
          <RollEditor
            value={editing}
            max={MAX_SHOTS}
            placeholderNote={DEFAULT_NOTE}
            onChange={setEditing}
            onAddFiles={addDraftFiles}
            onCancel={() => setEditing(null)}
            onConfirm={confirmRoll}
            onUseSamples={hasCustom ? resetToSamples : undefined}
          />
          <ShareDialog open={sharing} roll={roll} onClose={() => setSharing(false)} />
        </>
      )}

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
              <ShotImage shot={lightbox} />
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

function ShotImage({ shot }: { shot: Shot }) {
  return shot.img ? (
    <img src={shot.img} alt="" draggable={false} className="aspect-square w-full object-cover" />
  ) : (
    <div className={`aspect-square w-full bg-gradient-to-br ${shot.hue}`} />
  );
}

/** Một khung trên dải phim — ảnh "tráng" dần từ tối sepia sang rõ nét sau khi chui ra. */
function StripFrame({
  shot,
  frameRef,
}: {
  shot: Shot;
  frameRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={frameRef}
      className="border-b border-dashed border-[#d9c9b8] bg-white px-3 pt-3"
      style={{ height: FRAME_H }}
    >
      <motion.div
        initial={{ filter: "sepia(0.7) brightness(0.12) contrast(0.6)" }}
        animate={{ filter: "sepia(0) brightness(1) contrast(1)" }}
        transition={{ duration: 3, delay: 0.9, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <ShotImage shot={shot} />
      </motion.div>
      <div className="truncate pt-2 text-center font-script text-lg leading-tight text-[#3a2418]">
        {shot.caption}
      </div>
      <div className="pt-0.5 text-center text-[10px] uppercase tracking-widest text-[#8b6f5e]">
        {shot.date}
      </div>
    </div>
  );
}

function LightString({ flipped, delay }: { flipped: boolean; delay: number }) {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 w-full"
      style={flipped ? { transform: "scaleX(-1)" } : undefined}
      preserveAspectRatio="none"
      viewBox="0 0 1000 80"
    >
      <motion.path
        d="M0 20 Q 250 70, 500 30 T 1000 25"
        stroke="#7a5f4e"
        strokeWidth="2.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay, ease: "easeInOut" }}
      />
      {bulbs.map((b, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 + (flipped ? 1 - b.x / 1000 : b.x / 1000) * 0.8 }}
        >
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
        </motion.g>
      ))}
    </svg>
  );
}

/**
 * Ảnh treo bằng kẹp gỗ. Khi vừa mount, bay từ đúng vị trí của nó trên dải phim
 * (FLIP thủ công) tới chỗ kẹp rồi đung đưa.
 */
function HangingCard({
  index,
  shot,
  from,
  delay,
  ropeY,
  onOpen,
}: {
  index: number;
  shot: Shot;
  from: DOMRect | null;
  delay: number;
  ropeY: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.opacity = "";
    const to = el.getBoundingClientRect();

    if (!from) {
      el.style.opacity = "0";
      const c = animate(
        el,
        { opacity: [0, 1], y: [-30, 0] },
        { delay, type: "spring", stiffness: 120, damping: 14 },
      );
      return () => c.stop();
    }

    const s = from.width / to.width;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    el.style.transform = `translateX(${dx}px) translateY(${dy}px) scale(${s})`;
    const swing = index % 2 ? 9 : -9;
    const c = animate(
      el,
      { x: [dx, 0], y: [dy, 0], scale: [s, 1], rotate: [0, swing, 0] },
      { delay, duration: 1.15, ease: [0.22, 1, 0.36, 1] },
    );
    return () => c.stop();
    // Chỉ chạy một lần khi ảnh được treo lên.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex justify-center px-1.5 sm:px-3" style={{ paddingTop: ropeY + 4 }}>
      <button
        ref={ref}
        onClick={onOpen}
        className="relative w-full max-w-[172px] cursor-zoom-in text-left"
        aria-label={`Xem ảnh: ${shot.caption}`}
      >
        <div
          style={{
            transformOrigin: "top center",
            animation: `polaroidSway ${5 + (index % 3) * 0.7}s ease-in-out ${delay + 1.1}s infinite`,
          }}
        >
          {/* Kẹp gỗ */}
          <div className="absolute -top-4 left-1/2 z-10 h-8 w-3 -translate-x-1/2 rounded-[3px] bg-gradient-to-b from-[#c69c6d] to-[#a87f52] shadow-sm">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#7a5f4e]/60" />
          </div>
          <div className="rounded-sm bg-white p-2 pb-1 shadow-[0_10px_24px_rgba(90,60,40,0.28)] sm:p-2.5 sm:pb-1">
            <ShotImage shot={shot} />
            <div className="truncate pt-2 text-center font-script text-sm text-[#3a2418] sm:text-lg">
              {shot.caption}
            </div>
            <div className="pb-1 text-center text-[8px] uppercase tracking-widest text-[#8b6f5e] sm:text-[9px]">
              {shot.date}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
