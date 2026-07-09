import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  rotate: number;
}

export function PetalsFall({ count = 24 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const arr: Petal[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 8,
      delay: Math.random() * 10,
      size: 12 + Math.random() * 18,
      rotate: Math.random() * 360,
    }));
    setPetals(arr);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          <svg viewBox="0 0 32 32" className="h-full w-full drop-shadow-sm">
            <path
              d="M16 4 C22 10, 28 14, 16 28 C4 14, 10 10, 16 4 Z"
              fill="oklch(0.86 0.09 350)"
              opacity="0.85"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
