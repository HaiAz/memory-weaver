import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2, Ticket, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const templateOptions = [
  { id: "classic", name: "Cổ điển", price: 49000 },
  { id: "album", name: "Album", price: 69000 },
  { id: "cinematic", name: "Điện ảnh", price: 89000 },
  { id: "playful", name: "Vui tươi", price: 59000 },
  { id: "galaxy", name: "Galaxy", price: 79000 },
  { id: "polaroid", name: "Polaroid", price: 69000 },
  { id: "chat", name: "Tin nhắn", price: 59000 },
  { id: "fireworks", name: "Pháo hoa", price: 89000 },
  { id: "balloon", name: "Bóng bay", price: 59000 },
  { id: "vinyl", name: "Vinyl", price: 79000 },
  { id: "scratch", name: "Cào thẻ", price: 49000 },
  { id: "notebook", name: "Sổ tay", price: 69000 },
  { id: "instax", name: "Instax", price: 79000 },
  { id: "pullstrip", name: "Kéo phim", price: 89000 },
] as const;

const tipOptions = [1000, 5000, 10000, 20000] as const;

// Fake "taken" list for the availability check demo.
const takenNames = new Set(["admin", "test", "love", "anhyeuem"]);

const voucherCodes: Record<string, number> = {
  YEUEM: 0.2,
  LOVE10: 0.1,
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

type NameStatus = "idle" | "checking" | "ok" | "taken" | "invalid";

export function OrderSection() {
  const [templateId, setTemplateId] = useState<(typeof templateOptions)[number]["id"]>("classic");
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<NameStatus>("idle");
  const [content, setContent] = useState("");
  const [tip, setTip] = useState<number | "custom" | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "ok" | "invalid">("idle");

  const template = templateOptions.find((t) => t.id === templateId)!;

  const tipAmount = useMemo(() => {
    if (tip === "custom") return Math.max(0, parseInt(customTip || "0", 10) || 0);
    return typeof tip === "number" ? tip : 0;
  }, [tip, customTip]);

  const subtotal = template.price + tipAmount;
  const total = Math.max(0, Math.round(subtotal * (1 - voucherDiscount)));

  const checkName = () => {
    const n = name.trim().toLowerCase();
    if (!/^[a-z0-9]{3,20}$/.test(n)) {
      setNameStatus("invalid");
      return;
    }
    setNameStatus("checking");
    setTimeout(() => {
      setNameStatus(takenNames.has(n) ? "taken" : "ok");
    }, 600);
  };

  const checkVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (code in voucherCodes) {
      setVoucherDiscount(voucherCodes[code]);
      setVoucherStatus("ok");
      toast.success(`Áp dụng voucher -${Math.round(voucherCodes[code] * 100)}%`);
    } else {
      setVoucherDiscount(0);
      setVoucherStatus("invalid");
    }
  };

  const reset = () => {
    setName("");
    setNameStatus("idle");
    setContent("");
    setTip(null);
    setCustomTip("");
    setVoucher("");
    setVoucherDiscount(0);
    setVoucherStatus("idle");
    toast("Đã xoá dữ liệu đã nhập.");
  };

  const canPay = nameStatus === "ok" && content.trim().length > 0;

  const pay = () => {
    if (!canPay) {
      toast.error("Hãy kiểm tra tên và nhập lời nhắn trước nhé.");
      return;
    }
    toast.success(
      `Đơn ${fmt(total)} đã ghi nhận ✿ — trang ${name}.loveletters sẽ được gửi qua email.`,
    );
  };

  return (
    <section id="order" className="relative z-20 mx-auto max-w-5xl px-4 pb-24">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Tuỳ biến & đặt template
        </div>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl">Chọn một, viết lời nhắn, gửi đi</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Trang riêng của bạn sẽ có dạng{" "}
          <span className="font-mono text-primary">tên.loveletters.vn</span> — sẵn sàng trong ít
          phút.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-petal backdrop-blur"
      >
        <div className="grid gap-0 md:grid-cols-[1fr_320px]">
          {/* LEFT: form */}
          <div className="space-y-8 p-6 sm:p-10">
            {/* Template picker */}
            <div>
              <label className="text-sm font-medium text-foreground">Chọn template</label>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {templateOptions.map((t) => {
                  const active = t.id === templateId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10 shadow-soft"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="font-display text-base">{t.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{fmt(t.price)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subdomain */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Tên trang <span className="text-muted-foreground">(tên.loveletters.vn)</span>
              </label>
              <div className="mt-2 flex gap-2">
                <div className="flex flex-1 items-center rounded-xl border border-border bg-background focus-within:border-primary">
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameStatus("idle");
                    }}
                    placeholder="anhyeuem, hoaina..."
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                  />
                  <span className="pr-3 text-xs text-muted-foreground">.loveletters.vn</span>
                </div>
                <button
                  onClick={checkName}
                  disabled={!name || nameStatus === "checking"}
                  className="rounded-xl bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  Kiểm tra
                </button>
              </div>
              <div className="mt-2 flex h-5 items-center gap-1.5 text-xs">
                {nameStatus === "checking" && (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Đang kiểm tra…</span>
                  </>
                )}
                {nameStatus === "ok" && (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-700">Còn trống, bạn có thể dùng.</span>
                  </>
                )}
                {nameStatus === "taken" && (
                  <>
                    <X className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive">Tên này đã có người dùng.</span>
                  </>
                )}
                {nameStatus === "invalid" && (
                  <>
                    <X className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive">
                      3–20 ký tự, chỉ chữ thường và số, không dấu.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Nội dung <span className="text-muted-foreground">(mỗi dòng một câu)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder={"Cảm ơn em vì đã đến bên anh...\nAnh sẽ mãi yêu em..."}
                className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                {content.split("\n").filter((l) => l.trim()).length} câu
              </div>
            </div>

            {/* Tip */}
            <div>
              <label className="text-sm font-medium text-foreground">Tip thêm yêu thương</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {tipOptions.map((v) => {
                  const active = tip === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setTip(active ? null : v)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-primary/40 text-primary hover:bg-primary/10"
                      }`}
                    >
                      {fmt(v)}
                    </button>
                  );
                })}
                <button
                  onClick={() => setTip(tip === "custom" ? null : "custom")}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    tip === "custom"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-primary/40 text-primary hover:bg-primary/10"
                  }`}
                >
                  Tuỳ tâm
                </button>
                {tip === "custom" && (
                  <input
                    type="number"
                    min={0}
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    placeholder="Số tiền (đ)"
                    className="w-32 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Không chọn thì không cộng thêm tiền tip.
              </p>
            </div>

            {/* Voucher */}
            <div>
              <label className="text-sm font-medium text-foreground">Voucher</label>
              <div className="mt-2 flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={voucher}
                    onChange={(e) => {
                      setVoucher(e.target.value);
                      setVoucherStatus("idle");
                    }}
                    placeholder="Nhập mã (thử YEUEM)"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                  />
                </div>
                <button
                  onClick={checkVoucher}
                  disabled={!voucher}
                  className="rounded-xl bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  Áp dụng
                </button>
              </div>
              <div className="mt-2 flex h-5 items-center gap-1.5 text-xs">
                {voucherStatus === "ok" && (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-700">
                      Giảm {Math.round(voucherDiscount * 100)}% cho đơn này.
                    </span>
                  </>
                )}
                {voucherStatus === "invalid" && (
                  <>
                    <X className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive">Mã không hợp lệ.</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xoá toàn bộ dữ liệu đã nhập
            </button>
          </div>

          {/* RIGHT: summary (sticky on desktop) */}
          <aside className="border-t border-border bg-gradient-to-b from-secondary/60 to-background p-6 sm:p-8 md:border-l md:border-t-0">
            <div className="md:sticky md:top-24">
              <div className="text-xs uppercase tracking-widest text-primary">Tóm tắt đơn</div>
              <div className="mt-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium">{template.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Giá</span>
                  <span className="tabular-nums">{fmt(template.price)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tip</span>
                  <span className="tabular-nums">{fmt(tipAmount)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span className="tabular-nums text-green-700">
                      -{Math.round(voucherDiscount * 100)}%
                    </span>
                  </div>
                )}
                <div className="my-4 border-t border-dashed border-border" />
                <div className="flex items-end justify-between">
                  <span className="text-sm text-muted-foreground">Tổng cộng</span>
                  <span className="font-display text-3xl font-bold tabular-nums text-primary">
                    {fmt(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={pay}
                className="mt-5 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground shadow-petal transition-transform hover:scale-[1.02] active:scale-95"
              >
                Thanh toán {fmt(total)}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Trang của bạn sẽ hoạt động trong vòng 5 phút sau khi thanh toán.
              </p>
            </div>
          </aside>
        </div>
      </motion.div>
    </section>
  );
}
