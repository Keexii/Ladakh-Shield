import React, { useState } from 'react';
import {
  Snowflake,
  Wind,
  Flame,
  BatteryLow,
  Zap,
  RadioOff,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { DemoScenario } from '../../types/telemetry';

export const DemoModeBar: React.FC = () => {
  const { activeScenario, triggerScenario } = useTelemetry();
  const [expanded, setExpanded] = useState<boolean>(true);

  const scenarios: {
    id: DemoScenario;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
    hoverBorder: string;
    activeBg: string;
  }[] = [
    {
      id: 'EXTREME_COLD',
      label: 'EXTREME COLD',
      sublabel: '-35°C | Auto Heater ON',
      icon: <Snowflake className="w-4 h-4" />,
      color: 'text-cyan-300',
      hoverBorder: 'hover:border-cyan-400',
      activeBg: 'bg-cyan-500/20 border-cyan-400 shadow-hud-glow'
    },
    {
      id: 'LOW_PRESSURE',
      label: 'LOW PRESSURE',
      sublabel: '44 kPa | High Pass (5.8k m)',
      icon: <Wind className="w-4 h-4" />,
      color: 'text-sky-300',
      hoverBorder: 'hover:border-sky-400',
      activeBg: 'bg-sky-500/20 border-sky-400 shadow-hud-glow'
    },
    {
      id: 'HIGH_TEMP',
      label: 'HIGH TEMP',
      sublabel: '+58°C | Cooling Fan ON',
      icon: <Flame className="w-4 h-4" />,
      color: 'text-orange-400',
      hoverBorder: 'hover:border-orange-400',
      activeBg: 'bg-orange-500/20 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
    },
    {
      id: 'LOW_BATTERY',
      label: 'LOW BATTERY',
      sublabel: '9.6V | 14% SoC Alert',
      icon: <BatteryLow className="w-4 h-4" />,
      color: 'text-amber-400',
      hoverBorder: 'hover:border-amber-400',
      activeBg: 'bg-amber-500/20 border-amber-400 shadow-hud-glow-amber'
    },
    {
      id: 'OVERCURRENT',
      label: 'OVERCURRENT',
      sublabel: '7.8A | MOSFET Isolation',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-rose-400',
      hoverBorder: 'hover:border-rose-400',
      activeBg: 'bg-rose-500/20 border-rose-400 shadow-hud-glow-red animate-pulse'
    },
    {
      id: 'COMM_FAILURE',
      label: 'COMM FAILURE',
      sublabel: 'LoRa Severed | SD Buffering',
      icon: <RadioOff className="w-4 h-4" />,
      color: 'text-purple-400',
      hoverBorder: 'hover:border-purple-400',
      activeBg: 'bg-purple-500/20 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
    }
  ];

  return (
    <div className="bg-slate-950/90 border-b border-cyan-500/30 px-4 py-2 transition-all">
      {/* Header bar of Demo controller */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-500/40">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-xs font-hud font-bold tracking-widest text-amber-300 uppercase">
              SIH PRESENTATION DEMO SUITE
            </span>
            <span className="hidden md:inline ml-2 text-[10px] font-mono text-slate-400">
              Interactive Extreme Condition Injectors for Universal Smart Module Validation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset button */}
          <button
            onClick={() => triggerScenario('NORMAL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-hud font-semibold transition-all border ${
              activeScenario === 'NORMAL'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-hud-glow-green'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-500/40 hover:text-emerald-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET NOMINAL</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-200"
            title={expanded ? 'Collapse Demo Bar' : 'Expand Demo Bar'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Action Buttons Grid */}
      {expanded && (
        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 animate-in fade-in duration-200">
          {scenarios.map(sc => {
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => triggerScenario(sc.id)}
                className={`p-2 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? sc.activeBg
                    : `bg-slate-900/80 border-slate-800 text-slate-300 ${sc.hoverBorder} hover:bg-slate-800/80`
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`${sc.color} ${isActive ? 'scale-110' : ''} transition-transform`}>
                    {sc.icon}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-ping" />
                  )}
                </div>
                <div className="text-[11px] font-hud font-bold tracking-wider uppercase truncate">
                  {sc.label}
                </div>
                <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                  {sc.sublabel}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
