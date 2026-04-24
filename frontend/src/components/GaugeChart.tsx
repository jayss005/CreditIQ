import { useEffect, useRef } from "react";

interface GaugeChartProps {
  /** 0–1 probability */
  value: number;
  approved: boolean;
}

const SIZE = 200;
const STROKE = 18;
const RADIUS = 80;
const CX = 100;
const CY = 110;
const ARC_LENGTH = Math.PI * RADIUS; // half-circle perimeter

/** Single semicircle arc path from left to right */
const ARC_D = `M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`;

export function GaugeChart({ value, approved }: GaugeChartProps) {
  const fillRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const rafRef = useRef<number>(0);

  const color = approved ? "#16A34A" : "#DC2626";

  useEffect(() => {
    if (!fillRef.current || !textRef.current) return;
    const fillEl: SVGPathElement = fillRef.current;
    const textEl: SVGTextElement = textRef.current;

    let start = 0;
    const duration = 600;

    const animate = (ts: number) => {
      if (start === 0) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = eased * value;

      // Animate dash-offset from full (hidden) → target
      const offset = ARC_LENGTH * (1 - current);
      fillEl.setAttribute("stroke-dashoffset", String(offset));
      textEl.textContent = `${Math.round(current * 100)}%`;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={SIZE}
        height={130}
        viewBox="0 0 200 130"
        aria-label={`Approval probability: ${Math.round(value * 100)}%`}
        role="img"
      >
        {/* Background arc */}
        <path
          d={ARC_D}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* Filled arc — animated via strokeDashoffset */}
        <path
          ref={fillRef}
          d={ARC_D}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={ARC_LENGTH}
        />
        {/* Center percentage label */}
        <text
          ref={textRef}
          x={CX}
          y={CY - 20}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold"
          fill="#0F172A"
          fontSize="28"
        >
          0%
        </text>
      </svg>
      <span className="text-xs text-hint -mt-2">Approval probability</span>
    </div>
  );
}
