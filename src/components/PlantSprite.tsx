"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HealthState } from "@/lib/types";

interface Palette {
  leaf: string;
  leafDark: string;
  stem: string;
  fruit: string;
  bloom: string;
}

const PALETTES: Record<HealthState, Palette> = {
  dancing: { leaf: "#5fb37f", leafDark: "#2d6a4f", stem: "#2d6a4f", fruit: "#e0503f", bloom: "#e28f83" },
  happy: { leaf: "#529471", leafDark: "#2d6a4f", stem: "#2d6a4f", fruit: "#d9503f", bloom: "#e28f83" },
  sad: { leaf: "#7fa58d", leafDark: "#4f7a62", stem: "#4f7a62", fruit: "#c46a5c", bloom: "#c9a39d" },
  browning: { leaf: "#b3a24e", leafDark: "#8a6f33", stem: "#7a6a35", fruit: "#8a5a3c", bloom: "#b08a6a" },
  dead: { leaf: "#9a8d78", leafDark: "#6f6354", stem: "#6f6354", fruit: "#6d5f52", bloom: "#8b7f70" },
};

/** How far the plant leans/droops (degrees) for each mood. */
const DROOP: Record<HealthState, number> = { dancing: 0, happy: 0, sad: -7, browning: -16, dead: -34 };

const INK = "#1E3A29";

function Leaf({ x, y, rot, p, size = 1 }: { x: number; y: number; rot: number; p: Palette; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
      <path d="M0 0 C-9 -6 -9 -20 0 -28 C9 -20 9 -6 0 0 Z" fill={p.leaf} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 -2 L0 -22" stroke={p.leafDark} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function Plant({ species, p, state }: { species: string; p: Palette; state: HealthState }) {
  const key = species.toLowerCase();
  const bloomy = state === "dancing" || state === "happy";
  if (key.includes("cactus")) {
    return (
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <rect x="48" y="28" width="24" height="62" rx="12" fill={p.leaf} />
        <path d="M48 62 H40 a8 8 0 0 1 -8 -8 V46 a7 7 0 0 1 14 0 V54 H48" fill={p.leaf} />
        <path d="M72 52 H80 a8 8 0 0 0 8 -8 V38 a7 7 0 0 0 -14 0 V44 H72" fill={p.leaf} />
        <g stroke={p.leafDark} strokeWidth="1.6" strokeLinecap="round">
          <path d="M60 36 v6 M60 50 v6 M60 64 v6 M60 78 v6 M54 44 l-3 2 M66 58 l3 2 M54 70 l-3 2" />
        </g>
        {bloomy && <circle cx="60" cy="27" r="6" fill={p.bloom} />}
      </g>
    );
  }
  if (key.includes("neem")) {
    return (
      <g strokeLinejoin="round">
        <path d="M58 90 L56 50 M62 90 L64 54 M60 66 L44 48 M60 62 L78 44" stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M58 90 L56 50 M62 90 L64 54 M60 66 L44 48 M60 62 L78 44" stroke="#8b6a45" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {[
          [44, 44, 14], [78, 40, 14], [60, 30, 17], [34, 56, 11], [88, 54, 11], [58, 52, 15],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? p.leaf : p.leafDark} stroke={INK} strokeWidth="2.2" />
        ))}
        <g stroke={p.leaf} strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <path d="M52 28 l4 4 M70 26 l-4 5 M40 42 l5 2 M84 40 l-5 3" />
        </g>
      </g>
    );
  }
  if (key.includes("rose")) {
    return (
      <g strokeLinejoin="round">
        <path d="M60 90 Q58 66 62 38" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M60 90 Q58 66 62 38" stroke={p.stem} strokeWidth="3" fill="none" strokeLinecap="round" />
        <Leaf x={60} y={74} rot={-60} p={p} size={0.8} />
        <Leaf x={60} y={62} rot={62} p={p} size={0.8} />
        <Leaf x={61} y={50} rot={-52} p={p} size={0.7} />
        <g stroke={INK} strokeWidth="2.2">
          <circle cx="62" cy="30" r="14" fill={p.bloom} />
          <path d="M62 30 m-8 0 a8 8 0 1 1 8 8" fill="none" strokeLinecap="round" />
          <path d="M62 30 m-3 0 a3 3 0 1 1 3 3" fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  }
  if (key.includes("tomato")) {
    return (
      <g strokeLinejoin="round">
        <path d="M60 90 Q54 64 62 30" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M60 90 Q54 64 62 30" stroke={p.stem} strokeWidth="3" fill="none" strokeLinecap="round" />
        <Leaf x={58} y={80} rot={-68} p={p} size={0.9} />
        <Leaf x={58} y={66} rot={66} p={p} size={0.9} />
        <Leaf x={60} y={52} rot={-60} p={p} size={0.8} />
        <Leaf x={62} y={38} rot={55} p={p} size={0.8} />
        <Leaf x={62} y={30} rot={-8} p={p} size={0.7} />
        <g stroke={INK} strokeWidth="2.2" fill={p.fruit}>
          <circle cx="44" cy="62" r="7" />
          <circle cx="78" cy="54" r="7.5" />
          <circle cx="72" cy="76" r="6" />
        </g>
        <g fill={p.leafDark} stroke="none">
          <path d="M40 56 l4 3 l4 -3 l-4 -1z M74 48 l4 3 l4 -3 l-4 -1z" />
        </g>
      </g>
    );
  }
  if (key.includes("tulsi") || key.includes("basil")) {
    return (
      <g strokeLinejoin="round">
        <path d="M60 90 L60 50" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <path d="M60 90 L60 50" stroke={p.stem} strokeWidth="3" strokeLinecap="round" />
        {[
          [60, 84, -80], [60, 84, 80], [60, 72, -58], [60, 72, 58], [60, 60, -38], [60, 60, 38], [60, 50, -14], [60, 50, 14], [60, 44, 0],
        ].map(([x, y, r], i) => (
          <Leaf key={i} x={x} y={y} rot={r} p={p} size={0.78} />
        ))}
        {bloomy && (
          <g fill={p.bloom} stroke={INK} strokeWidth="1.6">
            <circle cx="60" cy="14" r="3" />
            <circle cx="56" cy="19" r="2.5" />
            <circle cx="64" cy="19" r="2.5" />
          </g>
        )}
      </g>
    );
  }
  // generic sprout
  return (
    <g strokeLinejoin="round">
      <path d="M60 90 L60 56" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M60 90 L60 56" stroke={p.stem} strokeWidth="3" strokeLinecap="round" />
      <Leaf x={60} y={64} rot={-55} p={p} size={1.1} />
      <Leaf x={60} y={58} rot={55} p={p} size={1.1} />
    </g>
  );
}

