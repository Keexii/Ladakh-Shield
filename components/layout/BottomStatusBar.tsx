import React from 'react';
import { MapPin, Mountain, HardDrive, ShieldCheck, Terminal, Cpu } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export const BottomStatusBar: React.FC = () => {
  const { dataSource } = useTelemetry();

  return (
    <footer className="w-full bg-ladakh-darkest border-t border-cyan-500/20 px-4 py-2 text-xs font-mono text-slate-400 z-30">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Left: Tactical Location & Mountain Altitude */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">LOCATION:</span>
            <span className="font-semibold text-slate-200">High Altitude Area (Ladakh Border Post)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Mountain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">ALTITUDE:</span>
            <span className="font-semibold text-cyan-300">4,850 m AMSL</span>
          </div>
        </div>

        {/* Center: Device ID & Firmware */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">DEVICE ID:</span>
            <span className="font-semibold text-slate-300 tracking-wider">LSH-24-05-0017</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">FIRMWARE:</span>
            <span className="font-semibold text-slate-300">v2.3.7-LDK</span>
          </div>
        </div>

        {/* Right: Data Source & Defence Security Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-500">DATA SOURCE:</span>
            <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
              dataSource === 'SIMULATED' ? 'text-amber-300 bg-amber-500/10' : 'text-emerald-300 bg-emerald-500/10'
            }`}>
              {dataSource}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-slate-500">SECURITY:</span>
            <span className="font-bold tracking-wider">SECURE (AES-256)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
