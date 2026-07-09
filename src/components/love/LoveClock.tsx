import { useEffect, useState } from "react";

function diff(from: Date, now: Date) {
  const ms = now.getTime() - from.getTime();
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const years = now.getFullYear() - from.getFullYear();
  return { days, hours, minutes, seconds, years };
}

export function LoveClock({ since = "2022-02-14T00:00:00" }: { since?: string }) {
  const from = new Date(since);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const d = diff(from, now);
  const items = [
    { label: "Ngày", value: d.days },
    { label: "Giờ", value: d.hours },
    { label: "Phút", value: d.minutes },
    { label: "Giây", value: d.seconds },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border/60 bg-card/70 px-4 py-5 text-center backdrop-blur-sm shadow-soft"
        >
          <div className="font-display text-3xl font-bold tabular-nums text-primary sm:text-4xl">
            {String(it.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
