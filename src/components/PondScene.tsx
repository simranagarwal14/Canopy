/** Decorative pond strip with lily pads, lotus and reeds. Purely visual (aria-hidden). */
function Lotus({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#1E3A29" strokeWidth="2" strokeLinejoin="round">
      <path d="M0 0 C-14 -4 -18 -16 -14 -24 C-6 -22 0 -12 0 0 Z" fill="#f0b0a6" />
      <path d="M0 0 C14 -4 18 -16 14 -24 C6 -22 0 -12 0 0 Z" fill="#f0b0a6" />
      <path d="M0 0 C-8 -8 -8 -24 0 -32 C8 -24 8 -8 0 0 Z" fill="#e28f83" />
    </g>
  );
}

function Pad({ x, y, rx = 34 }: { x: number; y: number; rx?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.3} fill="#2d6a4f" stroke="#1E3A29" strokeWidth="2" />
      <ellipse cx={x - rx * 0.15} cy={y - 2} rx={rx * 0.7} ry={rx * 0.17} fill="#529471" opacity="0.8" />
      <path d={`M${x} ${y} L${x + rx * 0.9} ${y - rx * 0.12}`} stroke="#8ec9e6" strokeWidth="3" />
    </g>
  );
}

export function PondScene({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-full h-auto ${className}`}
      viewBox="0 0 1200 180"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* water */}
      <path
        d="M0 70 Q150 50 300 70 T600 70 T900 70 T1200 70 V180 H0 Z"
        fill="#8ec9e6"
        stroke="#1E3A29"
        strokeWidth="2.5"
      />
      <path d="M0 110 Q150 95 300 110 T600 110 T900 110 T1200 110" fill="none" stroke="#fffdf7" strokeWidth="2" opacity="0.7" strokeDasharray="40 30" />
      <path d="M0 145 Q150 130 300 145 T600 145 T900 145 T1200 145" fill="none" stroke="#fffdf7" strokeWidth="2" opacity="0.5" strokeDasharray="30 40" />
      {/* reeds */}
      <g stroke="#1E3A29" strokeWidth="2" fill="#2d6a4f" strokeLinecap="round">
        <path d="M60 80 Q55 30 70 6" fill="none" strokeWidth="4" stroke="#2d6a4f" />
        <path d="M78 80 Q86 40 100 24" fill="none" strokeWidth="4" stroke="#529471" />
        <path d="M1130 80 Q1136 30 1120 4" fill="none" strokeWidth="4" stroke="#2d6a4f" />
        <path d="M1110 80 Q1100 44 1086 28" fill="none" strokeWidth="4" stroke="#529471" />
      </g>
      <Pad x={220} y={120} />
      <Pad x={520} y={140} rx={42} />
      <Pad x={860} y={118} rx={30} />
      <Pad x={1010} y={146} rx={38} />
      <Lotus x={300} y={116} scale={1.1} />
      <Lotus x={760} y={132} />
      <Lotus x={1050} y={140} scale={0.9} />
    </svg>
  );
}
