import React from 'react';
import { StatusLevel, AlertSeverity } from '../../types/telemetry';

interface StatusBadgeProps {
  status: StatusLevel | AlertSeverity | 'OK' | 'DEGRADED';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  label,
  className = ''
}) => {
  let colorStyles = '';
  let dotColor = '';
  let text = label || status;

  switch (status) {
    case 'NORMAL':
    case 'OK':
      colorStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
      break;
    case 'WARNING':
    case 'DEGRADED':
      colorStyles = 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse-slow';
      dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
      break;
    case 'CRITICAL':
      colorStyles = 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-hud-glow-red animate-pulse';
      dotColor = 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,1)]';
      break;
    case 'OFFLINE':
      colorStyles = 'bg-slate-700/20 text-slate-400 border-slate-600/30';
      dotColor = 'bg-slate-500';
      break;
    case 'INFO':
      colorStyles = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      dotColor = 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]';
      break;
    default:
      colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';
      dotColor = 'bg-slate-400';
  }

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 gap-2 font-semibold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-bold tracking-wider'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-hud uppercase transition-all duration-300 ${colorStyles} ${sizeStyles} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {status === 'CRITICAL' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      <span>{text}</span>
    </span>
  );
};
