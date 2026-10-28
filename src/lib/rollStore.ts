/**
 * Lưu & tải "cuộn phim" (ảnh + chú thích + lời nhắn) để chia sẻ qua link.
 *
 * Toàn bộ app chỉ dùng `rollStore` bên dưới. Khi chọn được dịch vụ lưu trữ thật
 * (Supabase, Vercel Blob, Firebase…), viết một `RollStore` mới rồi đổi export cuối file —
 * giao diện không cần sửa gì.
 */

export type Note = { message: string; signature: string };

/** `img` là URL ảnh (blob: khi đang soạn, URL thật sau khi tải về); `date` dạng yyyy-mm-dd hoặc rỗng. */
export type RollShot = { img: string; caption: string; date: string };

export type Roll = { shots: RollShot[]; note: Note };

export interface RollStore {
  /** false = link chỉ mở được trên chính trình duyệt đã tạo (chế độ thử). */
  readonly shareable: boolean;
  /** Tải ảnh lên + lưu nội dung, trả về id dùng trong link `/i/<id>`. */
  save(roll: Roll, onProgress?: (done: number, total: number) => void): Promise<string>;
  /** Trả về null nếu không có cuộn phim với id này. */
  load(id: string): Promise<Roll | null>;
}

/** Thu nhỏ ảnh (cạnh dài tối đa `maxSide`) và nén JPEG trước khi lưu/tải lên. */
export async function compressImage(url: string, maxSide = 1280, quality = 0.85): Promise<Blob> {
  const source = await (await fetch(url)).blob();
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Không nén được ảnh"))),
      "image/jpeg",
      quality,
    ),
  );
}

/** Thu hồi các blob URL của một cuộn phim đã tải (khi rời trang). */
export function revokeRoll(roll: Roll) {
  roll.shots.forEach((s) => s.img.startsWith("blob:") && URL.revokeObjectURL(s.img));
}

const newId = () => {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

// ---- Bản tạm: lưu trong IndexedDB của trình duyệt (để thử luồng tạo link) ----

type StoredRoll = {
  id: string;
  createdAt: number;
  note: Note;
  shots: { blob: Blob; caption: string; date: string }[];
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("love-letters", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("rolls", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction("rolls", mode).objectStore("rolls"));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

const localRollStore: RollStore = {
  shareable: false,
  async save(roll, onProgress) {
    const shots: StoredRoll["shots"] = [];
    for (const [i, s] of roll.shots.entries()) {
      shots.push({ blob: await compressImage(s.img), caption: s.caption, date: s.date });
      onProgress?.(i + 1, roll.shots.length);
    }
    const id = newId();
    await run("readwrite", (st) => st.put({ id, createdAt: Date.now(), note: roll.note, shots }));
    return id;
  },
  async load(id) {
    const stored = await run<StoredRoll | undefined>("readonly", (st) => st.get(id));
    if (!stored) return null;
    return {
      note: stored.note,
      shots: stored.shots.map((s) => ({
        img: URL.createObjectURL(s.blob),
        caption: s.caption,
        date: s.date,
      })),
    };
  },
};

export const rollStore: RollStore = localRollStore;
