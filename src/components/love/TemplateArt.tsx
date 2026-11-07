import type { ReactNode } from "react";

/**
 * Hand-drawn SVG illustrations for the template cards on the home page.
 * Each one is drawn on a 300×130 canvas and uses the site palette:
 * blush #F8DCE9, lavender #DCD9F7, butter #F8E7A9, cream #FFF8F0, plum #71638F
 * (night scenes use deeper shades of plum).
 */

const C = {
  blush: "#F8DCE9",
  rose: "#EFC3D7",
  lavender: "#DCD9F7",
  lilac: "#B9B1E6",
  butter: "#F8E7A9",
  cream: "#FFF8F0",
  plum: "#71638F",
  night: "#3E3557",
  midnight: "#241E38",
  white: "#FFFFFF",
};

const HEART =
  "M12 21s-7.5-4.6-10-9.3C.3 8.4 2.2 4 6.3 4c2.3 0 4 1.3 5.7 3.3C13.7 5.3 15.4 4 17.7 4c4.1 0 6 4.4 4.3 7.7C19.5 16.4 12 21 12 21z";

/** Heart centred on (x, y) with the given width. */
function Heart({
  x,
  y,
  size,
  fill,
  stroke,
  opacity,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  stroke?: string;
  opacity?: number;
}) {
  const s = size / 24;
  return (
    <path
      d={HEART}
      transform={`translate(${x - 12 * s} ${y - 12.5 * s}) scale(${s})`}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 1.5 / s : undefined}
      opacity={opacity}
    />
  );
}

