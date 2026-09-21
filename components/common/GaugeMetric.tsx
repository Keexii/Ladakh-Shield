import React from 'react';

interface GaugeMetricProps {
  label: string;
  sublabel?: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  criticalLow?: number;
  warningLow?: number;
  warningHigh?: number;
  criticalHigh?: number;
  icon?: React.ReactNode;
}

export const GaugeMetric: React.FC<GaugeMetricProps> = ({
  label,
  sublabel,
  value,
  unit,
  min,
  max,
  criticalLow,
  warningLow,
  warningHigh,
  criticalHigh,
  icon
}) => {
  // Normalize value to 0-100%
  const clamped = Math.max(min, Math.min(max, value));
  const percentage = Math.round(((clamped - min) / (max - min)) * 100);

  // Determine status color
  let statusColor = '#00f0ff'; // Cyan default
  let statusClass = 'text-cyan-400';
  let borderClass = 'border-cyan-500/20';

  if (criticalLow !== undefined && value <= criticalLow) {
    statusColor = '#ef4444';
    statusClass = 'text-rose-400';
    borderClass = 'border-rose-500/40 shadow-hud-glow-red';
  } else if (criticalHigh !== undefined && value >= criticalHigh) {
    statusColor = '#ef4444';
    statusClass = 'text-rose-400';
    borderClass = 'border-rose-500/40 shadow-hud-glow-red';
  } else if (warningLow !== undefined && value <= warningLow) {
    statusColor = '#f59e0b';
    statusClass = 'text-amber-400';
    borderClass = 'border-amber-500/30';
  } else if (warningHigh !== undefined && value >= warningHigh) {
    statusColor = '#f59e0b';
    statusClass = 'text-amber-400';
    borderClass = 'border-amber-500/30';
  }

  // Calculate SVG arc parameters (240 degree gauge)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference * 0.75);

  return (
    <div className={`relative p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border ${borderClass} transition-all duration-300 flex flex-col justify-between overflow-hidden group`}>
      {/* Subtle cockpit corner grid */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-cyan-500/5 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-cyan-400/80">{icon}</span>}
          <div>
            <div className="text-xs font-hud font-semibold uppercase tracking-wider text-slate-300">
              {label}
            </div>
            {sublabel && (
              <div className="text-[10px] font-mono text-slate-400">{sublabel}</div>
            )}
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
          {min} {unit} ➔ {max} {unit}
        </span>
      </div>

      <div className="flex items-center justify-between my-1">
        {/* SVG Circular Dial */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-135 transform" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
            />
            {/* Active gauge arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={statusColor}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${statusColor})`
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-hud text-slate-400">{percentage}%</span>
          </div>
        </div>

        {/* Large Value Display */}
        <div className="text-right flex-1 pl-2">
          <div className={`text-2xl md:text-3xl font-tech font-bold tracking-tight ${statusClass}`}>
            {value > 0 && unit !== '%' && label.toLowerCase().includes('delta') ? `+${value.toFixed(1)}` : value.toFixed(1)}
            <span className="text-xs font-hud font-normal text-slate-400 ml-1.5">{unit}</span>
          </div>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              {percentage <= 20 ? 'LOW' : percentage >= 80 ? 'HIGH' : 'NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Progress Bar Track at bottom */}
      <div className="w-full bg-slate-800/80 rounded-full h-1 mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: statusColor,
            boxShadow: `0 0 8px ${statusColor}`
          }}
        />
      </div>
    </div>
  );
};
