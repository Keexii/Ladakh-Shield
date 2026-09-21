import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Sliders,
  Send,
  CheckCircle2,
  AlertTriangle,
  Code,
  Layers,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export const SettingsPage: React.FC = () => {
  const { dataSource, setDataSource, sensorData } = useTelemetry();

  // Test payload state for manual ESP32 REST API testing
  const [testTemp, setTestTemp] = useState<number>(-22.5);
  const [testPress, setTestPress] = useState<number>(57.8);
  const [testVolt, setTestVolt] = useState<number>(12.2);
  const [testCurr, setTestCurr] = useState<number>(2.4);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Calibration offsets
  const [tempOffset, setTempOffset] = useState<number>(-0.4);
  const [shuntOhm, setShuntOhm] = useState<number>(0.1);
  const [calibSaved, setCalibSaved] = useState<boolean>(false);

  const handleSendTestPayload = async () => {
    setIsSending(true);
    setApiResponse(null);
    try {
      const payload = {
        deviceId: 'LSH-24-05-0017',
        temperature: testTemp,
        pressure: testPress,
        humidity: 19.5,
        voltage: testVolt,
        current: testCurr,
        dataSource: 'LIVE_HARDWARE',
        equipmentId: 'drone'
      };

      const res = await fetch('http://localhost:5000/api/sensor-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setApiResponse(JSON.stringify({ error: 'Failed to connect to local API server on http://localhost:5000', details: (err as Error).message }, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveCalibration = () => {
    setCalibSaved(true);
    setTimeout(() => setCalibSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-hud font-bold tracking-widest text-white uppercase">
              ESP32 INTEGRATION, CALIBRATION & BACKEND CONFIG
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300 max-w-xl">
            Configure REST API endpoints for real ESP32 hardware payloads, inspect MySQL database schema, and fine-tune sensor calibration matrices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDataSource(dataSource === 'SIMULATED' ? 'LIVE_HARDWARE' : 'SIMULATED')}
            className={`px-4 py-2 rounded-xl text-xs font-hud font-bold uppercase tracking-wider border transition-all ${
              dataSource === 'LIVE_HARDWARE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-hud-glow-green'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-hud-glow-amber'
            }`}
          >
            ACTIVE MODE: {dataSource}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. ESP32 REST API POST TESTER */}
        <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/15 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-hud font-bold tracking-wider uppercase text-slate-200">
                  ESP32 HARDWARE REST API TESTER
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">POST /api/sensor-data</span>
            </div>

            <p className="text-xs font-mono text-slate-400 mb-4">
              Simulate an incoming JSON packet from the physical ESP32 controller over Wi-Fi or tactical mesh link.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Temperature (°C):</label>
                <input
                  type="number"
                  step="0.1"
                  value={testTemp}
                  onChange={e => setTestTemp(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Pressure (kPa):</label>
                <input
                  type="number"
                  step="0.1"
                  value={testPress}
                  onChange={e => setTestPress(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Voltage (V):</label>
                <input
                  type="number"
                  step="0.05"
                  value={testVolt}
                  onChange={e => setTestVolt(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Current (A):</label>
                <input
                  type="number"
                  step="0.05"
                  value={testCurr}
                  onChange={e => setTestCurr(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <button
              onClick={handleSendTestPayload}
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-hud font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-hud-glow transition-all"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Transmitting to /api/sensor-data...' : 'Send Test ESP32 Packet'}</span>
            </button>

            {/* Response Output Box */}
            {apiResponse && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <span className="text-slate-500 text-[10px] block mb-1">SERVER RESPONSE:</span>
                <pre>{apiResponse}</pre>
              </div>
            )}
          </div>
        </div>

        {/* 2. SENSOR CALIBRATION OFFSETS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/15 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-hud font-bold tracking-wider uppercase text-slate-200">
                  HIGH-ALTITUDE TRANSDUCER CALIBRATION
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">FACTORY CALIBRATED</span>
            </div>

            <div className="space-y-4 font-mono text-xs mb-4">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">BME280 Temperature Offset:</span>
                  <span className="text-cyan-400 font-bold">{tempOffset} °C</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={tempOffset}
                  onChange={e => setTempOffset(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Corrects for self-heating inside enclosure</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">INA219 Shunt Resistor:</span>
                  <span className="text-amber-400 font-bold">{shuntOhm} Ω</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={shuntOhm}
                  onChange={e => setShuntOhm(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Standard 0.100 Ω current shunt resistor calibration</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300 block mb-1">Barometric Altitude Zero-Point:</span>
                <span className="text-emerald-400 font-bold">4,850 m (Ladakh Standard Pass)</span>
                <p className="text-[10px] text-slate-500 mt-1">Barometric formula calibrated for 58.2 kPa nominal sea-level equivalent.</p>
              </div>
            </div>

            <button
              onClick={handleSaveCalibration}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-hud font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              {calibSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Calibration Profile Stored to NVRAM</span>
                </>
              ) : (
                <span>Save Calibration Matrix</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MYSQL DATABASE SCHEMA VIEWER */}
      <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
        <div className="flex items-center justify-between mb-3 border-b border-cyan-500/15 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-hud font-bold tracking-wider uppercase text-slate-200">
              MYSQL PRODUCTION DATABASE SCHEMA (schema.sql)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Engine: InnoDB | UTF8MB4</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto">
          <pre className="text-[11px] text-cyan-300/90 leading-relaxed">
{`-- LADAKH-SHIELD PRODUCTION DATABASE SCHEMA
CREATE TABLE sensor_data (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(32) NOT NULL DEFAULT 'LSH-24-05-0017',
    temperature DECIMAL(5, 2) NOT NULL COMMENT 'BME280 Ambient Temp in °C',
    pressure DECIMAL(6, 2) NOT NULL COMMENT 'BME280 Pressure in kPa',
    humidity DECIMAL(5, 2) NOT NULL COMMENT 'BME280 Humidity in %',
    voltage DECIMAL(5, 2) NOT NULL COMMENT 'INA219 Bus Voltage',
    current DECIMAL(5, 2) NOT NULL COMMENT 'INA219 Load Current',
    power DECIMAL(6, 2) GENERATED ALWAYS AS (voltage * current) STORED,
    battery_health TINYINT UNSIGNED NOT NULL DEFAULT 100,
    data_source ENUM('LIVE_HARDWARE', 'SIMULATED', 'SD_SYNC') DEFAULT 'SIMULATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_status (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    equipment_id ENUM('drone', 'radar', 'radio', 'computer', 'battery') NOT NULL,
    status ENUM('NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE') NOT NULL DEFAULT 'NORMAL',
    temperature DECIMAL(5, 2) NOT NULL,
    voltage DECIMAL(5, 2) NOT NULL,
    current DECIMAL(5, 2) NOT NULL,
    health_percentage TINYINT UNSIGNED NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    severity ENUM('CRITICAL', 'WARNING', 'INFO') NOT NULL,
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};
