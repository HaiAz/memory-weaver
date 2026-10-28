import { ArrowDown, ArrowUp, CalendarDays, ImagePlus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Note, Roll, RollShot } from "@/lib/rollStore";

const sectionLabel = "mb-1 block text-[10px] uppercase tracking-widest text-[#8b6f5e]";

const fieldClass =
  "h-9 w-full rounded-md border border-[#e3d2bf] bg-white px-3 text-[#3a2418] placeholder:text-[#b9a493] transition-colors focus:border-[#c45c7c] focus:outline-none focus:ring-2 focus:ring-[#c45c7c]/20";

const iconBtn =
  "rounded-md p-1.5 text-[#8b6f5e] transition-colors hover:bg-[#f8e3ea] hover:text-[#c45c7c] disabled:pointer-events-none disabled:opacity-30";

/**
 * Hộp thoại soạn cuộn phim: xem trước ảnh, đặt tên + ngày, sắp thứ tự,
 * và viết lời nhắn trên thiệp — trước khi "lắp phim vào máy".
 */
export function RollEditor({
  value,
  max,
  placeholderNote,
  onChange,
  onAddFiles,
  onCancel,
  onConfirm,
  onUseSamples,
}: {
  value: Roll | null;
  max: number;
  placeholderNote: Note;
  onChange: (value: Roll) => void;
  onAddFiles: (files: File[]) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onUseSamples?: () => void;
}) {
  const list = value?.shots ?? [];
  const note = value?.note ?? placeholderNote;

  const setShots = (shots: RollShot[]) => onChange({ shots, note });
  const setNote = (patch: Partial<Note>) => onChange({ shots: list, note: { ...note, ...patch } });
  const update = (i: number, patch: Partial<RollShot>) =>
    setShots(list.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...list];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setShots(next);
  };
  const remove = (i: number) => setShots(list.filter((_, k) => k !== i));

  return (
    <Dialog open={value !== null} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border-[#e8d5c0] bg-[#fffaf3] p-0 sm:rounded-2xl">
        <div className="border-b border-[#ecdcc8] px-6 pt-6 pb-4 pr-12">
          <p className="font-script text-2xl text-[#c45c7c]">Cuộn phim của hai đứa</p>
          <DialogTitle className="mt-1 font-display text-2xl font-normal text-[#3a2418]">
            Đặt tên cho từng khoảnh khắc
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[#6b5544]">
            Ảnh sẽ chui ra khỏi máy theo đúng thứ tự dưới đây — dùng mũi tên để đổi chỗ.
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <ol className="space-y-3">
            {list.map((d, i) => (
              <li
                key={d.img}
                className="flex items-center gap-3 rounded-xl border border-[#ecdcc8] bg-white/70 p-3 sm:gap-4"
              >
                {/* Ảnh preview kiểu polaroid nhỏ */}
                <div
                  className="relative shrink-0 rounded-sm bg-white p-1.5 pb-4 shadow-md"
                  style={{ rotate: `${i % 2 ? 3 : -3}deg` }}
                >
                  <img
                    src={d.img}
                    alt=""
                    draggable={false}
                    className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                  />
                  <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c45c7c] text-[11px] font-semibold text-white shadow">
                    {i + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block">
                    <span className="sr-only">Tên khoảnh khắc {i + 1}</span>
                    <input
                      value={d.caption}
                      onChange={(e) => update(i, { caption: e.target.value })}
                      placeholder={`Khoảnh khắc ${i + 1}`}
                      maxLength={40}
                      autoFocus={i === 0}
                      className={`${fieldClass} font-script text-lg`}
                    />
                  </label>
                  <label className="relative block">
                    <span className="sr-only">Thời gian của khoảnh khắc {i + 1}</span>
                    <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b9a493]" />
                    <input
                      type="date"
                      value={d.date}
                      onChange={(e) => update(i, { date: e.target.value })}
                      className={`${fieldClass} pl-8 text-sm`}
                    />
                  </label>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Đưa lên trước"
                    className={iconBtn}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Bỏ ảnh này"
                    className={iconBtn}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === list.length - 1}
                    aria-label="Đưa xuống sau"
                    className={iconBtn}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}

            {list.length < max && (
              <li>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e3c3cf] py-5 text-sm text-[#c45c7c] transition-colors hover:bg-white/60">
                  <ImagePlus className="h-4 w-4" />
                  {list.length ? "Thêm ảnh" : "Chọn ảnh"} ({list.length}/{max})
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      if (files.length) onAddFiles(files);
                    }}
                  />
                </label>
              </li>
            )}
          </ol>

          {/* Thiệp lời nhắn cuối trang */}
          <section className="relative mt-6 rounded-xl bg-[#fffbf0] p-4 shadow-md sm:p-5">
            <div className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 rotate-2 bg-[#f8c8d8]/70" />
            <p className="font-script text-xl text-[#c45c7c]">Thiệp lời nhắn</p>
            <p className="mb-3 text-xs text-[#8b6f5e]">
              Hiện ở cuối trang, sau khi tất cả ảnh đã treo lên dây.
            </p>
            <label className="block">
              <span className={sectionLabel}>Lời nhắn</span>
              <textarea
                value={note.message}
                onChange={(e) => setNote({ message: e.target.value })}
                maxLength={200}
                rows={3}
                placeholder={placeholderNote.message}
                className={`${fieldClass} h-auto resize-none py-2 text-center font-script text-xl leading-snug`}
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
            </label>
            <label className="mt-3 block">
              <span className={sectionLabel}>Ký tên</span>
              <input
                value={note.signature}
                onChange={(e) => setNote({ signature: e.target.value })}
                maxLength={40}
                placeholder={placeholderNote.signature}
                className={`${fieldClass} text-right text-sm`}
              />
            </label>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#ecdcc8] px-6 py-4 sm:flex-row sm:items-center">
          {onUseSamples && (
            <button
              type="button"
              onClick={onUseSamples}
              className="text-sm text-[#8b6f5e] underline-offset-4 hover:text-[#c45c7c] hover:underline"
            >
              Dùng lại ảnh mẫu
            </button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 rounded-full border border-[#c45c7c]/30 bg-white/60 px-5 py-2 text-sm text-[#c45c7c] transition-colors hover:bg-white sm:flex-none"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!list.length}
              className="flex-1 whitespace-nowrap rounded-full bg-[#c45c7c] px-5 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(196,92,124,0.35)] transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
            >
              Lắp phim vào máy ({list.length})
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
