import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Check,
  AlertTriangle,
  AlertOctagon,
  Info,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../common/StatusBadge';
import { AlertItem, AlertSeverity } from '../../types/telemetry';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    clearAlert,
    clearAllAlerts,
    audioAlarmEnabled,
    setAudioAlarmEnabled
  } = useTelemetry();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchSev = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchEq = equipmentFilter === 'ALL' || (alert.equipment && alert.equipment.toLowerCase() === equipmentFilter.toLowerCase());
      return matchSev && matchEq;
    });
  }, [alerts, severityFilter, equipmentFilter]);

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Alert Counts and Bulk Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-hud font-bold tracking-widest text-white uppercase">
              DEFENCE ALERT CENTER & FAULT ARBITRATION
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300 max-w-xl">
            Real-time critical faults, telemetry warnings, and hardware events logged by the universal rule-based protection engine.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Audio Siren Toggle */}
          <button
            onClick={() => setAudioAlarmEnabled(!audioAlarmEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-hud font-semibold flex items-center gap-2 border transition-all ${
              audioAlarmEnabled
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-hud-glow-red'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {audioAlarmEnabled ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{audioAlarmEnabled ? 'SIREN ARMED' : 'SIREN MUTED'}</span>
          </button>

          {/* Bulk Acknowledge */}
          <button
            onClick={acknowledgeAllAlerts}
            disabled={unacknowledgedCount === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
              unacknowledgedCount > 0
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 shadow-hud-glow'
                : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>ACKNOWLEDGE ALL ({unacknowledgedCount})</span>
          </button>

          {/* Bulk Clear */}
          <button
            onClick={clearAllAlerts}
            disabled={alerts.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-hud font-semibold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
              alerts.length > 0
                ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-300'
                : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>CLEAR ALL</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">UNACKNOWLEDGED</span>
          <div className="text-2xl font-tech font-bold text-amber-300">
            {unacknowledgedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-rose-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">CRITICAL ALERTS</span>
          <div className="text-2xl font-tech font-bold text-rose-400">
            {criticalCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-amber-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">WARNING ALERTS</span>
          <div className="text-2xl font-tech font-bold text-amber-400">
            {warningCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">TOTAL LOGGED</span>
          <div className="text-2xl font-tech font-bold text-cyan-400">
            {alerts.length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 font-mono text-xs w-full sm:w-auto">
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-hud-glow'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Equipment Dropdown Filter */}
        <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto justify-end">
          <span className="text-slate-400 text-[11px]">Equipment Filter:</span>
          <select
            value={equipmentFilter}
            onChange={e => setEquipmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">ALL EQUIPMENT</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="drone">DRONE</option>
            <option value="radar">RADAR</option>
            <option value="radio">RADIO</option>
            <option value="computer">COMPUTER</option>
            <option value="battery">BATTERY</option>
          </select>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 font-mono text-xs">
            No active alerts matching the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/40 shadow-hud-glow-red'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-900/80 border-cyan-500/20'
                } ${alert.acknowledged ? 'opacity-70' : 'opacity-100'}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="text-xs font-mono font-bold text-slate-400">
                        [{alert.timestamp}]
                      </span>
                      {alert.equipment && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 uppercase">
                          {alert.equipment}
                        </span>
                      )}
                      {alert.acknowledged && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-hud font-bold text-slate-100 uppercase">
                      {alert.title}
                    </h4>
                    <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Actions per alert */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ACK</span>
                    </button>
                  )}

                  <button
                    onClick={() => clearAlert(alert.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                    title="Clear Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
