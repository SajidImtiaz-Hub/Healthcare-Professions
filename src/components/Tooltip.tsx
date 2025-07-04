import React from "react";

interface TooltipProps {
  x: number;
  y: number;
  name: string;
  label: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, name, label }) => (
  <div
    style={{
      position: 'absolute',
      left: x + 20,
      top: y - 10,
      pointerEvents: 'none',
      zIndex: 100
    }}
    className="bg-white border border-blue-200 rounded px-3 py-1 text-xs text-blue-800 shadow"
  >
    <div className="font-bold">{name}</div>
    <div>{label}</div>
  </div>
); 