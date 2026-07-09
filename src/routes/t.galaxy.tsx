import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ImagePlus, MousePointer2, Sparkles, X, ZoomIn } from "lucide-react";
import { SiteHeader } from "@/components/love/SiteHeader";
import { fireConfetti } from "@/components/love/confettiHelpers";

export const Route = createFileRoute("/t/galaxy")({
  head: () => ({
    meta: [
      { title: "Galaxy — Em là vũ trụ của anh" },
      {
        name: "description",
        content:
          "Vũ trụ 3D với ảnh người yêu bao quanh — kéo xoay, cuộn zoom, chạm nổ siêu tân tinh.",
      },
    ],
  }),
  component: GalaxyTemplate,
});

/** Số vị trí ảnh phân bố quanh mặt cầu. */
const SLOT_COUNT = 40;
const SPHERE_RADIUS = 520;
const DUST_COUNT = 130;

/** Gradient pastel làm ảnh mẫu khi chưa upload. */
const PLACEHOLDER_HUES = [
  "linear-gradient(135deg,#f7c8d8,#c45c7c)",
  "linear-gradient(135deg,#c9a0dc,#7a5cc4)",
  "linear-gradient(135deg,#a8d8e8,#5c8ac4)",
  "linear-gradient(135deg,#ffd9a0,#e88a5c)",
  "linear-gradient(135deg,#b8e8c8,#4aa47a)",
];

const DUST_COLORS = ["#fff", "#ffe3f0", "#e88aab", "#c9a0dc", "#a8d8e8"];

type Slot = {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  size: number;
};

/** Phân bố đều điểm trên mặt cầu bằng dãy Fibonacci. */
function fibonacciSphere(count: number, radius: number): Slot[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const yUnit = 1 - (i / (count - 1)) * 2; // 1 .. -1
    const r = Math.sqrt(1 - yUnit * yUnit);
    const theta = golden * i;
    const x = Math.cos(theta) * r * radius;
    const y = yUnit * radius;
    const z = Math.sin(theta) * r * radius;
    // Xoay ảnh cho mặt hướng ra ngoài theo pháp tuyến của mặt cầu,
    // để khi xoay vũ trụ ảnh vẫn ốp gọn quanh quả cầu.
    const rotY = Math.atan2(x, z) * (180 / Math.PI);
    const rotX = -Math.asin(yUnit) * (180 / Math.PI);
    const size = 96 + ((i * 37) % 56); // 96..152, biến thiên nhẹ
    return { x, y, z, rotX, rotY, size };
  });
}

type Dust = { x: number; y: number; z: number; size: number; color: string; blur: boolean };

/** Bụi sao 3D rải ngẫu nhiên trong lớp vỏ cầu bao ngoài ảnh. */
function makeDust(count: number): Dust[] {
  return Array.from({ length: count }, () => {
    const r = 640 + Math.random() * 420;
    const phi = Math.random() * Math.PI * 2;
    const cosT = Math.random() * 2 - 1;
    const sinT = Math.sqrt(1 - cosT * cosT);
    return {
      x: r * sinT * Math.cos(phi),
      y: r * cosT,
      z: r * sinT * Math.sin(phi),
      size: 1.5 + Math.random() * 3,
      color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
      blur: Math.random() < 0.3,
    };
  });
}

/** Hạt sáng nằm trên vành đai orbit. */
function ringBeads(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return { x: Math.cos(a) * radius, z: Math.sin(a) * radius, size: 3 + ((i * 13) % 5) };
  });
}

/** Đưa góc target về vòng ±180° so với góc hiện tại để camera quay đường ngắn nhất. */
function nearestAngle(current: number, target: number) {
  let t = target;
  while (t - current > 180) t -= 360;
  while (t - current < -180) t += 360;
  return t;
}

// Nhịp tour tự động: bay đến ảnh (lùi ra) → zoom cận → giữ → ảnh kế tiếp.
const TOUR_START_MS = 6500; // tiêu đề ẩn + tour bắt đầu sau khi vào trang
const TOUR_RESUME_MS = 8000; // nghỉ tương tác bao lâu thì tour chạy lại
const TOUR_DIVE_MS = 900; // thời điểm zoom cận sau khi bắt đầu bay tới ảnh
const TOUR_NEXT_MS = 3800; // tổng thời gian dừng ở mỗi ảnh
const TOUR_STRIDE = 7; // bước nhảy nguyên tố cùng nhau với SLOT_COUNT → đi hết ảnh không lặp

