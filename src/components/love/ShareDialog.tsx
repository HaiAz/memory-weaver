import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Info, Loader2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { rollStore, type Roll } from "@/lib/rollStore";

type State =
  | { kind: "saving"; done: number; total: number }
  | { kind: "ready"; url: string }
  | { kind: "error"; message: string };

/**
 * Lưu cuộn phim qua `rollStore` rồi đưa link `/i/<id>` để gửi.
 * Nếu cuộn phim không đổi kể từ lần tạo trước thì dùng lại link cũ.
 */
export function ShareDialog({
  open,
  roll,
  onClose,
}: {
  open: boolean;
  roll: Roll | null;
  onClose: () => void;
}) {
  const [state, setState] = useState<State | null>(null);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // Một lần lưu cho mỗi nội dung cuộn phim — mở lại hộp thoại / effect chạy lại không lưu trùng.
  const job = useRef<{ key: string; promise: Promise<string> } | null>(null);
  const onProgress = useRef<(done: number, total: number) => void>(() => {});

  useEffect(() => {
    if (!open || !roll) return;
    let alive = true;
    onProgress.current = (done, total) => alive && setState({ kind: "saving", done, total });

    const key = JSON.stringify(roll);
    if (job.current?.key !== key) {
      setState({ kind: "saving", done: 0, total: roll.shots.length });
      const promise = rollStore.save(roll, (d, t) => onProgress.current(d, t));
      job.current = { key, promise };
      promise.catch(() => {
        if (job.current?.promise === promise) job.current = null; // cho phép "Thử lại"
      });
    }
    job.current.promise.then(
      (id) => alive && setState({ kind: "ready", url: `${window.location.origin}/i/${id}` }),
      (e: unknown) =>
        alive && setState({ kind: "error", message: e instanceof Error ? e.message : String(e) }),
    );
    return () => {
      alive = false;
    };
  }, [open, roll, attempt]);

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-0 rounded-2xl border-[#e8d5c0] bg-[#fffaf3] p-6 sm:rounded-2xl">
        <p className="font-script text-2xl text-[#c45c7c]">Gửi cuộn phim</p>
        <DialogTitle className="mt-1 font-display text-2xl font-normal text-[#3a2418]">
          Link dành cho người ấy
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-[#6b5544]">
          Người nhận mở link sẽ chỉ thấy máy ảnh — bấm chụp là từng tấm chui ra, không sửa hay thay
          ảnh được.
        </DialogDescription>

        <div className="mt-5">
          {state?.kind === "saving" && (
            <div className="flex items-center gap-3 rounded-xl border border-[#ecdcc8] bg-white/70 p-4 text-sm text-[#6b5544]">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#c45c7c]" />
              <div className="flex-1">
                Đang nén & lưu ảnh {state.done}/{state.total}…
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f3e6da]">
                  <div
                    className="h-full rounded-full bg-[#c45c7c] transition-[width]"
                    style={{ width: `${(state.done / Math.max(1, state.total)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {state?.kind === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Không tạo được link: {state.message}
              <button
                onClick={() => setAttempt((a) => a + 1)}
                className="mt-2 block font-medium underline underline-offset-4"
              >
                Thử lại
              </button>
            </div>
          )}

          {state?.kind === "ready" && (
            <>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={state.url}
                  onFocus={(e) => e.target.select()}
                  aria-label="Link chia sẻ"
                  className="h-10 min-w-0 flex-1 rounded-full border border-[#e3d2bf] bg-white px-4 text-sm text-[#3a2418] focus:border-[#c45c7c] focus:outline-none"
                />
                <button
                  onClick={() => copy(state.url)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#c45c7c] px-4 text-sm font-medium text-white transition-transform hover:scale-105"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Đã copy" : "Copy"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {canNativeShare && (
                  <button
                    onClick={() =>
                      navigator.share({ title: "Một cuộn phim dành cho bạn ♡", url: state.url })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#c45c7c]/30 bg-white/60 px-4 py-1.5 text-sm text-[#c45c7c] transition-colors hover:bg-white"
                  >
                    <Send className="h-4 w-4" /> Gửi qua…
                  </button>
                )}
                <a
                  href={state.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#c45c7c]/30 bg-white/60 px-4 py-1.5 text-sm text-[#c45c7c] transition-colors hover:bg-white"
                >
                  <ExternalLink className="h-4 w-4" /> Mở thử như người nhận
                </a>
              </div>
            </>
          )}

          {!rollStore.shareable && (
            <p className="mt-4 flex gap-2 rounded-lg bg-[#fff3d6] p-3 text-xs leading-relaxed text-[#7a5a1e]">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Chế độ thử: chưa kết nối kho lưu trữ nên ảnh chỉ lưu trong trình duyệt này — link mở
              được ở đây nhưng người khác chưa xem được.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
