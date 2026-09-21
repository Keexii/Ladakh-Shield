import React, { useState } from 'react';
import {
  Flame,
  Fan,
  Zap,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Modal } from '../common/Modal';

export const ProtectionPage: React.FC = () => {
  const {
    protection,
    toggleHeater,
    setHeaterMode,
    toggleCoolingFan,
    setCoolingFanMode,
    resetMosfet,
    setMosfetMode,
    engageEmergencyMode,
    disengageEmergencyMode,
    sensorData
  } = useTelemetry();

  const [confirmEmergencyModal, setConfirmEmergencyModal] = useState<boolean>(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-hud font-bold tracking-widest text-white uppercase">
              ADAPTIVE HARDWARE PROTECTION & RELAY MATRIX
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300 max-w-2xl leading-relaxed">
            Automatic environmental arbitration protects solid-state electronics against Ladakh's sub-zero freezes (-40°C), thermal runaway, and electrical overcurrent surges.
          </p>
        </div>

        {/* Emergency Mode Trigger Button */}
        <div>
          {protection.emergencyMode ? (
            <button
              onClick={disengageEmergencyMode}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-2 shadow-hud-glow-green"
            >
              <CheckCircle className="w-4 h-4" />
              <span>DISENGAGE EMERGENCY MODE</span>
            </button>
          ) : (
            <button
              onClick={() => setConfirmEmergencyModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-2 shadow-hud-glow-red animate-pulse"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>ENGAGE EMERGENCY MODE</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Core Adaptive Hardware Protections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. PTC HEATER PAD */}
        <div className={`p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border transition-all duration-300 flex flex-col justify-between ${
          protection.heater.status ? 'border-amber-500/40 shadow-hud-glow-amber' : 'border-cyan-500/20'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/15">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  protection.heater.status
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-hud font-bold uppercase tracking-wider text-slate-100">
                    PTC HEATER PAD
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">Cold Protection Subsystem</div>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-xs font-hud font-bold px-2.5 py-1 rounded-md uppercase border ${
                protection.heater.status
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {protection.heater.status ? `ON (${protection.heater.powerPercentage}%)` : 'STANDBY (OFF)'}
              </span>
            </div>

            {/* Mode & Reason */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">CONTROL MODE:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setHeaterMode('AUTO')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      protection.heater.mode === 'AUTO'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    AUTO
                  </button>
                  <button
                    onClick={() => setHeaterMode('MANUAL')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      protection.heater.mode === 'MANUAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    MANUAL
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">TRIGGER REASON:</span>
                <p className="text-slate-200">{protection.heater.reason}</p>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">LAST ACTIVATION:</span>
                <span className="text-slate-300">{protection.heater.lastActivation}</span>
              </div>
            </div>
          </div>

          {/* Action toggle button */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Threshold: &lt; -20.0°C
            </span>
            <button
              onClick={toggleHeater}
              disabled={protection.heater.mode === 'AUTO'}
              className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all border ${
                protection.heater.mode === 'AUTO'
                  ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                  : protection.heater.status
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {protection.heater.status ? 'Force Heater OFF' : 'Force Heater ON'}
            </button>
          </div>
        </div>

        {/* 2. COOLING FAN */}
        <div className={`p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border transition-all duration-300 flex flex-col justify-between ${
          protection.coolingFan.status ? 'border-cyan-400/40 shadow-hud-glow' : 'border-cyan-500/20'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/15">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  protection.coolingFan.status
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  <Fan className={`w-6 h-6 ${protection.coolingFan.status ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-base font-hud font-bold uppercase tracking-wider text-slate-100">
                    COOLING FAN
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">Thermal Protection Subsystem</div>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-xs font-hud font-bold px-2.5 py-1 rounded-md uppercase border ${
                protection.coolingFan.status
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {protection.coolingFan.status ? `ON (${protection.coolingFan.rpm} RPM)` : 'STANDBY (OFF)'}
              </span>
            </div>

            {/* Mode & Reason */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">CONTROL MODE:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCoolingFanMode('AUTO')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      protection.coolingFan.mode === 'AUTO'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    AUTO
                  </button>
                  <button
                    onClick={() => setCoolingFanMode('MANUAL')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      protection.coolingFan.mode === 'MANUAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    MANUAL
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">TRIGGER REASON:</span>
                <p className="text-slate-200">{protection.coolingFan.reason}</p>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">LAST ACTIVATION:</span>
                <span className="text-slate-300">{protection.coolingFan.lastActivation}</span>
              </div>
            </div>
          </div>

          {/* Action toggle button */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Threshold: &gt; 45.0°C
            </span>
            <button
              onClick={toggleCoolingFan}
              disabled={protection.coolingFan.mode === 'AUTO'}
              className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all border ${
                protection.coolingFan.mode === 'AUTO'
                  ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                  : protection.coolingFan.status
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
              }`}
            >
              {protection.coolingFan.status ? 'Force Fan OFF' : 'Force Fan ON'}
            </button>
          </div>
        </div>

        {/* 3. SOLID-STATE MOSFET POWER PROTECTION */}
        <div className={`p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border transition-all duration-300 flex flex-col justify-between ${
          protection.powerProtection.tripped ? 'border-rose-500/50 shadow-hud-glow-red animate-pulse' : 'border-cyan-500/20'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/15">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  protection.powerProtection.tripped
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-hud font-bold uppercase tracking-wider text-slate-100">
                    MOSFET POWER RAIL
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">Overcurrent Isolation Subsystem</div>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-xs font-hud font-bold px-2.5 py-1 rounded-md uppercase border ${
                protection.powerProtection.tripped
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-hud-glow-red'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {protection.powerProtection.tripped ? 'TRIPPED (ISOLATED)' : 'ARMED (CLOSED)'}
              </span>
            </div>

            {/* Mode & Reason */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">CONTROL MODE:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMosfetMode('AUTO')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      protection.powerProtection.mode === 'AUTO'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    AUTO
                  </button>
                  <button
                    onClick={() => setMosfetMode('MANUAL')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      protection.powerProtection.mode === 'MANUAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    MANUAL
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">TRIGGER REASON:</span>
                <p className="text-slate-200">{protection.powerProtection.reason}</p>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">LAST ACTIVATION:</span>
                <span className="text-slate-300">{protection.powerProtection.lastActivation}</span>
              </div>
            </div>
          </div>

          {/* Action reset button */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Trip Threshold: 6.0 A
            </span>
            <button
              onClick={resetMosfet}
              disabled={!protection.powerProtection.tripped}
              className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                !protection.powerProtection.tripped
                  ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Re-Arm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Warning Panel */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300 uppercase block font-hud mb-0.5">
            HIGH-ALTITUDE DEFENCE SAFETY PROTOCOL:
          </span>
          Manual override of thermal heaters and cooling fans will bypass the automatic hysteresis safeguards. In extreme Ladakh sub-zero weather, disabling the heater pad for extended periods may cause irreversible electrolyte freezing in lithium-ion cells.
        </div>
      </div>

      {/* Safety Confirmation Modal for Emergency Mode */}
      <Modal
        isOpen={confirmEmergencyModal}
        onClose={() => setConfirmEmergencyModal(false)}
        title="CONFIRM EMERGENCY MODE ENGAGEMENT"
        subtitle="Defence Sector Alpha Protocol 99"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-mono text-rose-200 leading-relaxed flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase block text-sm font-hud mb-1 text-rose-300">
                CRITICAL WARNING: TOTAL LOAD SHED
              </span>
              Engaging Tactical Emergency Mode will immediately shed all non-vital auxiliary loads, isolate secondary electronic buses, and sound local acoustic beacons.
            </div>
          </div>

          <p className="text-xs font-mono text-slate-400">
            Telemetry will remain active on LoRa SX1278 and local SD Card buffer. Do you wish to proceed?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setConfirmEmergencyModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-hud font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                engageEmergencyMode();
                setConfirmEmergencyModal(false);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-hud font-bold uppercase tracking-wider shadow-hud-glow-red"
            >
              Confirm Emergency Shed
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