/** Four-point sparkle centred on (x, y). */
function Sparkle({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const k = r * 0.28;
  return (
    <path
      d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z`}
      fill={fill}
    />
  );
}

/** Tiny landscape "photo" filling the given box. */
function Photo({
  x,
  y,
  w,
  h,
  sky,
  hill,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  sky: string;
  hill: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={sky} />
      <circle cx={x + w * 0.72} cy={y + h * 0.3} r={Math.min(w, h) * 0.12} fill={C.butter} />
      <path
        d={`M${x} ${y + h} L${x} ${y + h * 0.72} L${x + w * 0.3} ${y + h * 0.45} L${x + w * 0.55} ${y + h * 0.7} L${x + w * 0.72} ${y + h * 0.56} L${x + w} ${y + h * 0.8} L${x + w} ${y + h} Z`}
        fill={hill}
      />
    </g>
  );
}

// Deterministic star field so every render looks the same.
const STARS: [number, number, number][] = [
  [18, 14, 1.1],
  [42, 30, 0.8],
  [60, 12, 1.4],
  [28, 58, 0.9],
  [12, 96, 1.2],
  [48, 112, 0.8],
  [70, 84, 1],
  [160, 16, 0.9],
  [182, 36, 1.3],
  [205, 12, 0.8],
  [176, 98, 1.1],
  [198, 118, 0.9],
  [222, 84, 1.2],
  [262, 18, 1],
  [284, 44, 0.8],
  [270, 102, 1.3],
  [290, 120, 0.9],
  [244, 112, 0.8],
  [150, 120, 1],
  [130, 8, 0.9],
  [96, 18, 0.8],
  [8, 40, 0.8],
  [236, 60, 0.7],
  [210, 58, 1],
];

function StarField({ opacity = 1 }: { opacity?: number }) {
  return (
    <g fill={C.white} opacity={opacity}>
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} opacity={0.45 + ((i * 37) % 55) / 100} />
      ))}
    </g>
  );
}

function Burst({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const rays = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2);
  return (
    <g stroke={color} strokeWidth={1.6} strokeLinecap="round">
      {rays.map((a, i) => (
        <g key={i}>
          <line
            x1={x + Math.cos(a) * r * 0.35}
            y1={y + Math.sin(a) * r * 0.35}
            x2={x + Math.cos(a) * r * 0.85}
            y2={y + Math.sin(a) * r * 0.85}
          />
          <circle cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={1.4} fill={color} />
        </g>
      ))}
      <circle cx={x} cy={y} r={2.5} fill={color} stroke="none" />
    </g>
  );
}

function Classic() {
  return (
    <>
      <rect width="300" height="130" fill={C.blush} />
      <Heart x={40} y={30} size={14} fill={C.rose} />
      <Heart x={262} y={96} size={18} fill={C.rose} />
      <Heart x={250} y={28} size={10} fill={C.white} opacity={0.8} />
      <Heart x={52} y={100} size={10} fill={C.white} opacity={0.8} />
      {/* open flap */}
      <path
        d="M95 54 L150 20 L205 54 Z"
        fill={C.rose}
        stroke={C.plum}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* letter */}
      <rect
        x="106"
        y="24"
        width="88"
        height="64"
        rx="4"
        fill={C.cream}
        stroke={C.plum}
        strokeWidth="1.5"
      />
      <g stroke={C.lilac} strokeWidth="2" strokeLinecap="round">
        <line x1="116" y1="36" x2="170" y2="36" />
        <line x1="116" y1="45" x2="184" y2="45" />
        <line x1="116" y1="54" x2="160" y2="54" />
      </g>
      {/* envelope pocket */}
      <path
        d="M95 54 L150 90 L205 54 L205 118 L95 118 Z"
        fill={C.white}
        stroke={C.plum}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M95 118 L138 84 M205 118 L162 84" stroke={C.plum} strokeWidth="1.2" opacity="0.5" />
      <circle cx="150" cy="90" r="11" fill={C.plum} />
      <Heart x={150} y={90} size={12} fill={C.blush} />
    </>
  );
}

function Album() {
  return (
    <>
      <rect width="300" height="130" fill={C.lavender} />
      <g transform="rotate(-9 92 58)">
        <rect
          x="60"
          y="20"
          width="64"
          height="76"
          rx="3"
          fill={C.white}
          stroke={C.plum}
          strokeOpacity="0.25"
        />
        <Photo x={65} y={25} w={54} h={52} sky={C.blush} hill={C.rose} />
      </g>
      <g transform="rotate(8 208 58)">
        <rect
          x="176"
          y="20"
          width="64"
          height="76"
          rx="3"
          fill={C.white}
          stroke={C.plum}
          strokeOpacity="0.25"
        />
        <Photo x={181} y={25} w={54} h={52} sky={C.butter} hill={C.lilac} />
      </g>
      <g transform="rotate(-1 150 54)">
        <rect
          x="116"
          y="14"
          width="68"
          height="80"
          rx="3"
          fill={C.white}
          stroke={C.plum}
          strokeOpacity="0.3"
        />
        <Photo x={121} y={19} w={58} h={56} sky={C.cream} hill={C.plum} />
        <Heart x={150} y={84} size={9} fill={C.rose} />
      </g>
      {/* timeline */}
      <line
        x1="40"
        y1="114"
        x2="260"
        y2="114"
        stroke={C.plum}
        strokeWidth="1.5"
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      {[60, 110, 150, 190, 240].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="114"
          r={i === 2 ? 5 : 3.5}
          fill={i === 2 ? C.plum : C.white}
          stroke={C.plum}
          strokeWidth="1.5"
        />
      ))}
    </>
  );
}

function Cinematic() {
  const holes = Array.from({ length: 22 }, (_, i) => -20 + i * 16);
  const confetti: [number, number, string, number][] = [
    [30, 18, C.plum, 20],
    [62, 108, C.rose, -30],
    [92, 14, C.lilac, 45],
    [214, 112, C.plum, 10],
    [246, 16, C.rose, -20],
    [276, 104, C.lilac, 60],
    [16, 82, C.white, 30],
    [288, 60, C.white, -40],
    [180, 10, C.white, 15],
    [130, 118, C.lilac, -15],
  ];
  return (
    <>
      <defs>
        <linearGradient id="art-cine-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.butter} />
          <stop offset="1" stopColor={C.blush} />
        </linearGradient>
      </defs>
      <rect width="300" height="130" fill="url(#art-cine-bg)" />
      <g transform="rotate(-8 150 65)">
        <rect x="-20" y="38" width="340" height="54" fill={C.night} />
        {holes.map((x) => (
          <g key={x} fill={C.cream} opacity="0.85">
            <rect x={x} y="42" width="8" height="5" rx="1" />
            <rect x={x} y="83" width="8" height="5" rx="1" />
          </g>
        ))}
        {[18, 84, 150, 216].map((x, i) => (
          <rect
            key={x}
            x={x}
            y="51"
            width="58"
            height="28"
            rx="2"
            fill={[C.blush, C.lavender, C.butter, C.rose][i]}
          />
        ))}
        <circle cx="179" cy="65" r="10" fill={C.white} opacity="0.9" />
        <path d="M176 60 L184 65 L176 70 Z" fill={C.plum} />
      </g>
      {confetti.map(([x, y, color, rot], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="7"
          height="4"
          rx="1"
          fill={color}
          transform={`rotate(${rot} ${x} ${y})`}
        />
      ))}
      <circle cx="120" cy="20" r="2.5" fill={C.plum} />
      <circle cx="262" cy="84" r="2.5" fill={C.rose} />
    </>
  );
}

function Playful() {
  const trail: [number, number, number][] = [
    [52, 100, 10],
    [80, 92, 13],
    [108, 80, 16],
    [138, 66, 19],
    [170, 54, 22],
  ];
  return (
    <>
      <defs>
        <linearGradient id="art-play-bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.butter} />
          <stop offset="1" stopColor={C.blush} />
        </linearGradient>
      </defs>
      <rect width="300" height="130" fill="url(#art-play-bg)" />
      {[
        [30, 30, 25],
        [250, 104, -30],
        [120, 112, 60],
        [270, 30, 10],
        [200, 108, -60],
      ].map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="7"
          ry="4"
          fill={C.rose}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <path
        d="M40 106 Q120 96 196 44"
        fill="none"
        stroke={C.plum}
        strokeWidth="1.2"
        strokeDasharray="2 5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {trail.map(([x, y, s], i) => (
        <Heart
          key={i}
          x={x}
          y={y}
          size={s}
          fill={i % 2 ? C.plum : C.rose}
          opacity={0.5 + i * 0.12}
        />
      ))}
      {/* cursor */}
      <path
        d="M0 0 L0 24 L6.5 17.5 L11 28 L15.5 26 L11 15.5 L19.5 15.5 Z"
        transform="translate(204 30)"
        fill={C.white}
        stroke={C.plum}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Sparkle x={236} y={40} r={7} fill={C.plum} />
      <Sparkle x={226} y={66} r={4} fill={C.white} />
    </>
  );
}

function Galaxy() {
  const pts: [number, number][] = [
    [108, 98],
    [80, 74],
    [78, 52],
    [92, 40],
    [108, 52],
    [124, 40],
    [138, 52],
    [136, 74],
  ];
  return (
    <>
      <defs>
        <linearGradient id="art-gal-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.midnight} />
          <stop offset="1" stopColor={C.night} />
        </linearGradient>
        <linearGradient id="art-gal-tail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.white} stopOpacity="0" />
          <stop offset="1" stopColor={C.white} />
        </linearGradient>
      </defs>
      <rect width="300" height="130" fill="url(#art-gal-bg)" />
      <ellipse
        cx="190"
        cy="70"
        rx="120"
        ry="26"
        fill={C.lilac}
        opacity="0.12"
        transform="rotate(-18 190 70)"
      />
      <StarField />
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={C.lavender}
        strokeWidth="0.8"
        opacity="0.7"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={C.white} />
      ))}
      <line
        x1="180"
        y1="30"
        x2="232"
        y2="54"
        stroke="url(#art-gal-tail)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="232" cy="54" r="2.2" fill={C.white} />
      <circle cx="252" cy="34" r="15" fill={C.butter} />
      <circle cx="259" cy="29" r="13" fill={C.midnight} />
      <Sparkle x={200} y={96} r={6} fill={C.butter} />
      <Sparkle x={42} y={24} r={5} fill={C.blush} />
    </>
  );
}

function Polaroid() {
  const frames: [number, number, number, string, string][] = [
    [56, 36, -7, C.blush, C.rose],
    [121, 40, 3, C.lavender, C.plum],
    [186, 36, 8, C.butter, C.lilac],
  ];
  const bulbs = [20, 60, 100, 140, 180, 220, 260, 290];
  const stringY = (x: number) => {
    const t = x / 300;
    return 20 + 2 * t * (1 - t) * 30;
  };
  return (
    <>
      <rect width="300" height="130" fill={C.cream} />
      <g stroke={C.blush} strokeWidth="1">
        {[30, 70, 110].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} opacity="0.7" />
        ))}
      </g>
      <path d="M0 20 Q150 50 300 20" fill="none" stroke={C.plum} strokeWidth="1.2" opacity="0.6" />
      {bulbs.map((x) => (
        <g key={x}>
          <circle cx={x} cy={stringY(x) + 4} r="6" fill={C.butter} opacity="0.45" />
          <circle
            cx={x}
            cy={stringY(x) + 4}
            r="2.8"
            fill={C.butter}
            stroke={C.plum}
            strokeWidth="0.6"
          />
        </g>
      ))}
      {frames.map(([x, y, rot, sky, hill], i) => (
        <g key={i} transform={`rotate(${rot} ${x + 29} ${y})`}>
          <rect
            x={x}
            y={y}
            width="58"
            height="70"
            rx="2"
            fill={C.white}
            stroke={C.plum}
            strokeOpacity="0.25"
          />
          <Photo x={x + 5} y={y + 5} w={48} h={44} sky={sky} hill={hill} />
          <path
            d={`M${x + 10} ${y + 60} q5 -4 10 0 t10 0 t10 0`}
            fill="none"
            stroke={C.plum}
            strokeWidth="1"
            opacity="0.6"
          />
          <rect x={x + 25} y={y - 5} width="8" height="11" rx="1.5" fill={C.plum} />
        </g>
      ))}
    </>
  );
}

function Chat() {
  return (
    <>
      <rect width="300" height="130" fill="#FCEAF2" />
      <circle cx="44" cy="30" r="10" fill={C.lilac} />
      <Heart x={44} y={30} size={10} fill={C.white} />
      <rect x="62" y="18" width="128" height="26" rx="13" fill={C.lavender} />
      <rect x="74" y="28" width="84" height="6" rx="3" fill={C.plum} opacity="0.35" />
      <rect x="128" y="52" width="140" height="26" rx="13" fill={C.plum} />
      <rect x="142" y="62" width="74" height="6" rx="3" fill={C.white} opacity="0.6" />
      <Heart x={244} y={65} size={12} fill={C.blush} />
      <circle cx="44" cy="98" r="10" fill={C.lilac} />
      <Heart x={44} y={98} size={10} fill={C.white} />
      <rect x="62" y="86" width="60" height="26" rx="13" fill={C.lavender} />
      {[80, 92, 104].map((x, i) => (
        <circle key={x} cx={x} cy="99" r="3" fill={C.plum} opacity={0.4 + i * 0.25} />
      ))}
      <text
        x="262"
        y="92"
        fontSize="8"
        fill={C.plum}
        opacity="0.7"
        textAnchor="end"
        fontFamily="Inter, sans-serif"
      >
        Đã xem
      </text>
    </>
  );
}

function Fireworks() {
  return (
    <>
      <defs>
        <linearGradient id="art-fw-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.midnight} />
          <stop offset="1" stopColor={C.night} />
        </linearGradient>
      </defs>
      <rect width="300" height="130" fill="url(#art-fw-bg)" />
      <StarField opacity={0.5} />
      <Burst x={86} y={44} r={30} color={C.butter} />
      <Burst x={196} y={36} r={24} color={C.blush} />
      <Burst x={250} y={70} r={16} color={C.lilac} />
      <Burst x={40} y={80} r={12} color={C.rose} />
      <path
        d="M0 130 V104 H22 V92 H40 V108 H58 V86 H80 V100 H96 V80 H118 V104 H136 V94 H156 V110 H172 V88 H196 V102 H214 V84 H236 V106 H254 V96 H276 V108 H300 V130 Z"
        fill="#17122A"
      />
      <g fill={C.butter} opacity="0.85">
        {[
          [28, 98],
          [64, 92],
          [102, 88],
          [104, 96],
          [176, 94],
          [220, 92],
          [224, 100],
          [262, 102],
          [84, 106],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="3" height="3" />
        ))}
      </g>
    </>
  );
}

function Balloon() {
  const balloons: [number, number, string][] = [
    [70, 46, C.rose],
    [118, 34, C.butter],
    [168, 50, C.lilac],
    [218, 36, C.plum],
  ];
  return (
    <>
      <defs>
        <linearGradient id="art-bal-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.lavender} />
          <stop offset="1" stopColor={C.cream} />
        </linearGradient>
      </defs>
      <rect width="300" height="130" fill="url(#art-bal-bg)" />
      <ellipse cx="40" cy="22" rx="18" ry="6" fill={C.white} opacity="0.8" />
      <ellipse cx="262" cy="96" rx="22" ry="7" fill={C.white} opacity="0.8" />
      {balloons.map(([x, y, color], i) => (
        <g key={i}>
          <path
            d={`M${x} ${y + 26} q${i % 2 ? 6 : -6} 14 0 28 t0 ${40 - y / 3}`}
            fill="none"
            stroke={C.plum}
            strokeWidth="1"
            opacity="0.5"
          />
          <ellipse cx={x} cy={y} rx="18" ry="22" fill={color} />
          <path d={`M${x - 3} ${y + 24} L${x + 3} ${y + 24} L${x} ${y + 20} Z`} fill={color} />
          <ellipse
            cx={x - 6}
            cy={y - 8}
            rx="4"
            ry="7"
            fill={C.white}
            opacity="0.45"
            transform={`rotate(20 ${x - 6} ${y - 8})`}
          />
        </g>
      ))}
      <Heart x={218} y={36} size={14} fill={C.blush} />
      {/* popped balloon pieces */}
      <g stroke={C.rose} strokeWidth="2" strokeLinecap="round">
        <line x1="258" y1="40" x2="266" y2="34" />
        <line x1="270" y1="48" x2="278" y2="48" />
        <line x1="262" y1="56" x2="268" y2="62" />
      </g>
    </>
  );
}

function Vinyl() {
  return (
    <>
      <rect width="300" height="130" fill={C.night} />
      <circle cx="128" cy="66" r="62" fill={C.plum} opacity="0.25" />
      <circle cx="128" cy="66" r="54" fill="#1B1629" />
      {[48, 42, 36, 30, 24].map((r) => (
        <circle key={r} cx="128" cy="66" r={r} fill="none" stroke="#2F2843" strokeWidth="1.2" />
      ))}
      <path
        d="M92 34 A48 48 0 0 1 150 22"
        fill="none"
        stroke={C.white}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.15"
      />
      <circle cx="128" cy="66" r="17" fill={C.blush} />
      <Heart x={128} y={66} size={12} fill={C.plum} />
      {/* tonearm */}
      <circle cx="232" cy="22" r="9" fill={C.lavender} />
      <circle cx="232" cy="22" r="3.5" fill={C.plum} />
      <path
        d="M232 22 L214 76 L176 84"
        fill="none"
        stroke={C.lavender}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="166"
        y="79"
        width="14"
        height="10"
        rx="2"
        fill={C.lavender}
        transform="rotate(-12 173 84)"
      />
      {/* notes */}
      <g fill={C.butter} stroke={C.butter}>
        <ellipse cx="252" cy="98" rx="5" ry="3.8" stroke="none" />
        <line x1="256.5" y1="98" x2="256.5" y2="78" strokeWidth="1.8" />
        <path d="M256.5 78 q8 3 7 10" fill="none" strokeWidth="1.8" />
        <ellipse cx="276" cy="70" rx="4" ry="3" stroke="none" />
        <line x1="279.6" y1="70" x2="279.6" y2="54" strokeWidth="1.5" />
      </g>
    </>
  );
}

function Scratch() {
  return (
    <>
      <defs>
        <mask id="art-scr-mask">
          <rect x="0" y="0" width="300" height="130" fill="white" />
          <path
            d="M96 50 C120 40 140 76 168 52 S200 70 214 56 M100 74 C130 66 150 90 186 72 S210 86 206 80"
            stroke="black"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />
        </mask>
      </defs>
      <rect width="300" height="130" fill={C.blush} />
      <rect
        x="62"
        y="18"
        width="176"
        height="94"
        rx="12"
        fill={C.white}
        stroke={C.plum}
        strokeOpacity="0.3"
      />
      {/* hidden message */}
      <Heart x={110} y={64} size={20} fill={C.rose} />
      <rect x="128" y="54" width="70" height="7" rx="3.5" fill={C.plum} />
      <rect x="128" y="68" width="48" height="7" rx="3.5" fill={C.plum} opacity="0.5" />
      {/* scratch layer */}
      <g mask="url(#art-scr-mask)">
        <rect x="70" y="26" width="160" height="78" rx="8" fill={C.lilac} />
        {[
          [84, 36],
          [120, 96],
          [160, 34],
          [212, 92],
          [196, 40],
          [100, 90],
          [140, 46],
        ].map(([x, y], i) => (
          <Sparkle key={i} x={x} y={y} r={3} fill={C.white} />
        ))}
      </g>
      {/* coin */}
      <ellipse
        cx="246"
        cy="104"
        rx="16"
        ry="11"
        fill={C.butter}
        stroke={C.plum}
        strokeWidth="1.5"
        transform="rotate(-25 246 104)"
      />
      <ellipse
        cx="246"
        cy="104"
        rx="9"
        ry="6"
        fill="none"
        stroke={C.plum}
        strokeWidth="1"
        opacity="0.5"
        transform="rotate(-25 246 104)"
      />
    </>
  );
}

function Notebook() {
  const lines = [38, 50, 62, 74, 86, 98];
  return (
    <>
      <rect width="300" height="130" fill="#FBEFC9" />
      <path
        d="M150 20 Q110 12 62 18 L62 114 Q110 108 150 116 Z"
        fill={C.cream}
        stroke={C.plum}
        strokeWidth="1.3"
        strokeOpacity="0.5"
      />
      <path
        d="M150 20 Q190 12 238 18 L238 114 Q190 108 150 116 Z"
        fill={C.white}
        stroke={C.plum}
        strokeWidth="1.3"
        strokeOpacity="0.5"
      />
      <g stroke={C.lilac} strokeWidth="1">
        {lines.map((y) => (
          <g key={y}>
            <line x1="70" y1={y} x2="144" y2={y + 1} />
            <line x1="156" y1={y + 1} x2="230" y2={y} />
          </g>
        ))}
      </g>
      <line x1="80" y1="24" x2="80" y2="110" stroke={C.rose} strokeWidth="1" />
      <path
        d="M84 46 q4 -6 8 0 t8 0 t8 0 t8 0 t8 0 M84 58 q4 -6 8 0 t8 0 t8 0 t8 0 M84 70 q4 -6 8 0 t8 0 t8 0 t8 0 t8 0 t8 0"
        fill="none"
        stroke={C.plum}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <Heart x={194} y={62} size={22} fill={C.rose} stroke={C.plum} />
      <path
        d="M168 86 q6 -6 12 0 t12 0 t12 0"
        fill="none"
        stroke={C.plum}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line x1="150" y1="20" x2="150" y2="116" stroke={C.plum} strokeWidth="1" opacity="0.35" />
      {/* ribbon bookmark */}
      <path d="M220 14 L220 124 L226 118 L232 124 L232 14 Z" fill={C.plum} />
    </>
  );
}

function OrbitArt() {
  const orbit = (rx: number, ry: number, t: number): [number, number] => [
    150 + rx * Math.cos(t),
    65 + ry * Math.sin(t),
  ];
  const planets: [number, number, number, string, string][] = [
    [...orbit(112, 34, 0.4), 11, C.blush, C.rose],
    [...orbit(112, 34, 2.6), 9, C.butter, C.lilac],
    [...orbit(74, 22, 4.3), 8, C.lavender, C.plum],
    [...orbit(112, 34, 4.9), 7, C.cream, C.rose],
  ];
  return (
    <>
      <defs>
        <linearGradient id="art-orb-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.midnight} />
          <stop offset="1" stopColor="#5A4E7E" />
        </linearGradient>
        <radialGradient id="art-orb-glow">
          <stop offset="0" stopColor={C.blush} stopOpacity="0.7" />
          <stop offset="1" stopColor={C.blush} stopOpacity="0" />
        </radialGradient>
        {planets.map(([x, y, r], i) => (
          <clipPath key={i} id={`art-orb-clip-${i}`}>
            <circle cx={x} cy={y} r={r} />
          </clipPath>
        ))}
      </defs>
      <rect width="300" height="130" fill="url(#art-orb-bg)" />
      <StarField opacity={0.6} />
      <g transform="rotate(-12 150 65)">
        <ellipse
          cx="150"
          cy="65"
          rx="112"
          ry="34"
          fill="none"
          stroke={C.lavender}
          strokeWidth="1"
          opacity="0.5"
        />
        <ellipse
          cx="150"
          cy="65"
          rx="74"
          ry="22"
          fill="none"
          stroke={C.lavender}
          strokeWidth="1"
          opacity="0.5"
          strokeDasharray="3 4"
        />
        <circle cx="150" cy="65" r="34" fill="url(#art-orb-glow)" />
        <Heart x={150} y={65} size={30} fill={C.blush} />
        {planets.map(([x, y, r, sky, hill], i) => (
          <g key={i}>
            <g clipPath={`url(#art-orb-clip-${i})`}>
              <Photo x={x - r} y={y - r} w={r * 2} h={r * 2} sky={sky} hill={hill} />
            </g>
            <circle cx={x} cy={y} r={r} fill="none" stroke={C.white} strokeWidth="1.8" />
          </g>
        ))}
      </g>
      <Sparkle x={262} y={26} r={5} fill={C.butter} />
    </>
  );
}

