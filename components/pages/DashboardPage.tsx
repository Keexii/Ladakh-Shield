import React from 'react';
import {
  Thermometer,
  Gauge,
  Droplets,
  Zap,
  Battery,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plane,
  RadioTower,
  Radio,
  Cpu,
  BatteryCharging,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertOctagon,
  HardDrive
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { GaugeMetric } from '../common/GaugeMetric';
import { MiniSparkline } from '../common/MiniSparkline';
import { StatusBadge } from '../common/StatusBadge';
import { EquipmentItem } from '../../types/telemetry';

export const DashboardPage: React.FC = () => {
  const {
    sensorData,
    equipment,
    subsystems,
    risk,
    chartHistory,
    setSelectedEquipment,
    setActiveTab
  } = useTelemetry();

  // Extract sparkline arrays from recent chart history
  const voltageTrend = chartHistory.map(p => p.voltage);
  const currentTrend = chartHistory.map(p => p.current);
  const powerTrend = chartHistory.map(p => p.power);

  const getEquipmentIcon = (id: string) => {
    switch (id) {
      case 'drone':
        return <Plane className="w-5 h-5 text-cyan-400" />;
      case 'radar':
        return <RadioTower className="w-5 h-5 text-cyan-400" />;
      case 'radio':
        return <Radio className="w-5 h-5 text-cyan-400" />;
      case 'computer':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'battery':
        return <BatteryCharging className="w-5 h-5 text-cyan-400" />;
      default:
        return <Activity className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP SECTION: ENVIRONMENT MONITORING (BME280) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <h2 className="text-sm font-hud font-bold tracking-widest text-slate-200 uppercase">
              1. ENVIRONMENT MONITORING (BME280 SENSOR ARRAY)
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-500/20">
            HIGH ALTITUDE LADAKH SPEC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Temperature */}
          <GaugeMetric
            label="Ambient Temperature"
            sublabel="BME280 Sub-Zero Metric"
            value={sensorData.temperature}
            unit="°C"
            min={-50}
            max={60}
            criticalLow={-30}
            warningLow={-20}
            warningHigh={45}
            criticalHigh={55}
            icon={<Thermometer className="w-4 h-4 text-cyan-400" />}
          />

          {/* Atmospheric Pressure */}
          <GaugeMetric
            label="Atmospheric Pressure"
            sublabel="Ladakh ~4,850m Barometric"
            value={sensorData.pressure}
            unit="kPa"
            min={30}
            max={110}
            criticalLow={45}
            warningLow={52}
            icon={<Gauge className="w-4 h-4 text-sky-400" />}
          />

          {/* Relative Humidity */}
          <GaugeMetric
            label="Enclosure Humidity"
            sublabel="High Altitude Arid Environment"
            value={sensorData.humidity}
            unit="%"
            min={0}
            max={100}
            warningHigh={85}
            icon={<Droplets className="w-4 h-4 text-blue-400" />}
          />
        </div>
      </div>

      {/* 2. POWER MONITORING (INA219 / INA226) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <h2 className="text-sm font-hud font-bold tracking-widest text-slate-200 uppercase">
              2. POWER MONITORING (INA219 / INA226 DIGITAL COULOMB COUNTER)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            P = V × I (Dynamic Computation)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Voltage */}
          <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-hud font-semibold text-slate-300">VOLTAGE</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">BUS RAIL</span>
            </div>
            <div className="text-2xl font-tech font-bold text-cyan-400">
              {sensorData.voltage.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">V</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">Trend</span>
              <MiniSparkline data={voltageTrend} color="#00f0ff" width={90} height={24} />
            </div>
          </div>

          {/* Current */}
          <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-hud font-semibold text-slate-300">CURRENT</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">SHUNT</span>
            </div>
            <div className={`text-2xl font-tech font-bold ${sensorData.current >= 6.0 ? 'text-rose-400 animate-pulse' : sensorData.current >= 4.5 ? 'text-amber-400' : 'text-sky-400'}`}>
              {sensorData.current.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">A</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">Trend</span>
              <MiniSparkline data={currentTrend} color="#38bdf8" width={90} height={24} />
            </div>
          </div>

          {/* Calculated Power */}
          <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-hud font-semibold text-slate-300">TOTAL POWER</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80 font-bold">V × I</span>
            </div>
            <div className="text-2xl font-tech font-bold text-emerald-400">
              {sensorData.power.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">W</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">Trend</span>
              <MiniSparkline data={powerTrend} color="#10b981" width={90} height={24} />
            </div>
          </div>

          {/* Battery Health */}
          <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-hud font-semibold text-slate-300">BATTERY HEALTH</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">SoC</span>
            </div>
            <div className={`text-2xl font-tech font-bold ${sensorData.batteryHealth < 20 ? 'text-rose-400' : sensorData.batteryHealth < 50 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {sensorData.batteryHealth}
              <span className="text-xs font-normal text-slate-400 ml-1">%</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${sensorData.batteryHealth}%` }}
                />
              </div>
            </div>
          </div>

          {/* Battery Remaining Time */}
          <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-hud font-semibold text-slate-300">EST. RUNTIME</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Ah/I</span>
            </div>
            <div className="text-2xl font-tech font-bold text-amber-300 tracking-wider">
              {sensorData.batteryRemainingTime}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">Continuous Run</span>
              <span className="text-[10px] font-mono text-amber-400/80">Discharging</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EQUIPMENT HEALTH CARDS (5 Universal Subsystems) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <h2 className="text-sm font-hud font-bold tracking-widest text-slate-200 uppercase">
              3. UNIVERSAL MODULE: MONITORED EQUIPMENT (CLICK TO INSPECT)
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('equipment')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            Detailed View ➔
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {equipment.map((item: EquipmentItem) => {
            const isClickable = true;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedEquipment(item)}
                className="group p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/60 hover:shadow-hud-glow transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                      {getEquipmentIcon(item.id)}
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-hud font-bold uppercase tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </h3>
                  <div className="text-[10px] font-mono text-slate-400 truncate mb-3">
                    {item.category}
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-1.5 font-mono text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Temp:</span>
                      <span className="font-semibold text-slate-200">{item.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Voltage:</span>
                      <span className="font-semibold text-cyan-300">{item.voltage.toFixed(2)}V</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Current:</span>
                      <span className="font-semibold text-sky-300">{item.current.toFixed(2)}A</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Health:</span>
                      <span className={`font-semibold ${item.health < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.health}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Updated: {item.lastUpdate}</span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">Details ➔</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 & 5. LOWER SPLIT: RISK ANALYSIS ENGINE & SUBSYSTEM HEALTH CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Analysis Engine (2 columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-hud font-bold tracking-widest text-slate-100 uppercase">
                    RULE-BASED RISK ANALYSIS ENGINE
                  </h3>
                  <div className="text-[10px] font-mono text-slate-400">
                    Deterministic High-Altitude Electronic Health & Protection Decision Matrix
                  </div>
                </div>
              </div>

              <StatusBadge
                status={risk.level}
                label={`RISK: ${risk.level}`}
                size="md"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Reason */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs font-hud font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>CURRENT RISK REASON</span>
                </div>
                <p className="text-xs font-mono text-slate-200 leading-relaxed">
                  {risk.reason}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs font-hud font-semibold text-cyan-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RECOMMENDED ACTION</span>
                </div>
                <p className="text-xs font-mono text-cyan-200 leading-relaxed">
                  {risk.recommendedAction}
                </p>
              </div>
            </div>

            {/* Active Trigger Rules List */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                ACTIVE EVALUATION ENVELOPES:
              </div>
              <div className="flex flex-wrap gap-2">
                {risk.activeRules.map((rule, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-cyan-300 border border-slate-700/80"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Deterministic Logic | No Black-Box AI Hallucination</span>
            <span className="text-cyan-400">Cycle Time: 2000 ms</span>
          </div>
        </div>

        {/* Overall System Subsystems Checklist (1 column) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-hud font-bold tracking-widest text-slate-100 uppercase">
                  SUBSYSTEM INTEGRITY
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">6 CHANNELS</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Power System</span>
                <StatusBadge status={subsystems.powerSystem} size="sm" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Sensor Array (BME280/INA)</span>
                <StatusBadge status={subsystems.sensorArray} size="sm" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">LoRa SX1278 Comms</span>
                <StatusBadge status={subsystems.communication} size="sm" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">SD Card Flash Storage</span>
                <StatusBadge status={subsystems.dataStorage} size="sm" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Thermal Management</span>
                <StatusBadge status={subsystems.thermalManagement} size="sm" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">MOSFET Protection Rail</span>
                <StatusBadge status={subsystems.protectionSystem} size="sm" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/20 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">OVERALL STATUS</div>
            <div className={`text-base font-hud font-bold tracking-widest ${
              subsystems.overall === 'SYSTEM OPERATIONAL'
                ? 'text-emerald-400 glow-text-green'
                : subsystems.overall === 'DEGRADED PERFORMANCE'
                ? 'text-amber-400 glow-text-amber'
                : 'text-rose-400 glow-text-red'
            }`}>
              {subsystems.overall}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
