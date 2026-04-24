import { useEffect, useState } from "react";

interface ProbBarProps {
  label: string;
  value: number;
  color: string;
}

export function ProbBar({ label, value, color }: ProbBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value * 100), 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-body">{label}</span>
        <span className="text-xs font-semibold text-heading">
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
