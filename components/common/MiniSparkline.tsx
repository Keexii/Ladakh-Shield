import React from 'react';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showMinMax?: boolean;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = '#00f0ff',
  height = 36,
  width = 120,
  showMinMax = false
}) => {
  if (!data || data.length < 2) {
    return <div className="h-8 flex items-center justify-center text-xs text-slate-500">Buffering...</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  // Build SVG path
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 8) + 4;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 4,${height} L ${points.join(' L ')} L ${width - 4},${height} Z`;

  return (
    <div className="relative inline-flex items-center">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path d={areaD} fill={`url(#grad-${color})`} />

        {/* Glowing stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />

        {/* Current point pulse */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="3"
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )}
      </svg>
      {showMinMax && (
        <div className="flex flex-col justify-between h-full ml-2 text-[9px] font-mono text-slate-400">
          <span>{max.toFixed(1)}</span>
          <span>{min.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};