function Instax() {
  return (
    <>
      <rect width="300" height="130" fill={C.blush} />
      <circle cx="58" cy="34" r="20" fill={C.white} opacity="0.5" />
      <circle cx="248" cy="96" r="26" fill={C.white} opacity="0.4" />
      {/* camera */}
      <rect
        x="88"
        y="12"
        width="124"
        height="84"
        rx="18"
        fill={C.lavender}
        stroke={C.plum}
        strokeWidth="1.5"
      />
      <rect x="88" y="70" width="124" height="26" rx="0" fill={C.lilac} opacity="0.5" />
      <rect
        x="100"
        y="22"
        width="24"
        height="14"
        rx="3"
        fill={C.white}
        stroke={C.plum}
        strokeWidth="1"
      />
      <rect x="180" y="22" width="18" height="12" rx="3" fill={C.night} />
      <circle cx="204" cy="12" r="5" fill={C.rose} stroke={C.plum} strokeWidth="1" />
      <circle cx="150" cy="54" r="26" fill={C.white} stroke={C.plum} strokeWidth="1.5" />
      <circle cx="150" cy="54" r="18" fill={C.plum} />
      <circle cx="150" cy="54" r="10" fill={C.midnight} />
      <circle cx="145" cy="49" r="3" fill={C.white} opacity="0.8" />
      <rect x="108" y="93" width="84" height="4" rx="2" fill={C.night} />
      {/* photo sliding out */}
      <g transform="rotate(4 150 112)">
        <rect
          x="114"
          y="95"
          width="72"
          height="44"
          rx="2"
          fill={C.white}
          stroke={C.plum}
          strokeOpacity="0.3"
        />
        <Photo x={120} y={100} w={60} h={30} sky={C.butter} hill={C.rose} />
      </g>
    </>
  );
}

