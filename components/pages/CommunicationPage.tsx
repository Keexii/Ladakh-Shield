import React from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  Signal,
  ArrowRight,
  ArrowDown,
  Cpu,
  Server,
  Layers,
  Activity,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../common/StatusBadge';

export const CommunicationPage: React.FC = () => {
  const { communication, sensorData } = useTelemetry();

  // Simulated live raw packet stream
  const rawPackets = [
    {
      seq: communication.packetsSent,
      time: new Date().toLocaleTimeString('en-GB'),
      rssi: communication.rssi,
      snr: communication.snr.toFixed(1),
      hex: `4C 53 48 3B ${Math.abs(Math.round(sensorData.temperature)).toString(16).toUpperCase()} ${Math.round(sensorData.pressure).toString(16).toUpperCase()} ${Math.round(sensorData.voltage * 10).toString(16).toUpperCase()}`,
      decoded: `T=${sensorData.temperature}°C, P=${sensorData.pressure}kPa, V=${sensorData.voltage}V, I=${sensorData.current}A`
    },
    {
      seq: communication.packetsSent - 1,
      time: new Date(Date.now() - 2000).toLocaleTimeString('en-GB'),
      rssi: communication.rssi + 1,
      snr: (communication.snr - 0.2).toFixed(1),
      hex: `4C 53 48 3B 18 3A 7C 19`,
      decoded: `SYNC_ACK_SEQ=${communication.packetsSent - 1}`
    },
    {
      seq: communication.packetsSent - 2,
      time: new Date(Date.now() - 4000).toLocaleTimeString('en-GB'),
      rssi: communication.rssi - 1,
      snr: (communication.snr + 0.3).toFixed(1),
      hex: `4C 53 48 3B 19 3A 7B 1A`,
      decoded: `TELEMETRY_FRAME_OK`
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: LoRa SX1278 Wireless Link Status */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-hud font-bold tracking-widest text-white uppercase">
              LoRa SX1278 LONG-RANGE WIRELESS TELEMETRY
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300 max-w-2xl leading-relaxed">
            Semtech SX1278 sub-GHz transceiver link operating over high-altitude Himalayan mountain terrain. Features automatic fallback to local onboard MicroSD card buffering upon RF shadow or link loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={communication.loraConnected ? 'NORMAL' : 'CRITICAL'}
            label={communication.loraConnected ? 'LoRa CONNECTED' : 'LoRa DISCONNECTED'}
            size="lg"
          />
        </div>
      </div>

      {/* Hardware Telemetry Pipeline Visualizer */}
      <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-hud font-bold tracking-widest uppercase text-slate-200">
            SYSTEM TELEMETRY PIPELINE (ESP32 ➔ LoRa SX1278 ➔ MONITORING STATION)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1: ESP32 Smart Module */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400">NODE TRANSMITTER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-hud font-bold text-white uppercase">ESP32 Universal Module</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Polls BME280 + INA219/INA226 every 2s, serializes telemetry frame.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
              Address: <span className="text-slate-200">{communication.nodeAddress}</span>
            </div>
          </div>

          {/* Step 2: LoRa SX1278 RF Link */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400">RF SPREAD SPECTRUM</span>
                <span className={`w-2 h-2 rounded-full ${communication.loraConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-hud font-bold text-white uppercase">LoRa SX1278 868MHz</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Long-range chirp spread spectrum. Line-of-sight range up to 15km in mountainous passes.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
              Link: <span className="text-cyan-300">{communication.frequency}</span>
            </div>
          </div>

          {/* Step 3: Tactical Monitoring Station */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400">BASE RECEIVER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Server className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-hud font-bold text-white uppercase">Monitoring Station</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Aggregates packets, validates checksums, streams to Cockpit UI & MySQL database.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
              Gateway: <span className="text-slate-200">{communication.gatewayAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LoRa Telemetry Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Signal Strength */}
        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">SIGNAL STRENGTH</span>
          <div className="flex items-center gap-2">
            <Signal className="w-5 h-5 text-cyan-400" />
            <span className="text-xl font-tech font-bold text-slate-100">
              {communication.signalStrength}
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 mt-2 block">
            RSSI: {communication.rssi} dBm
          </span>
        </div>

        {/* SNR */}
        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">SIGNAL-TO-NOISE (SNR)</span>
          <div className="text-xl font-tech font-bold text-slate-100">
            {communication.snr > 0 ? `+${communication.snr.toFixed(1)}` : communication.snr.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1">dB</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-2 block">
            Noise Floor: -118 dBm
          </span>
        </div>

        {/* Data Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">DATA RATE</span>
          <div className="text-base font-tech font-bold text-slate-100 truncate">
            {communication.dataRate}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">
            Payload: 32 bytes/pkt
          </span>
        </div>

        {/* Packets Sent */}
        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">PACKETS SENT</span>
          <div className="text-xl font-tech font-bold text-cyan-400">
            {communication.packetsSent.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">
            ESP32 Outbound
          </span>
        </div>

        {/* Packets Received */}
        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">PACKETS RECEIVED</span>
          <div className="text-xl font-tech font-bold text-emerald-400">
            {communication.packetsReceived.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">
            Gateway Inbound
          </span>
        </div>

        {/* Packet Loss */}
        <div className="p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">PACKET LOSS</span>
          <div className={`text-xl font-tech font-bold ${communication.packetLoss > 5 ? 'text-rose-400' : 'text-slate-100'}`}>
            {communication.packetLoss}%
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-2 block">
            CRC Error Rate: 0.0%
          </span>
        </div>
      </div>

      {/* Raw Incoming LoRa Packet Hex & Decoded Frame Log */}
      <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20">
        <div className="flex items-center justify-between mb-3 border-b border-cyan-500/15 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-hud font-bold tracking-wider uppercase text-slate-200">
              LIVE RF FRAME INSPECTOR (HEX STREAM & TELEMETRY REGISTERS)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Last Communication: {communication.lastCommunication}
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {rawPackets.map((pkt, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
                  PKT #{pkt.seq}
                </span>
                <span className="text-slate-400 text-[11px]">{pkt.time}</span>
                <span className="text-amber-300 font-mono tracking-wider text-[11px]">
                  {pkt.hex}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-300 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {pkt.decoded}
                </span>
                <span className="text-cyan-400 text-[10px]">
                  RSSI: {pkt.rssi}dBm
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
