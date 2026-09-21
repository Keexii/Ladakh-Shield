import React from 'react';
import {
  LayoutDashboard,
  Gauge,
  Cpu,
  Radio,
  ShieldCheck,
  FileText,
  Bell,
  Settings,
  Flame,
  Fan,
  Zap
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, protection } = useTelemetry();

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sensors', label: 'Sensors', icon: Gauge },
    { id: 'equipment', label: 'Equipment', icon: Cpu },
    { id: 'communication', label: 'Communication', icon: Radio },
    { id: 'protection', label: 'Protection', icon: ShieldCheck },
    { id: 'logs', label: 'Data Logs', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unacknowledgedAlerts },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-full md:w-64 bg-ladakh-surface/90 border-r border-cyan-500/20 flex flex-col justify-between shrink-0">
      {/* Navigation List */}
      <div className="p-3 lg:p-4 space-y-1.5">
        <div className="px-3 py-1.5 text-[10px] font-hud font-bold uppercase tracking-widest text-slate-500">
          OPERATIONAL COCKPIT
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-hud text-sm font-semibold tracking-wide transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-400/40 shadow-hud-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-hud-glow-red animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Adaptive Hardware Actuator Status Widget */}
      <div className="p-3 lg:p-4 border-t border-cyan-500/20 bg-slate-900/40 m-2 rounded-xl">
        <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
          <span>ACTUATOR STATE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
        </div>

        <div className="space-y-2 text-xs font-mono">
          {/* Heater */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className={`w-3.5 h-3.5 ${protection.heater.status ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
              <span className="text-slate-300">PTC Heater</span>
            </div>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                protection.heater.status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {protection.heater.status ? `${protection.heater.powerPercentage}%` : 'OFF'}
            </span>
          </div>

          {/* Cooling Fan */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Fan className={`w-3.5 h-3.5 ${protection.coolingFan.status ? 'text-cyan-400 animate-spin' : 'text-slate-600'}`} />
              <span className="text-slate-300">Cooling Fan</span>
            </div>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                protection.coolingFan.status
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {protection.coolingFan.status ? `${protection.coolingFan.rpm} RPM` : 'OFF'}
            </span>
          </div>

          {/* MOSFET Power Breaker */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className={`w-3.5 h-3.5 ${protection.powerProtection.tripped ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`} />
              <span className="text-slate-300">MOSFET Rail</span>
            </div>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                protection.powerProtection.tripped
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {protection.powerProtection.tripped ? 'TRIPPED' : 'ARMED'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
