import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, MousePointer2 } from "lucide-react";
import { TemplateArt } from "@/components/love/TemplateArt";

export type TemplateCardData = {
  to: string;
  name: string;
  tag: string;
  desc: string;
};

// Horizontal scrolling only makes sense with a wheel/trackpad on a wide screen;
// below this width the cards fall back to the original vertical grid.
const DESKTOP_QUERY = "(min-width: 768px)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function TemplateCard({ t, compact = false }: { t: TemplateCardData; compact?: boolean }) {
  return (
    <Link
      to={t.to}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-brand/25 bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-brand/45 hover:shadow-petal"
    >
      <div
        className={`${compact ? "h-32" : "h-44"} relative shrink-0 overflow-hidden border-b border-brand/15`}
      >
        <TemplateArt
          slug={t.to.split("/").pop() ?? ""}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className={`flex flex-1 flex-col bg-white ${compact ? "p-5" : "p-6"}`}>
        <div className="text-[11px] uppercase tracking-widest text-brand/70">{t.tag}</div>
        <h3 className={`mt-1 font-display text-foreground ${compact ? "text-xl" : "text-2xl"}`}>
          {t.name}
        </h3>
        <p
          className={`mt-2 text-sm leading-relaxed text-muted-foreground ${compact ? "line-clamp-2" : ""}`}
        >
          {t.desc}
        </p>
        <div
          className={`inline-flex items-center gap-1 text-sm font-medium text-brand ${compact ? "mt-auto pt-3" : "mt-4"}`}
        >
          Xem template
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function TemplateGrid({ templates }: { templates: TemplateCardData[] }) {
  return (
    <section id="templates" className="relative z-20 mx-auto max-w-6xl px-4 pb-24">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((t) => (
          <TemplateCard key={t.to} t={t} />
        ))}
      </div>
    </section>
  );
}

/**
 * Two-row strip of template cards. While the pointer is over the strip the
 * mouse wheel scrolls it sideways; anywhere else the page scrolls normally.
 * Once the strip reaches either end, further wheel input is handed back to the
 * page so the user never gets stuck.
 */
function HorizontalTemplates({ templates }: { templates: TemplateCardData[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const maxScroll = () => {
    const el = scrollerRef.current;
    return el ? Math.max(0, el.scrollWidth - el.clientWidth) : 0;
  };

  // Ease scrollLeft towards targetRef for a smooth glide on each wheel notch.
  const animateTo = useCallback(
    (target: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      targetRef.current = Math.min(maxScroll(), Math.max(0, target));
      if (reduceMotion) {
        el.scrollLeft = targetRef.current;
        return;
      }
      if (rafRef.current != null) return;
      const step = () => {
        const diff = targetRef.current - el.scrollLeft;
        if (Math.abs(diff) < 1) {
          el.scrollLeft = targetRef.current;
          rafRef.current = null;
          return;
        }
        const move = diff * 0.18;
        el.scrollLeft += Math.sign(move) * Math.max(1, Math.abs(move));
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [reduceMotion],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch / browser zoom
      // Trackpad sideways swipes already scroll the strip natively.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = maxScroll();
      if (max <= 0) return;
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? el.clientWidth : 1;
      const delta = e.deltaY * unit;
      if (rafRef.current == null) targetRef.current = el.scrollLeft;
      const atStart = targetRef.current <= 0;
      const atEnd = targetRef.current >= max - 1;
      // At the ends, let the page continue scrolling vertically.
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
      e.preventDefault();
      animateTo(targetRef.current + delta);
    };

    const onScroll = () => {
      const max = maxScroll();
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      setCanPrev(el.scrollLeft > 1);
      setCanNext(el.scrollLeft < max - 1);
    };

    onScroll();
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [animateTo]);

  const page = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (rafRef.current == null) targetRef.current = el.scrollLeft;
    animateTo(targetRef.current + dir * el.clientWidth * 0.8);
  };

  const pad = "max(1rem, calc((100vw - 72rem) / 2 + 1rem))";
  const fade =
    "linear-gradient(to right, transparent, #000 2rem, #000 calc(100% - 2rem), transparent)";
  const arrowBtn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 text-foreground backdrop-blur transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <section id="templates" className="relative z-20 pb-24">
      <div className="mb-6 flex items-end justify-between gap-6" style={{ paddingInline: pad }}>
        <div>
          <div className="text-xs uppercase tracking-widest text-brand/80">Bộ sưu tập</div>
          <h2 className="mt-2 font-display text-4xl text-foreground lg:text-5xl">
            Mỗi chuyện tình, một cách kể riêng
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MousePointer2 className="h-3.5 w-3.5" />
            Trỏ chuột vào và lăn để xem thêm
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1 w-32 overflow-hidden rounded-full bg-brand/15">
              <div
                className="h-full origin-left rounded-full bg-brand"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
            <button
              type="button"
              aria-label="Xem template trước"
              onClick={() => page(-1)}
              disabled={!canPrev}
              className={arrowBtn}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Xem template tiếp"
              onClick={() => page(1)}
              disabled={!canNext}
              className={arrowBtn}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      >
        <div
          className="grid w-max auto-cols-[280px] grid-flow-col grid-rows-2 gap-5 py-3 lg:auto-cols-[300px]"
          style={{ paddingInline: pad }}
        >
          {templates.map((t) => (
            <TemplateCard key={t.to} t={t} compact />
          ))}
          <a
            href="#order"
            className="group flex flex-col justify-center rounded-3xl border border-dashed border-brand/40 bg-card/60 p-6 backdrop-blur transition-colors hover:bg-card"
          >
            <div className="text-xs uppercase tracking-widest text-brand/80">Đã ưng chưa?</div>
            <div className="mt-2 font-display text-2xl text-foreground">Đặt trang của bạn ngay</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Chọn template, viết lời nhắn và nhận trang riêng chỉ trong vài phút.
            </p>
            <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-petal transition-transform group-hover:scale-105">
              Đặt hàng <ArrowRight className="h-4 w-4" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

export function TemplateShowcase({ templates }: { templates: TemplateCardData[] }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return <TemplateGrid templates={templates} />;
  return <HorizontalTemplates templates={templates} />;
}
