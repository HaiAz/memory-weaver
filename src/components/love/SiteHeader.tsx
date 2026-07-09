import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, ChevronDown } from "lucide-react";
import { useState } from "react";

const mainNav = [
  { to: "/", label: "Trang chủ" },
  { to: "/#order", label: "Đặt hàng", href: true },
] as const;

const templates = [
  { to: "/t/classic", label: "Cổ điển" },
  { to: "/t/album", label: "Album" },
  { to: "/t/cinematic", label: "Điện ảnh" },
  { to: "/t/playful", label: "Vui tươi" },
  { to: "/t/galaxy", label: "Galaxy" },
  { to: "/t/polaroid", label: "Polaroid" },
  { to: "/t/chat", label: "Tin nhắn" },
  { to: "/t/fireworks", label: "Pháo hoa" },
  { to: "/t/balloon", label: "Bóng bay" },
  { to: "/t/vinyl", label: "Vinyl" },
  { to: "/t/scratch", label: "Cào thẻ" },
  { to: "/t/notebook", label: "Sổ tay" },
  { to: "/t/instax", label: "Instax" },
  { to: "/t/pullstrip", label: "Kéo phim" },
  { to: "/t/orbit", label: "Orbit" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const isTemplate = pathname.startsWith("/t/");

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-primary text-primary" />
          <span className="font-script text-2xl text-primary">Love Letters</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-secondary hover:text-foreground"
            }`}
          >
            Trang chủ
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm transition-colors ${
                isTemplate
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              Template <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {open && (
              <div className="absolute right-0 top-full min-w-[200px] pt-2">
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border/60 bg-card p-2 shadow-petal">
                  {templates.map((t) => (
                    <Link
                      key={t.to}
                      to={t.to}
                      onClick={() => setOpen(false)}
                      className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                        pathname === t.to
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-secondary"
                      }`}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a
            href="/#order"
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Đặt hàng
          </a>
        </nav>
      </div>
    </header>
  );
}