function PullStrip() {
  const frames = [-8, 38, 84, 130];
  const holes = Array.from({ length: 14 }, (_, i) => -20 + i * 14);
  const palette: [string, string][] = [
    [C.blush, C.rose],
    [C.butter, C.lilac],
    [C.lavender, C.plum],
    [C.cream, C.rose],
  ];
  return (
    <>
      <defs>
        <linearGradient id="art-pull-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.night} />
          <stop offset="1" stopColor={C.plum} />
        </linearGradient>
      </defs>
      <rect width="300" height="130" fill="url(#art-pull-bg)" />
      <g transform="rotate(-16 150 65)">
        <rect x="112" y="-30" width="76" height="200" fill={C.midnight} />
        {holes.map((y) => (
          <g key={y} fill={C.cream} opacity="0.8">
            <rect x="116" y={y} width="5" height="7" rx="1" />
            <rect x="179" y={y} width="5" height="7" rx="1" />
          </g>
        ))}
        {frames.map((y, i) => (
          <Photo key={y} x={126} y={y} w={48} h={38} sky={palette[i][0]} hill={palette[i][1]} />
        ))}
      </g>
      {/* pull hint */}
      <g stroke={C.butter} strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M232 30 L232 92" strokeDasharray="3 5" />
        <path d="M224 84 L232 94 L240 84" />
      </g>
      <Heart x={64} y={40} size={16} fill={C.blush} opacity={0.9} />
      <Sparkle x={52} y={92} r={6} fill={C.butter} />
    </>
  );
}

const ART: Record<string, () => ReactNode> = {
  classic: Classic,
  album: Album,
  cinematic: Cinematic,
  playful: Playful,
  galaxy: Galaxy,
  polaroid: Polaroid,
  chat: Chat,
  fireworks: Fireworks,
  balloon: Balloon,
  vinyl: Vinyl,
  scratch: Scratch,
  notebook: Notebook,
  orbit: OrbitArt,
  instax: Instax,
  pullstrip: PullStrip,
};

export function TemplateArt({ slug, className }: { slug: string; className?: string }) {
  const Art = ART[slug];
  return (
    <svg
      viewBox="0 0 300 130"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      {Art ? <Art /> : <rect width="300" height="130" fill={C.blush} />}
    </svg>
  );
}
