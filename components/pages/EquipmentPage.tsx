import React from 'react';
import {
  Plane,
  RadioTower,
  Radio,
  Cpu,
  BatteryCharging,
  Sliders,
  ExternalLink,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../common/StatusBadge';
import { EquipmentItem } from '../../types/telemetry';

export const EquipmentPage: React.FC = () => {
  const {
    equipment,
    sensorData,
    setSelectedEquipment,
    protection
  } = useTelemetry();

  const getEquipmentIcon = (id: string) => {
    switch (id) {
      case 'drone':
        return <Plane className="w-6 h-6 text-cyan-400" />;
      case 'radar':
        return <RadioTower className="w-6 h-6 text-cyan-400" />;
      case 'radio':
        return <Radio className="w-6 h-6 text-cyan-400" />;
      case 'computer':
        return <Cpu className="w-6 h-6 text-cyan-400" />;
      case 'battery':
        return <BatteryCharging className="w-6 h-6 text-cyan-400" />;
      default:
        return <Activity className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Architecture Concept Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-blue-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-hud font-bold tracking-widest text-white uppercase">
              UNIVERSAL SMART MODULE ARCHITECTURE
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300 max-w-2xl leading-relaxed">
            One standardized defence-grade monitoring module dynamically adapts to 5 high-altitude systems. Senses thermal, electrical, and barometric telemetry; executes local rule-based safety arbitration; safeguards mission capability.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-cyan-500/20 font-mono text-xs">
          <span className="text-slate-400">ACTIVE NODES:</span>
          <span className="font-bold text-cyan-300">5 / 5 CONNECTED</span>
        </div>
      </div>

      {/* Equipment Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {equipment.map((item: EquipmentItem) => {
          return (
            <div
              key={item.id}
              onClick={() => setSelectedEquipment(item)}
              className="group p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-hud-glow transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-cyan-500/15">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      {getEquipmentIcon(item.id)}
                    </div>
                    <div>
                      <h3 className="text-base font-hud font-bold uppercase tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </h3>
                      <div className="text-[11px] font-mono text-cyan-400/80 font-medium">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={item.status} size="md" />
                </div>

                {/* Operating Status Strip */}
                <div className="mb-4 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="font-semibold text-slate-200 truncate ml-2">
                    {item.operatingStatus}
                  </span>
                </div>

                {/* Standard Telemetry Gauges */}
                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs mb-4">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Core Temp</span>
                    <span className="text-sm font-bold text-slate-100 mt-1">
                      {item.temperature.toFixed(1)}°C
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Bus Voltage</span>
                    <span className="text-sm font-bold text-cyan-300 mt-1">
                      {item.voltage.toFixed(2)} V
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Load Current</span>
                    <span className="text-sm font-bold text-sky-300 mt-1">
                      {item.current.toFixed(2)} A
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Health Index</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-bold ${item.health < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.health}%
                      </span>
                      <div className="w-10 bg-slate-800 rounded-full h-1.5 overflow-hidden ml-2">
                        <div
                          className={`h-full rounded-full ${item.health < 60 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                          style={{ width: `${item.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subsystem-Specific Parameters */}
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1.5 font-mono text-xs mb-3">
                  <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-slate-400 mb-1">
                    EQUIPMENT-SPECIFIC CHANNELS:
                  </div>
                  {item.parameters.map((param, pIdx) => (
                    <div key={pIdx} className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">{param.label}:</span>
                      <span className="font-semibold text-slate-200">
                        {param.value} {param.unit || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px]">Sync: {item.lastUpdate}</span>
                <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 font-semibold">
                  Inspect Diagnostics <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
