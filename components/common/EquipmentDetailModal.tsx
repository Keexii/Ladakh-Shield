import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Fan,
  Zap,
  RotateCw,
  Cpu,
  Plane,
  RadioTower,
  Radio,
  BatteryCharging,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from './StatusBadge';
import { Modal } from './Modal';

export const EquipmentDetailModal: React.FC = () => {
  const { selectedEquipment, setSelectedEquipment } = useTelemetry();
  const [testingInProgress, setTestingInProgress] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!selectedEquipment) return null;

  const handleRunSelfTest = () => {
    setTestingInProgress(true);
    setTestResult(null);
    setTimeout(() => {
      setTestingInProgress(false);
      setTestResult('Built-In-Test (BIT) Passed: All internal sensors, MOSFET drive gates, and telemetry registers verified nominal.');
    }, 1200);
  };

  const getIcon = (id: string) => {
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
    <Modal
      isOpen={!!selectedEquipment}
      onClose={() => {
        setSelectedEquipment(null);
        setTestResult(null);
      }}
      title={`${selectedEquipment.name} Telemetry Drill-Down`}
      subtitle={`Universal Smart Module Node ID: MOD-${selectedEquipment.id.toUpperCase()}-01`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              {getIcon(selectedEquipment.id)}
            </div>
            <div>
              <h4 className="text-base font-hud font-bold text-white uppercase">
                {selectedEquipment.name}
              </h4>
              <p className="text-xs font-mono text-cyan-400/80">
                {selectedEquipment.category}
              </p>
            </div>
          </div>
          <StatusBadge status={selectedEquipment.status} size="lg" />
        </div>

        {/* Operating status banner */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono flex items-center justify-between">
          <span className="text-slate-400">OPERATIONAL MODE:</span>
          <span className="font-semibold text-cyan-300">{selectedEquipment.operatingStatus}</span>
        </div>

        {/* 4 Primary Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">TEMPERATURE</span>
            <span className="text-lg font-tech font-bold text-slate-100 mt-1 block">
              {selectedEquipment.temperature.toFixed(1)}°C
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">VOLTAGE</span>
            <span className="text-lg font-tech font-bold text-cyan-300 mt-1 block">
              {selectedEquipment.voltage.toFixed(2)} V
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">CURRENT</span>
            <span className="text-lg font-tech font-bold text-sky-300 mt-1 block">
              {selectedEquipment.current.toFixed(2)} A
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">HEALTH INDEX</span>
            <span className={`text-lg font-tech font-bold mt-1 block ${
              selectedEquipment.health < 60 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {selectedEquipment.health}%
            </span>
          </div>
        </div>

        {/* Equipment Specific Sensor Parameters */}
        <div>
          <h5 className="text-xs font-hud font-bold uppercase tracking-wider text-slate-300 mb-2">
            SUBSYSTEM-SPECIFIC TELEMETRY CHANNELS
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
            {selectedEquipment.parameters.map((param, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between"
              >
                <span className="text-slate-400">{param.label}:</span>
                <span className="font-bold text-slate-200">
                  {param.value} {param.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Specifications */}
        <div>
          <h5 className="text-xs font-hud font-bold uppercase tracking-wider text-slate-300 mb-2">
            HIGH-ALTITUDE DEFENCE HARDWARE RATINGS
          </h5>
          <div className="space-y-1.5 font-mono text-xs p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Thermal Envelope:</span>
              <span>{selectedEquipment.specifications.operatingTempRange}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Nominal Voltage:</span>
              <span>{selectedEquipment.specifications.nominalVoltage}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Max Current Load:</span>
              <span>{selectedEquipment.specifications.maxCurrentDraw}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Ladakh Altitude Rating:</span>
              <span className="text-cyan-300">{selectedEquipment.specifications.highAltitudeRating}</span>
            </div>
          </div>
        </div>

        {/* Test Result Message if run */}
        {testResult && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{testResult}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between gap-3">
          <button
            onClick={handleRunSelfTest}
            disabled={testingInProgress}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${testingInProgress ? 'animate-spin' : ''}`} />
            <span>{testingInProgress ? 'Running Built-in Test...' : 'Run BIT Diagnostic'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedEquipment(null);
              setTestResult(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-hud font-semibold uppercase tracking-wider transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Modal>
  );
};
