import React, { useState, useEffect } from 'react';
import { Shield, Radio, Volume2, VolumeX, Cpu, Activity, Clock, Calendar } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../common/StatusBadge';

export const Header: React.FC = () => {
  const {
    subsystems,
    communication,
    dataSource,
    setDataSource,
    audioAlarmEnabled,
    setAudioAlarmEnabled,
    activeScenario
  } = useTelemetry();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-ladakh-surface/95 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-6 py-3 sticky top-0 z-40">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding & Cockpit Title */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-400/40 shadow-hud-glow">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-hud font-bold tracking-widest text-white glow-text-cyan">
                LADAKH-SHIELD
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v2.3.7
              </span>
            </div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <span>HIGH-ALTITUDE ELECTRONIC SYSTEM MONITORING</span>
              <span className="hidden sm:inline text-cyan-500/40">|</span>
              <span className="hidden sm:inline text-cyan-400/80 font-semibold">SECTOR ALPHA (4850M)</span>
            </div>
          </div>
        </div>

        {/* Center: System Status & LoRa Link */}
        <div className="flex items-center flex-wrap gap-2.5 justify-center">
          {/* Overall Health */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Activity className="w-4 h-4 text-slate-400" />
            <div className="text-[10px] font-mono text-slate-400 uppercase">SYS STATUS:</div>
            <StatusBadge
              status={
                subsystems.overall === 'SYSTEM OPERATIONAL'
                  ? 'NORMAL'
                  : subsystems.overall === 'DEGRADED PERFORMANCE'
                  ? 'WARNING'
                  : 'CRITICAL'
              }
              label={subsystems.overall}
              size="sm"
            />
          </div>

          {/* LoRa Wireless Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Radio className={`w-4 h-4 ${communication.loraConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
            <div className="text-[10px] font-mono text-slate-400 uppercase">LoRa SX1278:</div>
            <StatusBadge
              status={communication.loraConnected ? 'NORMAL' : 'CRITICAL'}
              label={communication.loraConnected ? `${communication.rssi} dBm` : 'OFFLINE'}
              size="sm"
            />
          </div>

          {/* Data Source Badge with Quick Switch */}
          <button
            onClick={() => setDataSource(dataSource === 'SIMULATED' ? 'LIVE_HARDWARE' : 'SIMULATED')}
            title="Click to toggle Data Source"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer group"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <div className="text-[10px] font-mono text-slate-400 uppercase">SOURCE:</div>
            <span className={`text-[11px] font-hud font-bold tracking-wider ${dataSource === 'SIMULATED' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {dataSource}
            </span>
          </button>
        </div>

        {/* Right: Date, Time & Acoustic Alarm Control */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Audio Buzzer Alarm Toggle */}
          <button
            onClick={() => setAudioAlarmEnabled(!audioAlarmEnabled)}
            title={audioAlarmEnabled ? 'Acoustic Defense Siren: ENABLED' : 'Acoustic Defense Siren: MUTED'}
            className={`p-2 rounded-lg border transition-all ${
              audioAlarmEnabled
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-hud-glow-red'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {audioAlarmEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Real-time Clock */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
              <Calendar className="w-3.5 h-3.5 text-cyan-500" />
              <span>{currentDate}</span>
            </div>
            <div className="hidden sm:inline text-slate-700">|</div>
            <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{currentTime}</span>
              <span className="text-[9px] text-cyan-500/80">IST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Demo Banner warning indicator if in non-nominal scenario */}
      {activeScenario !== 'NORMAL' && (
        <div className="mt-2 py-1 px-3 bg-amber-500/15 border border-amber-500/40 rounded-lg flex items-center justify-between animate-pulse-slow">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold uppercase tracking-wider">DEMO INJECTION ACTIVE:</span>
            <span>{activeScenario.replace('_', ' ')} SCENARIO RUNNING</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400/80">
            Universal Smart Module reacting in real-time
          </span>
        </div>
      )}
    </header>
  );
};
