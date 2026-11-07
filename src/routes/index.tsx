import { createFileRoute } from "@tanstack/react-router";
import { Heart, ArrowRight } from "lucide-react";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/love/SiteHeader";
import { PetalsFall } from "@/components/love/PetalsFall";
import { OrderSection } from "@/components/love/OrderSection";
import { TemplateShowcase, type TemplateCardData } from "@/components/love/TemplateShowcase";

export const Route = createFileRoute("/")({
  component: Landing,
});

const templates: TemplateCardData[] = [
  {
    to: "/t/classic",
    name: "Cổ điển",
    tag: "Thư tỏ tình",
    desc: "Phong bì mở ra, chữ hiện dần theo từng dòng — nhẹ nhàng như một lá thư viết tay.",
  },
  {
    to: "/t/album",
    name: "Album kỷ niệm",
    tag: "Ảnh + Timeline",
    desc: "Album ảnh chuyển cảnh mượt, timeline cột mốc yêu nhau và đồng hồ đếm thời gian.",
  },
  {
    to: "/t/cinematic",
    name: "Điện ảnh",
    tag: "Loading + Confetti",
    desc: "Màn hình loading, nhạc nền, và pháo giấy khi cuộn tới cuối trang.",
  },
  {
    to: "/t/playful",
    name: "Vui tươi",
    tag: "Trái tim theo chuột",
    desc: "Trái tim bay theo con trỏ, cánh hoa rơi, nút 'Mãi bên nhau' bung pháo giấy.",
  },
  {
    to: "/t/galaxy",
    name: "Galaxy",
    tag: "Bầu trời sao",
    desc: "Hàng trăm ngôi sao lấp lánh, sao băng bay ngang — em là cả thiên hà.",
  },
  {
    to: "/t/polaroid",
    name: "Polaroid",
    tag: "Vintage scrapbook",
    desc: "Ảnh polaroid dán tường với dây đèn, chú thích viết tay lãng mạn.",
  },
  {
    to: "/t/chat",
    name: "Tin nhắn",
    tag: "iMessage style",
    desc: "Cuộc trò chuyện tỏ tình hiện dần từng bong bóng — kiểu viral TikTok.",
  },
  {
    to: "/t/fireworks",
    name: "Pháo hoa",
    tag: "Đêm rực rỡ",
    desc: "Bấm chuột nổ pháo hoa, thành phố đêm với vô số màu — cực lễ hội.",
  },
  {
    to: "/t/balloon",
    name: "Bóng bay",
    tag: "Click to pop",
    desc: "Bấm từng bóng bay để lộ ra từng chữ trong lời tỏ tình — vừa vui vừa hồi hộp.",
  },
  {
    to: "/t/vinyl",
    name: "Vinyl",
    tag: "Đĩa than xoay",
    desc: "Đĩa than xoay tròn cùng lời bài hát tình yêu — kèm nút phát nhạc.",
  },
  {
    to: "/t/scratch",
    name: "Cào thẻ",
    tag: "Scratch to reveal",
    desc: "Cào lớp phủ như thẻ cào để lộ lời nhắn giấu bên dưới.",
  },
  {
    to: "/t/notebook",
    name: "Sổ tay",
    tag: "Lật từng trang",
    desc: "Sổ tay giấy kẻ với 5 trang viết tay — lật qua từng chương chuyện tình.",
  },
  {
    to: "/t/orbit",
    name: "Orbit",
    tag: "Ảnh xoay quỹ đạo",
    desc: "Ảnh hai đứa xoay quanh trái tim theo vòng quỹ đạo trên nền hologram lấp lánh.",
  },
  {
    to: "/t/instax",
    name: "Instax",
    tag: "Chụp lấy liền",
    desc: "Bấm chụp từng tấm trượt ra khỏi máy, kéo cả dải phim xuống rồi treo lên dây đèn.",
  },
  {
    to: "/t/pullstrip",
    name: "Kéo phim",
    tag: "Drag-to-reveal",
    desc: "Bấm chụp, nắm mép phim và kéo dài xuống — cả dải kỷ niệm của hai đứa lộ dần.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen bg-gradient-blossom">
      <PetalsFall count={18} />
      <SiteHeader />

      <section className="relative z-20 mx-auto max-w-4xl px-4 pt-16 pb-10 text-center sm:pt-24">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <Heart className="h-3.5 w-3.5 fill-primary text-brand" />
          Bộ sưu tập template dành cho người yêu
        </div>
        <h1 className="font-display text-5xl leading-tight text-foreground sm:text-7xl">
          Gửi người ấy <br />
          <span className="font-script text-brand sm:text-8xl">một trang web tình yêu</span>
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

      <TemplateShowcase templates={templates} />

      <OrderSection />

      <footer className="relative z-20 border-t border-border/50 bg-background/70 py-8 text-center text-sm text-muted-foreground backdrop-blur">
        Làm với <Heart className="mx-1 inline h-3.5 w-3.5 fill-primary text-brand" /> để tặng người
        bạn thương.
      </footer>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
