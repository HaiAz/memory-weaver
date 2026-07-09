import confetti from "canvas-confetti";

export function fireConfetti() {
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 60,
    colors: ["#fef0f5", "#f8c8d8", "#e88aab", "#c45c7c", "#fff"],
    shapes: ["circle" as const, "square" as const],
  };
  const shoot = (origin: { x: number; y: number }) =>
    confetti({ ...defaults, particleCount: 60, origin });
  shoot({ x: 0.2, y: 0.6 });
  shoot({ x: 0.5, y: 0.4 });
  shoot({ x: 0.8, y: 0.6 });
}

export function heartsBurst() {
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.7 },
    colors: ["#e88aab", "#c45c7c", "#f8c8d8"],
    scalar: 1.2,
  });
}
