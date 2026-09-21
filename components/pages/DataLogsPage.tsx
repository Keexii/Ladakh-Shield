import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  HardDrive,
  Calendar,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../common/StatusBadge';
import { HistoricalLogEntry } from '../../types/telemetry';

export const DataLogsPage: React.FC = () => {
  const { historicalLogs, refreshTelemetry } = useTelemetry();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return historicalLogs.filter(log => {
      const matchesSearch =
        log.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.alert.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.timestamp.includes(searchQuery);

      const matchesEquipment =
        selectedEquipment === 'ALL' || log.equipment.toLowerCase() === selectedEquipment.toLowerCase();

      const matchesStatus =
        selectedStatus === 'ALL' || log.status === selectedStatus;

      return matchesSearch && matchesEquipment && matchesStatus;
    });
  }, [historicalLogs, searchQuery, selectedEquipment, selectedStatus]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Equipment', 'Temperature (C)', 'Pressure (kPa)', 'Humidity (%)', 'Voltage (V)', 'Current (A)', 'Power (W)', 'Health (%)', 'Status', 'Alert'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.equipment}"`,
      l.temperature,
      l.pressure,
      l.humidity,
      l.voltage,
      l.current,
      l.power,
      l.health,
      `"${l.status}"`,
      `"${l.alert.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ladakh_shield_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download JSON Dump Handler
  const handleDownloadJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredLogs, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `ladakh_shield_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & SD Card Capacity Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Title */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-hud font-bold tracking-widest text-white uppercase">
                HISTORICAL TELEMETRY & FAULT LOGGING
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-300 max-w-xl">
              High-altitude flight, surveillance, and battery telemetry logs with sub-second timestamps, sensor readings, electrical draw, and autonomous protection records.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-2 shadow-hud-glow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-hud font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              <span>DOWNLOAD JSON DUMP</span>
            </button>
          </div>
        </div>

        {/* SD Card Storage Gauge */}
        <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-hud font-bold uppercase tracking-wider text-slate-200">
                SD CARD OFFLINE STORAGE
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              MOUNTED OK
            </span>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-tech font-bold text-slate-100">14.8 GB</span>
              <span className="text-xs text-slate-400">/ 32.0 GB Used</span>
            </div>

            {/* Storage bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                style={{ width: '46.25%' }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Write Cycles: Nominal</span>
              <span className="text-cyan-400">17.2 GB Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, alert descriptions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
          {/* Equipment Filter */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Subsystem:</span>
            <select
              value={selectedEquipment}
              onChange={e => setSelectedEquipment(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">ALL EQUIPMENT</option>
              <option value="DRONE">DRONE</option>
              <option value="RADAR">RADAR</option>
              <option value="RADIO">RADIO</option>
              <option value="COMPUTER">COMPUTER</option>
              <option value="BATTERY">BATTERY</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="NORMAL">NORMAL</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500 ml-2">
            Showing {filteredLogs.length} entries
          </span>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-cyan-500/20 font-hud text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5">TIMESTAMP</th>
                <th className="p-3.5">EQUIPMENT</th>
                <th className="p-3.5">TEMP (°C)</th>
                <th className="p-3.5">PRESSURE (kPa)</th>
                <th className="p-3.5">HUMIDITY (%)</th>
                <th className="p-3.5">VOLTAGE (V)</th>
                <th className="p-3.5">CURRENT (A)</th>
                <th className="p-3.5">POWER (W)</th>
                <th className="p-3.5">HEALTH</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">ALERT / EVENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    No matching telemetry logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3.5 font-bold text-cyan-300 whitespace-nowrap">{log.equipment}</td>
                    <td className="p-3.5 whitespace-nowrap">{log.temperature.toFixed(1)}</td>
                    <td className="p-3.5 whitespace-nowrap">{log.pressure.toFixed(1)}</td>
                    <td className="p-3.5 whitespace-nowrap">{log.humidity.toFixed(1)}</td>
                    <td className="p-3.5 text-cyan-400 whitespace-nowrap">{log.voltage.toFixed(2)}</td>
                    <td className="p-3.5 text-sky-400 whitespace-nowrap">{log.current.toFixed(2)}</td>
                    <td className="p-3.5 text-emerald-400 font-bold whitespace-nowrap">{log.power.toFixed(2)}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={log.health < 60 ? 'text-rose-400' : 'text-emerald-400'}>
                        {log.health}%
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={log.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate">{log.alert}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