function Face({ state }: { state: HealthState }) {
  const eye = (cx: number) =>
    state === "dead" ? (
      <g stroke={INK} strokeWidth="2" strokeLinecap="round">
        <path d={`M${cx - 3} 106 l6 6 M${cx + 3} 106 l-6 6`} />
      </g>
    ) : state === "dancing" ? (
      <path d={`M${cx - 4} 111 Q${cx} 104 ${cx + 4} 111`} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    ) : (
      <circle cx={cx} cy="109" r={state === "sad" ? 2.6 : 2.2} fill={INK} />
    );

  const mouth = {
    dancing: <path d="M52 117 Q60 126 68 117 Z" fill="#c4574a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />,
    happy: <path d="M53 117 Q60 123 67 117" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />,
    sad: <path d="M53 122 Q60 116 67 122" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />,
    browning: <path d="M53 120 Q56 117 60 120 T67 120" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />,
    dead: <path d="M54 120 H66" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />,
  }[state];

  return (
    <g>
      {eye(51)}
      {eye(69)}
      {mouth}
      {(state === "dancing" || state === "happy") && (
        <g fill="#e28f83" opacity="0.8">
          <circle cx="45" cy="116" r="3" />
          <circle cx="75" cy="116" r="3" />
        </g>
      )}
      {state === "sad" && <path d="M72 112 q3 5 0 7 q-3 -2 0 -7z" fill="#8ec9e6" stroke={INK} strokeWidth="1.4" />}
    </g>
  );
}

interface Props {
  species: string;
  state: HealthState;
  size?: number;
  className?: string;
}

/** Illustrated potted plant whose mood (face, colour, posture, motion) follows its health state. */
export function PlantSprite({ species, state, size = 140, className }: Props) {
  const reduce = useReducedMotion();
  const palette = PALETTES[state];

  const animate = reduce
    ? undefined
    : state === "dancing"
      ? { y: [0, -9, 0, -9, 0], rotate: [-4, 4, -4, 4, -4] }
      : state === "happy"
        ? { rotate: [-1.5, 1.5, -1.5] }
        : state === "sad"
          ? { y: [0, 1.5, 0] }
          : undefined;
  const transition = reduce
    ? undefined
    : state === "dancing"
      ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: state === "happy" ? 4 : 3.5, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <motion.svg
      width={size}
      height={size * (140 / 120)}
      viewBox="0 0 120 140"
      role="img"
      aria-label={`${species}, ${state}`}
      className={className}
      style={{ transformOrigin: "60px 135px", overflow: "visible" }}
      animate={animate}
      transition={transition}
    >
      {/* ground shadow */}
      <ellipse cx="60" cy="135" rx="30" ry="4" fill="#1E3A29" opacity="0.18" />

      {/* plant (droops with poor health) */}
      <g transform={`rotate(${DROOP[state]} 60 90)`}>
        <Plant species={species} p={palette} state={state} />
      </g>

      {/* pot */}
      <path d="M36 94 H84 L78 132 Q77 135 73 135 H47 Q43 135 42 132 Z" fill="#c9774f" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="32" y="86" width="56" height="12" rx="4" fill="#dd9568" stroke={INK} strokeWidth="2.5" />
      <path d="M40 101 H80" stroke="#a85f3c" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Face state={state} />

      {state === "dancing" && (
        <g fill="#e28f83" stroke={INK} strokeWidth="1" fontFamily="serif" fontSize="16">
          <text x="92" y="38">♪</text>
          <text x="10" y="52">♫</text>
        </g>
      )}
    </motion.svg>
  );
}
