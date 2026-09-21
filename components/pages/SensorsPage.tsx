import React, { useState } from 'react';
import {
  Thermometer,
  Gauge,
  Droplets,
  Zap,
  Activity,
  TrendingUp,
  Cpu,
  Clock,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { useTelemetry, ChartPoint } from '../../context/TelemetryContext';

interface SensorChartProps {
  title: string;
  data: ChartPoint[];
  dataKey: keyof Omit<ChartPoint, 'time'>;
  unit: string;
  color: string;
  minLimit?: number;
  maxLimit?: number;
  criticalThreshold?: number;
  isLowerCritical?: boolean;
}

const SensorChart: React.FC<SensorChartProps> = ({
  title,
  data,
  dataKey,
  unit,
  color,
  criticalThreshold,
  isLowerCritical = false
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500 font-mono text-xs">Acquiring Telemetry...</div>;
  }

  const values = data.map(d => d[dataKey] as number);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = (rawMax - rawMin) * 0.15 || 1;
  const yMin = rawMin - padding;
  const yMax = rawMax + padding;
  const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

  const width = 500;
  const height = 180;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 28;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Build points
  const points = data.map((d, i) => {
    const val = d[dataKey] as number;
    const x = padLeft + (i / (data.length - 1 || 1)) * chartW;
    const y = padTop + chartH - ((val - yMin) / yRange) * chartH;
    return { x, y, val, time: d.time };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${padLeft + chartW},${padTop + chartH} L ${padLeft},${padTop + chartH} Z`;

  // Latest value
  const latest = values[values.length - 1];

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs font-hud font-bold tracking-wider text-slate-200 uppercase">
            {title}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Current: <span className="font-semibold text-slate-100">{latest.toFixed(1)} {unit}</span>
            {hoverIndex !== null && points[hoverIndex] && (
              <span className="ml-2 text-cyan-300">
                [At {points[hoverIndex].time}: {points[hoverIndex].val.toFixed(1)} {unit}]
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
          <span>Min: {rawMin.toFixed(1)}</span>
          <span className="text-slate-600">|</span>
          <span>Max: {rawMax.toFixed(1)}</span>
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="relative w-full h-44">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
            const y = padTop + chartH * frac;
            const valLabel = (yMax - frac * yRange).toFixed(1);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* Critical Threshold line if present */}
          {criticalThreshold !== undefined && (
            (() => {
              const critY = padTop + chartH - ((criticalThreshold - yMin) / yRange) * chartH;
              if (critY >= padTop && critY <= padTop + chartH) {
                return (
                  <g>
                    <line
                      x1={padLeft}
                      y1={critY}
                      x2={padLeft + chartW}
                      y2={critY}
                      stroke="#ef4444"
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                    />
                    <text
                      x={padLeft + chartW - 5}
                      y={critY - 3}
                      textAnchor="end"
                      fill="#ef4444"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      LIMIT {criticalThreshold}{unit}
                    </text>
                  </g>
                );
              }
              return null;
            })()
          )}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#grad-${dataKey})`} />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />

          {/* Interactive Mouse Hover Circles & Column Tracking */}
          {points.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            const isLast = idx === points.length - 1;

            return (
              <g key={idx}>
                {/* Hit target area */}
                <rect
                  x={p.x - chartW / (points.length * 2)}
                  y={padTop}
                  width={chartW / points.length}
                  height={chartH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(idx)}
                />

                {(isHovered || isLast) && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5 : 3.5}
                    fill={color}
                    stroke="#0b1120"
                    strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                  />
                )}
              </g>
            );
          })}

          {/* Time axis labels */}
          {points.length > 1 && (
            <>
              <text
                x={padLeft}
                y={height - 6}
                textAnchor="start"
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
              >
                {points[0].time}
              </text>
              <text
                x={padLeft + chartW / 2}
                y={height - 6}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
              >
                {points[Math.floor(points.length / 2)].time}
              </text>
              <text
                x={padLeft + chartW}
                y={height - 6}
                textAnchor="end"
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
              >
                {points[points.length - 1].time} (Live)
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export const SensorsPage: React.FC = () => {
  const {
    sensorData,
    chartHistory,
    timeFilter,
    setTimeFilter,
    dataSource,
    refreshTelemetry
  } = useTelemetry();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header & High-Altitude Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff] animate-pulse" />
            <h2 className="text-base font-hud font-bold tracking-widest text-slate-100 uppercase">
              DETAILED SENSOR TELEMETRY & REAL-TIME TIME-SERIES CHARTS
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Universal Smart Module Primary Sensor Channels: Bosch Sensortec BME280 & Texas Instruments INA219/INA226
          </p>
        </div>

        {/* Prominent Data Source Banner & Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Data Source Notice (Per requirements: clearly show DATA SOURCE: SIMULATED) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40">
            <Cpu className="w-4 h-4 text-amber-400" />
            <div className="text-xs font-hud font-bold uppercase tracking-wider text-amber-300">
              DATA SOURCE: <span className="underline">{dataSource}</span>
            </div>
          </div>

          {/* Time Filters */}
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 font-mono text-xs">
            {(['1H', '6H', '24H', '7D'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  timeFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-hud-glow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={refreshTelemetry}
            title="Force Instant Telemetry Sample"
            className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sensor Channel 1: BME280 Environmental Triad */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30">
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-sm font-hud font-bold tracking-widest text-slate-200 uppercase">
            BME280 CHANNEL (TEMPERATURE, ATMOSPHERIC PRESSURE, HUMIDITY)
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
            I2C Addr: 0x76 | Precision: ±0.5°C, ±1 hPa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SensorChart
            title="Temperature vs Time"
            data={chartHistory}
            dataKey="temperature"
            unit="°C"
            color="#00f0ff"
            criticalThreshold={-20}
            isLowerCritical={true}
          />
          <SensorChart
            title="Atmospheric Pressure vs Time"
            data={chartHistory}
            dataKey="pressure"
            unit="kPa"
            color="#38bdf8"
            criticalThreshold={50}
            isLowerCritical={true}
          />
          <SensorChart
            title="Humidity vs Time"
            data={chartHistory}
            dataKey="humidity"
            unit="%"
            color="#60a5fa"
          />
        </div>
      </div>

      {/* Sensor Channel 2: INA219 / INA226 Electrical Telemetry */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-hud font-bold tracking-widest text-slate-200 uppercase">
            INA219 / INA226 CHANNEL (VOLTAGE, CURRENT, POWER)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
            I2C Addr: 0x40 | Shunt: 0.1Ω | Cutoff: 6.0A
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SensorChart
            title="Voltage vs Time"
            data={chartHistory}
            dataKey="voltage"
            unit="V"
            color="#a78bfa"
            criticalThreshold={10.8}
            isLowerCritical={true}
          />
          <SensorChart
            title="Current vs Time"
            data={chartHistory}
            dataKey="current"
            unit="A"
            color="#f59e0b"
            criticalThreshold={6.0}
            isLowerCritical={false}
          />
          <SensorChart
            title="Power vs Time"
            data={chartHistory}
            dataKey="power"
            unit="W"
            color="#10b981"
          />
        </div>
      </div>

      {/* Sensor Diagnostics Table */}
      <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-slate-200">
              HARDWARE TRANSDUCER CALIBRATION & SAMPLING ENVELOPE
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Sample Frequency: 0.5 Hz (2000ms)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">BME280 TEMP SENSITIVITY</span>
            <span className="text-cyan-300 font-bold">0.01 °C / LSB</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">BAROMETRIC ALTITUDE EQUIV</span>
            <span className="text-sky-300 font-bold">~4,850m AMSL</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">INA219 SHUNT RESOLUTION</span>
            <span className="text-amber-300 font-bold">0.8 mA / LSB</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TOTAL POWER DISSIPATION</span>
            <span className="text-emerald-300 font-bold">{sensorData.power.toFixed(2)} W</span>
          </div>
        </div>
      </div>
    </div>
  );
};
