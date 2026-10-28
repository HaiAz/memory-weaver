import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { InstaxExperience } from "@/components/love/InstaxExperience";
import { revokeRoll, rollStore, type Roll } from "@/lib/rollStore";

/** Trang người nhận mở từ link chia sẻ — chỉ xem, không sửa. */
export const Route = createFileRoute("/i/$id")({
  head: () => ({
    meta: [
      { title: "Một cuộn phim dành cho bạn ♡" },
      { name: "description", content: "Bấm chụp để xem từng khoảnh khắc chui ra khỏi máy." },
    ],
  }),
  component: SharedRollPage,
});

function SharedRollPage() {
  const { id } = Route.useParams();
  const [roll, setRoll] = useState<Roll | null | "loading">("loading");

  useEffect(() => {
    let alive = true;
    let loaded: Roll | null = null;
    setRoll("loading");
    rollStore
      .load(id)
      .then((r) => {
        if (!alive) return r && revokeRoll(r);
        loaded = r;
        setRoll(r);
      })
      .catch(() => alive && setRoll(null));
    return () => {
      alive = false;
      if (loaded) revokeRoll(loaded);
    };
  }, [id]);

  if (roll === "loading") {
    return (
      <Shell>
        <div className="flex h-20 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-[#f8b8c8] to-[#e88aa8] shadow-lg">
          <Camera className="h-8 w-8 animate-pulse text-white" />
        </div>
        <p className="mt-5 font-script text-2xl text-[#c45c7c]">Đang lắp phim vào máy…</p>
      </Shell>
    );
  }

  if (!roll) {
    return (
      <Shell>
        <p className="font-script text-3xl text-[#c45c7c]">Ôi…</p>
        <h1 className="mt-2 font-display text-3xl text-[#3a2418]">Không tìm thấy cuộn phim này</h1>
        <p className="mt-3 max-w-sm text-sm text-[#6b5544]">
          Link có thể đã bị gõ sai hoặc cuộn phim không còn nữa. Hỏi lại người gửi nhé.
        </p>
        <Link
          to="/t/instax"
          className="mt-6 rounded-full bg-[#c45c7c] px-5 py-2 text-sm font-medium text-white"
        >
          Tự tạo một cuộn phim
        </Link>
      </Shell>
    );
  }

  return <InstaxExperience key={id} mode="view" roll={roll} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f5efe4] to-[#e8d5c0] px-4 text-center">
      {children}
    </div>
  );
}