const FLOATING_HEARTS = Array.from({ length: 9 }, (_, i) => ({
  left: `${8 + ((i * 89) % 86)}%`,
  size: 10 + ((i * 31) % 16),
  duration: 14 + ((i * 47) % 12),
  delay: (i * 23) % 14,
  opacity: 0.25 + ((i * 17) % 30) / 100,
}));

function GalaxyTemplate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [introDone, setIntroDone] = useState(false);

  // Trạng thái camera: góc xoay + zoom, lerp về target cho chuyển động có quán tính.
  const rot = useRef({ x: -8, y: 0 });
  const rotTarget = useRef({ x: -8, y: 0 });
  const zoom = useRef(-1700); // bắt đầu từ rất xa để camera bay vào (intro)
  const zoomTarget = useRef(-320);
  const warp = useRef(0); // 0..1 — cường độ hiệu ứng warp khi zoom nhanh
  const worldRef = useRef<HTMLDivElement>(null);
  const nebulaARef = useRef<HTMLDivElement>(null);
  const nebulaBRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const moved = useRef(0);
  const last = useRef({ x: 0, y: 0 });
  const autoRef = useRef(true);
  const [hint, setHint] = useState(true);
  const [showTitle, setShowTitle] = useState(true);

  // Tour tự động: camera lần lượt bay đến và zoom cận từng ảnh.
  const tourActive = useRef(false);
  const tourStep = useRef(0);
  const tourTimers = useRef<number[]>([]);
  const resumeTimer = useRef<number | undefined>(undefined);

  const slots = useMemo(() => fibonacciSphere(SLOT_COUNT, SPHERE_RADIUS), []);
  const dust = useMemo(() => makeDust(DUST_COUNT), []);
  const beadsInner = useMemo(() => ringBeads(14, 340), []);
  const beadsOuter = useMemo(() => ringBeads(20, 660), []);

  // Kích hoạt intro "Big Bang" ngay sau khi mount.
  useEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  // ---- Tour tự động (hàm giữ trong ref để tự gọi đệ quy + gọi từ handler ổn định) ----
  const clearTourTimers = useCallback(() => {
    tourTimers.current.forEach(clearTimeout);
    tourTimers.current = [];
  }, []);

  const tourNextRef = useRef(() => {});
  tourNextRef.current = () => {
    const slot = slots[(tourStep.current * TOUR_STRIDE) % SLOT_COUNT];
    tourStep.current += 1;
    autoRef.current = false;
    // Quay thế giới để ảnh này ra chính diện: rotY = -azimuth, rotX = elevation (đảo dấu slot.rotX).
    rotTarget.current.y = nearestAngle(rotTarget.current.y, -slot.rotY);
    rotTarget.current.x = Math.max(-78, Math.min(78, -slot.rotX));
    zoomTarget.current = -300; // lùi ra lấy đà bay
    warp.current = Math.min(1, warp.current + 0.35);
    tourTimers.current.push(
      window.setTimeout(() => {
        zoomTarget.current = 150; // zoom cận ảnh
      }, TOUR_DIVE_MS),
    );
    tourTimers.current.push(window.setTimeout(() => tourNextRef.current(), TOUR_NEXT_MS));
  };

  const startTour = useCallback(() => {
    if (tourActive.current) return;
    tourActive.current = true;
    setShowTitle(false);
    setHint(false);
    tourNextRef.current();
  }, []);

  /** Người dùng tương tác: dừng tour, hẹn chạy lại sau khoảng nghỉ. */
  const interruptTour = useCallback(() => {
    if (tourActive.current) {
      tourActive.current = false;
      clearTourTimers();
    }
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(startTour, TOUR_RESUME_MS);
  }, [clearTourTimers, startTour]);

  // Hẹn giờ tour đầu tiên; dọn toàn bộ timer khi rời trang.
  useEffect(() => {
    resumeTimer.current = window.setTimeout(startTour, TOUR_START_MS);
    return () => {
      clearTourTimers();
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, [startTour, clearTourTimers]);

  // ---- Nền: sao lấp lánh + sao băng + warp streaks (canvas 2D) ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Star = { x: number; y: number; r: number; a: number; da: number };
    type Shoot = { x: number; y: number; vx: number; vy: number; life: number };
    const stars: Star[] = Array.from({ length: 220 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.02,
    }));
    const shoots: Shoot[] = [];

    let raf = 0;
    const loop = () => {
      ctx.fillStyle = "rgba(7, 5, 26, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = warp.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (const s of stars) {
        s.a += s.da;
        if (s.a > 1 || s.a < 0.1) s.da *= -1;
        if (w > 0.03) {
          // Warp: sao kéo thành vệt hướng ra ngoài tâm như đang vượt tốc độ ánh sáng.
          const dx = s.x - cx;
          const dy = s.y - cy;
          ctx.strokeStyle = `rgba(255, 240, 250, ${Math.min(1, s.a + w * 0.4)})`;
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + dx * w * 0.22, s.y + dy * w * 0.22);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 240, 250, ${s.a})`;
          ctx.fill();
        }
      }
      warp.current *= 0.94; // tự tắt dần

      if (Math.random() < 0.015) {
        shoots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: 6 + Math.random() * 4,
          vy: 3 + Math.random() * 2,
          life: 1,
        });
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const sh = shoots[i];
        ctx.strokeStyle = `rgba(232, 138, 171, ${sh.life})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 8, sh.y - sh.vy * 8);
        ctx.stroke();
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.015;
        if (sh.life <= 0) shoots.splice(i, 1);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ---- Vòng lặp camera: auto-rotate + lerp mượt về target ----
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (autoRef.current && !dragging.current && !tourActive.current) {
        rotTarget.current.y += 0.12;
      }
      rot.current.x += (rotTarget.current.x - rot.current.x) * 0.08;
      rot.current.y += (rotTarget.current.y - rot.current.y) * 0.08;
      zoom.current += (zoomTarget.current - zoom.current) * 0.06;
      const w = worldRef.current;
      if (w) {
        w.style.transform = `translateZ(${zoom.current}px) rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- Tương tác: kéo xoay, cuộn zoom, click ảnh, double-click supernova ----
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      interruptTour();
      dragging.current = true;
      autoRef.current = false;
      moved.current = 0;
      last.current = { x: e.clientX, y: e.clientY };
      setHint(false);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [interruptTour],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // Nebula parallax theo con trỏ (luôn chạy, kể cả khi không kéo).
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    if (nebulaARef.current)
      nebulaARef.current.style.transform = `translate(${nx * -36}px, ${ny * -24}px)`;
    if (nebulaBRef.current)
      nebulaBRef.current.style.transform = `translate(${nx * 28}px, ${ny * 20}px)`;

    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    last.current = { x: e.clientX, y: e.clientY };
    rotTarget.current.y += dx * 0.32;
    rotTarget.current.x = Math.max(-80, Math.min(80, rotTarget.current.x - dy * 0.32));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const wasDragging = dragging.current;
    dragging.current = false;
    // Click "sạch" (gần như không kéo) trúng ảnh → mở lightbox.
    if (wasDragging && moved.current < 8) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const photo = el?.closest<HTMLElement>("[data-photo]");
      if (photo?.dataset.photo) setLightbox(photo.dataset.photo);
    }
    // Cho auto-rotate chạy lại sau khi thả một lúc.
    window.setTimeout(() => {
      if (!dragging.current) autoRef.current = true;
    }, 2500);
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      interruptTour();
      zoomTarget.current = Math.max(-1100, Math.min(240, zoomTarget.current - e.deltaY * 0.6));
      warp.current = Math.min(1, warp.current + Math.abs(e.deltaY) * 0.0022);
      setHint(false);
    },
    [interruptTour],
  );

  const onDoubleClick = useCallback(() => {
    // Siêu tân tinh: nổ pháo tim + giật nhẹ camera.
    interruptTour();
    fireConfetti();
    warp.current = 1;
    zoomTarget.current = Math.min(240, zoomTarget.current + 130);
    window.setTimeout(() => {
      zoomTarget.current = Math.max(-1100, zoomTarget.current - 130);
    }, 450);
  }, [interruptTour]);

  // ---- Upload ảnh ----
  const createdUrls = useRef<string[]>([]);
  const onFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    createdUrls.current.push(...urls);
    setImages((prev) => [...prev, ...urls].slice(0, SLOT_COUNT));
    e.target.value = ""; // cho phép chọn lại cùng file
  }, []);

  // Thu hồi mọi object URL đã tạo khi rời trang.
  useEffect(() => {
    const urls = createdUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07051a] text-white">
      {/* Keyframes riêng cho template galaxy */}
      <style>{`
        @keyframes galaxyOrbitA { from { transform: rotateX(74deg) rotateZ(0deg); } to { transform: rotateX(74deg) rotateZ(360deg); } }
        @keyframes galaxyOrbitB { from { transform: rotateX(-64deg) rotateY(18deg) rotateZ(360deg); } to { transform: rotateX(-64deg) rotateY(18deg) rotateZ(0deg); } }
        @keyframes galaxyCorePulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.18); opacity: 1; }
        }
        @keyframes galaxyTwinkle { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes galaxyFloatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: var(--h-op, 0.4); }
          90% { opacity: var(--h-op, 0.4); }
          100% { transform: translateY(-110vh) rotate(35deg); opacity: 0; }
        }
      `}</style>

      <canvas ref={canvasRef} className="fixed inset-0 z-0" aria-hidden />
      <div
        ref={nebulaARef}
        className="pointer-events-none fixed -top-40 left-1/2 z-0 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,138,171,0.35),transparent_70%)] transition-transform duration-700 ease-out"
      />
      <div
        ref={nebulaBRef}
        className="pointer-events-none fixed bottom-0 right-0 z-0 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(140,90,220,0.32),transparent_70%)] transition-transform duration-700 ease-out"
      />

      {/* Lõi trái tim phát sáng ở tâm màn hình */}
      <div className="pointer-events-none fixed inset-0 z-[5] flex items-center justify-center">
        <div className="relative">
          <div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,138,171,0.5),rgba(140,90,220,0.18)_55%,transparent_75%)]"
            style={{ animation: "galaxyCorePulse 3.2s ease-in-out infinite" }}
          />
          <Heart
            className="relative h-12 w-12 fill-[#ffb3cd] text-[#ffb3cd] drop-shadow-[0_0_24px_rgba(232,138,171,0.9)]"
            style={{ animation: "galaxyCorePulse 3.2s ease-in-out infinite" }}
          />
        </div>
      </div>

      {/* Trái tim nhỏ lãng đãng bay lên */}
      <div className="pointer-events-none fixed inset-0 z-[6] overflow-hidden" aria-hidden>
        {FLOATING_HEARTS.map((h, i) => (
          <Heart
            key={i}
            className="absolute bottom-[-4vh] fill-[#e88aab] text-[#e88aab]"
            style={{
              left: h.left,
              width: h.size,
              height: h.size,
              // Biến CSS điều khiển opacity đỉnh của keyframe galaxyFloatUp.
              ["--h-op" as string]: h.opacity,
              animation: `galaxyFloatUp ${h.duration}s linear ${h.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-40">
        <SiteHeader />
      </div>

      {/* Sân khấu 3D: chiếm toàn màn hình, nhận kéo/cuộn */}
      <div
        className="fixed inset-0 z-10 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
      >
        <div
          ref={worldRef}
          className="absolute left-1/2 top-1/2"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {/* Vành đai orbit nghiêng + hạt sáng quay quanh (kiểu Saturn) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{ transformStyle: "preserve-3d", animation: "galaxyOrbitA 26s linear infinite" }}
          >
            <div className="absolute -ml-[340px] -mt-[340px] h-[680px] w-[680px] rounded-full border border-[#e88aab]/25" />
            {beadsInner.map((b, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-[#ffd9e8]"
                style={{
                  width: b.size,
                  height: b.size,
                  marginLeft: -b.size / 2,
                  marginTop: -b.size / 2,
                  transform: `translate3d(${b.x}px, 0px, ${b.z}px)`,
                  boxShadow: "0 0 10px 2px rgba(232,138,171,0.8)",
                  animation: `galaxyTwinkle ${2 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <div
            className="absolute left-1/2 top-1/2"
            style={{ transformStyle: "preserve-3d", animation: "galaxyOrbitB 44s linear infinite" }}
          >
            <div className="absolute -ml-[660px] -mt-[660px] h-[1320px] w-[1320px] rounded-full border border-[#c9a0dc]/20" />
            {beadsOuter.map((b, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-[#e6d4ff]"
                style={{
                  width: b.size,
                  height: b.size,
                  marginLeft: -b.size / 2,
                  marginTop: -b.size / 2,
                  transform: `translate3d(${b.x}px, 0px, ${b.z}px)`,
                  boxShadow: "0 0 12px 2px rgba(140,90,220,0.7)",
                  animation: `galaxyTwinkle ${2.4 + (i % 4)}s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Bụi sao 3D tạo chiều sâu */}
          {dust.map((d, i) => (
            <div
              key={`d${i}`}
              className="absolute rounded-full"
              style={{
                width: d.size,
                height: d.size,
                marginLeft: -d.size / 2,
                marginTop: -d.size / 2,
                background: d.color,
                filter: d.blur ? "blur(1px)" : undefined,
                boxShadow: `0 0 ${d.size * 3}px ${d.size}px ${d.color}33`,
                transform: `translate3d(${d.x}px, ${d.y}px, ${d.z}px)`,
                animation: `galaxyTwinkle ${2 + (i % 5) * 0.8}s ease-in-out ${(i % 10) * 0.3}s infinite`,
              }}
            />
          ))}

          {/* Quả cầu ảnh kỷ niệm */}
          {slots.map((slot, i) => {
            const img = images.length ? images[i % images.length] : undefined;
            const hasImg = !!img;
            return (
              <div
                key={i}
                data-photo={img}
                className="absolute overflow-hidden rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(232,138,171,0.35)]"
                style={{
                  width: slot.size,
                  height: slot.size,
                  marginLeft: -slot.size / 2,
                  marginTop: -slot.size / 2,
                  // Big Bang: nổ từ tâm ra vị trí trên mặt cầu, ảnh orient ra ngoài theo pháp tuyến.
                  transform: introDone
                    ? `translate3d(${slot.x}px, ${slot.y}px, ${slot.z}px) rotateY(${slot.rotY}deg) rotateX(${slot.rotX}deg)`
                    : "translate3d(0px, 0px, 0px) scale(0.01)",
                  transition: `transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 32}ms, opacity 1s ease ${i * 32}ms`,
                  background: hasImg ? undefined : PLACEHOLDER_HUES[i % PLACEHOLDER_HUES.length],
                  opacity: introDone ? (hasImg ? 1 : 0.78) : 0,
                  backfaceVisibility: "hidden",
                }}
              >
                {img ? (
                  <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Heart className="h-6 w-6 fill-white/70 text-white/70" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Vignette điện ảnh */}
      <div className="pointer-events-none fixed inset-0 z-[15] bg-[radial-gradient(circle_at_center,transparent_55%,rgba(7,5,26,0.75))]" />

      {/* Tiêu đề nổi — tự ẩn khi tour tự động bắt đầu, không chặn tương tác */}
      <section className="pointer-events-none relative z-20 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 pt-10 text-center">
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.9, delay: 0 } }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="rounded-3xl bg-[#07051a]/30 px-6 py-4 backdrop-blur-[2px]"
            >
              <p className="font-script text-3xl text-[#e88aab]">Gửi vì sao của anh</p>
              <h1 className="mt-3 font-display text-5xl leading-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] sm:text-7xl">
                Em là <span className="italic text-[#c9a0dc]">cả thiên hà</span>
                <br /> của anh
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-white/75">
                Mỗi khoảnh khắc bên em là một ngôi sao. Thả ảnh của chúng mình vào, rồi kéo để xoay
                và cuộn để du hành khắp vũ trụ này.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Thanh điều khiển: upload + hướng dẫn */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex flex-col items-center gap-3 px-4">
        {hint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full bg-white/10 px-4 py-2 text-xs text-white/80 backdrop-blur"
          >
            <span className="flex items-center gap-1.5">
              <MousePointer2 className="h-3.5 w-3.5" /> Kéo xoay · Cuộn zoom
            </span>
            <span className="flex items-center gap-1.5">
              <ZoomIn className="h-3.5 w-3.5" /> Click ảnh: phóng to
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Double-click: siêu tân tinh
            </span>
          </motion.div>
        )}
        <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#e88aab] px-6 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(232,138,171,0.6)] transition-transform hover:scale-105">
          <ImagePlus className="h-4 w-4" />
          {images.length
            ? `Đã thêm ${images.length} ảnh — thêm nữa`
            : "Thả ảnh của hai đứa vào đây"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </div>

      {/* Lightbox phóng to ảnh */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#07051a]/80 p-6 backdrop-blur-md"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.6, rotate: 4 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="relative max-h-[82vh] max-w-[90vw] overflow-hidden rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(232,138,171,0.5)]"
            >
              <img
                src={lightbox}
                alt=""
                className="max-h-[82vh] max-w-[90vw] object-contain"
                draggable={false}
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white/90 backdrop-blur transition-colors hover:bg-black/70"
                aria-label="Đóng"
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
