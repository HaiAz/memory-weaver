import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  Mail,
  Camera,
  Film,
  Sparkles,
  ArrowRight,
  Stars,
  Image as ImageIcon,
  MessageCircle,
  PartyPopper,
  Music,
  Eraser,
  BookOpen,
  Film as FilmIcon,
  Wind,
  Orbit,
} from "lucide-react";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";
import { OrderSection } from "@/components/love/OrderSection";

export const Route = createFileRoute("/")({
  component: Landing,
});

const templates = [
  {
    to: "/t/classic",
    name: "Cổ điển",
    tag: "Thư tỏ tình",
    desc: "Phong bì mở ra, chữ hiện dần theo từng dòng — nhẹ nhàng như một lá thư viết tay.",
    icon: Mail,
    hue: "from-[oklch(0.96_0.02_20)] to-[oklch(0.9_0.06_350)]",
  },
  {
    to: "/t/album",
    name: "Album kỷ niệm",
    tag: "Ảnh + Timeline",
    desc: "Album ảnh chuyển cảnh mượt, timeline cột mốc yêu nhau và đồng hồ đếm thời gian.",
    icon: Camera,
    hue: "from-[oklch(0.94_0.04_350)] to-[oklch(0.88_0.08_355)]",
  },
  {
    to: "/t/cinematic",
    name: "Điện ảnh",
    tag: "Loading + Confetti",
    desc: "Màn hình loading, nhạc nền, và pháo giấy khi cuộn tới cuối trang.",
    icon: Film,
    hue: "from-[oklch(0.92_0.05_355)] to-[oklch(0.82_0.11_355)]",
  },
  {
    to: "/t/playful",
    name: "Vui tươi",
    tag: "Trái tim theo chuột",
    desc: "Trái tim bay theo con trỏ, cánh hoa rơi, nút 'Mãi bên nhau' bung pháo giấy.",
    icon: Sparkles,
    hue: "from-[oklch(0.95_0.04_20)] to-[oklch(0.86_0.09_350)]",
  },
  {
    to: "/t/galaxy",
    name: "Galaxy",
    tag: "Bầu trời sao",
    desc: "Hàng trăm ngôi sao lấp lánh, sao băng bay ngang — em là cả thiên hà.",
    icon: Stars,
    hue: "from-[#1a1440] to-[#4a2d70]",
  },
  {
    to: "/t/polaroid",
    name: "Polaroid",
    tag: "Vintage scrapbook",
    desc: "Ảnh polaroid dán tường với dây đèn, chú thích viết tay lãng mạn.",
    icon: ImageIcon,
    hue: "from-[#f5efe4] to-[#e8d0b8]",
  },
  {
    to: "/t/chat",
    name: "Tin nhắn",
    tag: "iMessage style",
    desc: "Cuộc trò chuyện tỏ tình hiện dần từng bong bóng — kiểu viral TikTok.",
    icon: MessageCircle,
    hue: "from-[#fdf3f7] to-[#f8c8d8]",
  },
  {
    to: "/t/fireworks",
    name: "Pháo hoa",
    tag: "Đêm rực rỡ",
    desc: "Bấm chuột nổ pháo hoa, thành phố đêm với vô số màu — cực lễ hội.",
    icon: PartyPopper,
    hue: "from-[#06041a] to-[#3a1a4a]",
  },
  {
    to: "/t/balloon",
    name: "Bóng bay",
    tag: "Click to pop",
    desc: "Bấm từng bóng bay để lộ ra từng chữ trong lời tỏ tình — vừa vui vừa hồi hộp.",
    icon: Wind,
    hue: "from-[#e0f2fe] to-[#f8c8d8]",
  },
  {
    to: "/t/vinyl",
    name: "Vinyl",
    tag: "Đĩa than xoay",
    desc: "Đĩa than xoay tròn cùng lời bài hát tình yêu — kèm nút phát nhạc.",
    icon: Music,
    hue: "from-[#2a1520] to-[#3d1f2e]",
  },
  {
    to: "/t/scratch",
    name: "Cào thẻ",
    tag: "Scratch to reveal",
    desc: "Cào lớp phủ như thẻ cào để lộ lời nhắn giấu bên dưới.",
    icon: Eraser,
    hue: "from-[#fff5f9] to-[#ffb3d1]",
  },
  {
    to: "/t/notebook",
    name: "Sổ tay",
    tag: "Lật từng trang",
    desc: "Sổ tay giấy kẻ với 5 trang viết tay — lật qua từng chương chuyện tình.",
    icon: BookOpen,
    hue: "from-[#f5efe4] to-[#e8d5b8]",
  },
  {
    to: "/t/orbit",
    name: "Orbit",
    tag: "Ảnh xoay quỹ đạo",
    desc: "Ảnh hai đứa xoay quanh trái tim theo vòng quỹ đạo trên nền hologram lấp lánh.",
    icon: Orbit,
    hue: "from-[#2a1a4a] to-[#5c3a7a]",
  },
  {
    to: "/t/instax",
    name: "Instax",
    tag: "Chụp lấy liền",
    desc: "Bấm chụp từng tấm trượt ra khỏi máy, kéo cả dải phim xuống rồi treo lên dây đèn.",
    icon: Camera,
    hue: "from-[#f8b8c8] to-[#c45c7c]",
  },
  {
    to: "/t/pullstrip",
    name: "Kéo phim",
    tag: "Drag-to-reveal",
    desc: "Bấm chụp, nắm mép phim và kéo dài xuống — cả dải kỷ niệm của hai đứa lộ dần.",
    icon: FilmIcon,
    hue: "from-[#2a1a24] to-[#c45c7c]",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen bg-gradient-blossom">
      <PetalsFall count={18} />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:pt-24">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
          Bộ sưu tập template dành cho người yêu
        </div>
        <h1 className="font-display text-5xl leading-tight text-foreground sm:text-7xl">
          Gửi người ấy <br />
          <span className="font-script text-primary sm:text-8xl">một trang web tình yêu</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Bốn phong cách khác nhau, cùng một trái tim. Chọn template ưng ý, tuỳ biến lời nhắn, và
          tặng như một câu chuyện tương tác.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#order"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-petal transition-transform hover:scale-105"
          >
            Đặt trang của bạn <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#templates"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-card"
          >
            Xem 4 template
          </a>
        </div>
      </section>

      <section id="templates" className="relative z-20 mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-petal"
            >
              <div className={`h-40 bg-gradient-to-br ${t.hue} relative overflow-hidden`}>
                <t.icon className="absolute right-6 top-6 h-16 w-16 text-primary/40 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                <div className="absolute bottom-4 left-6 text-xs uppercase tracking-widest text-primary/80">
                  {t.tag}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl text-foreground">{t.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Xem template
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <OrderSection />

      <footer className="relative z-20 border-t border-border/50 bg-background/70 py-8 text-center text-sm text-muted-foreground backdrop-blur">
        Làm với <Heart className="mx-1 inline h-3.5 w-3.5 fill-primary text-primary" /> để tặng
        người bạn thương.
      </footer>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
