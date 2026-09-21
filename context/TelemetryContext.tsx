import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  SensorData,
  EquipmentItem,
  AlertItem,
  ProtectionState,
  CommunicationTelemetry,
  RiskAnalysis,
  SystemSubsystems,
  DemoScenario,
  HistoricalLogEntry
} from '../types/telemetry';
import { evaluateRisk } from '../engine/riskEngine';
import { updateAdaptiveProtection } from '../engine/protectionEngine';
import {
  INITIAL_EQUIPMENT,
  computeNextSensorData,
  updateEquipmentStatus,
  computeCommunication
} from '../engine/simulationEngine';

export interface ChartPoint {
  time: string;
  temperature: number;
  pressure: number;
  humidity: number;
  voltage: number;
  current: number;
  power: number;
}

interface TelemetryContextType {
  sensorData: SensorData;
  equipment: EquipmentItem[];
  alerts: AlertItem[];
  protection: ProtectionState;
  communication: CommunicationTelemetry;
  risk: RiskAnalysis;
  subsystems: SystemSubsystems;
  historicalLogs: HistoricalLogEntry[];
  chartHistory: ChartPoint[];
  timeFilter: '1H' | '6H' | '24H' | '7D';
  setTimeFilter: (filter: '1H' | '6H' | '24H' | '7D') => void;
  activeScenario: DemoScenario;
  triggerScenario: (scenario: DemoScenario) => void;
  dataSource: 'SIMULATED' | 'LIVE_HARDWARE';
  setDataSource: (source: 'SIMULATED' | 'LIVE_HARDWARE') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEquipment: EquipmentItem | null;
  setSelectedEquipment: (eq: EquipmentItem | null) => void;
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;
  audioAlarmEnabled: boolean;
  setAudioAlarmEnabled: (enabled: boolean) => void;
  // Controls
  toggleHeater: () => void;
  setHeaterMode: (mode: 'AUTO' | 'MANUAL') => void;
  toggleCoolingFan: () => void;
  setCoolingFanMode: (mode: 'AUTO' | 'MANUAL') => void;
  resetMosfet: () => void;
  setMosfetMode: (mode: 'AUTO' | 'MANUAL') => void;
  engageEmergencyMode: () => void;
  disengageEmergencyMode: () => void;
  acknowledgeAlert: (id: string) => void;
  acknowledgeAllAlerts: () => void;
  clearAlert: (id: string) => void;
  clearAllAlerts: () => void;
  refreshTelemetry: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

// Web Audio API beep generator for critical alerts
function playMilitaryAlertTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15); // E5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext blocked or not supported
  }
}

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dataSource, setDataSource] = useState<'SIMULATED' | 'LIVE_HARDWARE'>('SIMULATED');
  const [activeScenario, setActiveScenario] = useState<DemoScenario>('NORMAL');
  const [timeFilter, setTimeFilter] = useState<'1H' | '6H' | '24H' | '7D'>('1H');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [audioAlarmEnabled, setAudioAlarmEnabled] = useState<boolean>(false);

  // Core telemetry states
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: -24.5,
    pressure: 58.2,
    humidity: 18.0,
    voltage: 12.40,
    current: 2.60,
    power: 32.24,
    batteryHealth: 82,
    batteryRemainingTime: '06:45:00',
    timestamp: new Date().toLocaleTimeString('en-GB')
  });

  const [equipment, setEquipment] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);

  const [protection, setProtection] = useState<ProtectionState>({
    heater: {
      status: true,
      mode: 'AUTO',
      reason: 'Ambient Temp (-24.5°C) < -20°C',
      lastActivation: '10:14:00',
      powerPercentage: 68
    },
    coolingFan: {
      status: false,
      mode: 'AUTO',
      reason: 'Temperature nominal (Fan Standby)',
      lastActivation: '--',
      rpm: 0
    },
    powerProtection: {
      status: false,
      mode: 'AUTO',
      reason: 'Current nominal (< 6.0A limit)',
      lastActivation: '--',
      tripped: false
    },
    emergencyMode: false
  });

  const [communication, setCommunication] = useState<CommunicationTelemetry>({
    loraConnected: true,
    signalStrength: 'Strong',
    rssi: -84,
    snr: 8.5,
    frequency: '868.100 MHz',
    dataRate: '5.4 kbps (SF7 / BW 125kHz)',
    packetsSent: 1420,
    packetsReceived: 1417,
    packetLoss: 0.2,
    lastCommunication: '1s ago',
    nodeAddress: '0x3F8A',
    gatewayAddress: '0x0001 (HQ)'
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt-init-1',
      severity: 'WARNING',
      title: 'Sub-Zero Operating Window',
      message: 'Ambient temperature at -24.5°C. Auxiliary heating pad operational.',
      timestamp: '10:18:07',
      equipment: 'battery',
      acknowledged: false
    },
    {
      id: 'alt-init-2',
      severity: 'INFO',
      title: 'LoRa SX1278 Link Nominal',
      message: 'Tactical link locked at 868.100MHz | RSSI -84dBm | SNR +8.5dB.',
      timestamp: '10:15:02',
      equipment: 'radio',
      acknowledged: true
    },
    {
      id: 'alt-init-3',
      severity: 'INFO',
      title: 'SD Telemetry Log Synchronized',
      message: 'Sector Alpha flash partition block 4096 committed to local log.',
      timestamp: '10:05:20',
      equipment: 'computer',
      acknowledged: true
    }
  ]);

  // Seed chart history points with realistic historical baseline
  const [chartHistory, setChartHistory] = useState<ChartPoint[]>(() => {
    const initial: ChartPoint[] = [];
    const now = Date.now();
    for (let i = 25; i >= 0; i--) {
      const t = new Date(now - i * 3000);
      const noise = (Math.random() - 0.5) * 0.4;
      initial.push({
        time: t.toLocaleTimeString('en-GB'),
        temperature: +(-24.5 + noise).toFixed(1),
        pressure: +(58.2 + noise * 0.2).toFixed(1),
        humidity: +(18.0 + noise * 0.5).toFixed(1),
        voltage: +(12.40 + noise * 0.05).toFixed(2),
        current: +(2.60 + noise * 0.08).toFixed(2),
        power: +(12.40 * 2.60 + noise * 0.2).toFixed(2)
      });
    }
    return initial;
  });

  const [historicalLogs, setHistoricalLogs] = useState<HistoricalLogEntry[]>(() => {
    const logs: HistoricalLogEntry[] = [];
    const now = Date.now();
    const eqs: Array<'drone' | 'radar' | 'radio' | 'computer' | 'battery'> = ['drone', 'radar', 'radio', 'computer', 'battery'];
    for (let i = 20; i >= 0; i--) {
      const d = new Date(now - i * 45000);
      const eqId = eqs[i % eqs.length];
      logs.push({
        id: `log-seed-${i}`,
        timestamp: d.toLocaleTimeString('en-GB'),
        equipment: eqId.toUpperCase(),
        temperature: +(-24.5 + (Math.random() - 0.5) * 1.5).toFixed(1),
        pressure: +(58.2 + (Math.random() - 0.5) * 0.3).toFixed(1),
        humidity: +(18.0 + (Math.random() - 0.5) * 0.8).toFixed(1),
        voltage: +(12.40 + (Math.random() - 0.5) * 0.05).toFixed(2),
        current: +(2.60 + (Math.random() - 0.5) * 0.1).toFixed(2),
        power: +(32.24 + (Math.random() - 0.5) * 0.4).toFixed(2),
        health: 82,
        status: 'NORMAL',
        alert: 'Nominal baseline telemetry'
      });
    }
    return logs;
  });

  const audioAlarmRef = useRef(audioAlarmEnabled);
  audioAlarmRef.current = audioAlarmEnabled;

  // Derived: Risk Analysis
  const risk = evaluateRisk(sensorData, protection.powerProtection.tripped);

  // Derived: Subsystems Health Assessment
  const subsystems: SystemSubsystems = {
    powerSystem: sensorData.voltage < 10.0 || protection.powerProtection.tripped ? 'CRITICAL' : sensorData.voltage < 11.0 ? 'WARNING' : 'OK',
    sensorArray: 'OK',
    communication: !communication.loraConnected ? 'CRITICAL' : communication.packetLoss > 10 ? 'WARNING' : 'OK',
    dataStorage: 'OK',
    thermalManagement: sensorData.temperature > 50 || sensorData.temperature < -32 ? 'CRITICAL' : sensorData.temperature > 40 || sensorData.temperature < -20 ? 'WARNING' : 'OK',
    protectionSystem: protection.powerProtection.tripped ? 'CRITICAL' : protection.heater.status || protection.coolingFan.status ? 'WARNING' : 'OK',
    overall: 'SYSTEM OPERATIONAL'
  };

  if (
    subsystems.powerSystem === 'CRITICAL' ||
    subsystems.communication === 'CRITICAL' ||
    subsystems.thermalManagement === 'CRITICAL' ||
    subsystems.protectionSystem === 'CRITICAL'
  ) {
    subsystems.overall = 'CRITICAL ALERT';
  } else if (
    subsystems.powerSystem === 'WARNING' ||
    subsystems.thermalManagement === 'WARNING' ||
    subsystems.protectionSystem === 'WARNING'
  ) {
    subsystems.overall = 'DEGRADED PERFORMANCE';
  }

  // Trigger sound when critical
  useEffect(() => {
    if (subsystems.overall === 'CRITICAL ALERT' && audioAlarmRef.current) {
      playMilitaryAlertTone();
    }
  }, [subsystems.overall]);

  // Telemetry simulation tick loop (every 2 seconds)
  useEffect(() => {
    if (dataSource === 'LIVE_HARDWARE') {
      // In live mode, poll our backend REST API for external ESP32 POSTs
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:5000/api/sensor-data');
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setSensorData(json.data);
            }
          }
        } catch {
          // Backend offline or unreachable
        }
      }, 2000);
      return () => clearInterval(pollInterval);
    }

    // SIMULATED MODE: Continuous realistic physical updates
    const interval = setInterval(() => {
      setSensorData(prev => {
        const next = computeNextSensorData(
          prev,
          activeScenario,
          protection.heater.status,
          protection.coolingFan.status,
          protection.powerProtection.tripped
        );

        // Update adaptive protection reactions
        const { updatedProtection, newAlert } = updateAdaptiveProtection(
          protection,
          next,
          new Date().toISOString()
        );

        if (JSON.stringify(updatedProtection) !== JSON.stringify(protection)) {
          setProtection(updatedProtection);
        }

        if (newAlert) {
          setAlerts(currAlerts => [newAlert, ...currAlerts]);
          if (audioAlarmRef.current) playMilitaryAlertTone();
        }

        // Append to Chart History (keep last 40 points)
        setChartHistory(curr => {
          const newPoint: ChartPoint = {
            time: next.timestamp,
            temperature: next.temperature,
            pressure: next.pressure,
            humidity: next.humidity,
            voltage: next.voltage,
            current: next.current,
            power: next.power
          };
          const updated = [...curr, newPoint];
          if (updated.length > 40) updated.shift();
          return updated;
        });

        // Periodic log appending (every 10 seconds approx)
        if (Math.random() < 0.3) {
          const eqChoice = INITIAL_EQUIPMENT[Math.floor(Math.random() * INITIAL_EQUIPMENT.length)];
          const newLog: HistoricalLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: next.timestamp,
            equipment: eqChoice.id.toUpperCase(),
            temperature: next.temperature,
            pressure: next.pressure,
            humidity: next.humidity,
            voltage: next.voltage,
            current: next.current,
            power: next.power,
            health: next.batteryHealth,
            status: next.voltage < 10.5 ? 'CRITICAL' : next.temperature < -20 ? 'WARNING' : 'NORMAL',
            alert: next.temperature < -20 ? 'Sub-zero thermal threshold' : 'Nominal telemetry packet'
          };
          setHistoricalLogs(currLogs => [newLog, ...currLogs.slice(0, 99)]);
        }

        return next;
      });

      // Update Equipment statuses
      setEquipment(currEq => updateEquipmentStatus(currEq, sensorData, activeScenario, protection.powerProtection.tripped));

      // Update Communication telemetry
      setCommunication(currComm => computeCommunication(currComm, activeScenario));
    }, 2000);

    return () => clearInterval(interval);
  }, [dataSource, activeScenario, protection]);

  // SIH Demo Scenario Handler
  const triggerScenario = useCallback((scenario: DemoScenario) => {
    setActiveScenario(scenario);
    const nowTime = new Date().toLocaleTimeString('en-GB');

    let alertTitle = '';
    let alertMsg = '';
    let alertSev: 'CRITICAL' | 'WARNING' | 'INFO' = 'WARNING';
    let affectedEq: 'drone' | 'radar' | 'radio' | 'computer' | 'battery' | 'SYSTEM' = 'SYSTEM';

    switch (scenario) {
      case 'EXTREME_COLD':
        alertTitle = 'DEMO: Extreme High-Altitude Cold Induced';
        alertMsg = 'Ambient temperature plunging towards -35°C. Adaptive PTC heater activated. Battery capacity derated.';
        alertSev = 'WARNING';
        affectedEq = 'battery';
        setProtection(p => ({
          ...p,
          heater: {
            ...p.heater,
            status: true,
            powerPercentage: 95,
            reason: 'DEMO TRIGGER: Extreme Cold (-34.8°C)',
            lastActivation: nowTime
          }
        }));
        break;

      case 'LOW_PRESSURE':
        alertTitle = 'DEMO: Extreme Low Barometric Pressure';
        alertMsg = 'Pressure collapsed to 44.1 kPa (equivalent to 5,800m Khardung La peak). Convective thermal cooling derated.';
        alertSev = 'WARNING';
        affectedEq = 'drone';
        break;

      case 'HIGH_TEMP':
        alertTitle = 'DEMO: Thermal Overload Runaway';
        alertMsg = 'Internal equipment thermal envelope breached (+58°C). Forced cooling fan triggered at max 4800 RPM.';
        alertSev = 'CRITICAL';
        affectedEq = 'computer';
        setProtection(p => ({
          ...p,
          coolingFan: {
            ...p.coolingFan,
            status: true,
            rpm: 4800,
            reason: 'DEMO TRIGGER: Thermal Surge (> 55°C)',
            lastActivation: nowTime
          }
        }));
        break;

      case 'LOW_BATTERY':
        alertTitle = 'DEMO: Critical Undervoltage Warning';
        alertMsg = 'Bus voltage collapsed to 9.65V (14% SoC). Power-shedding protocol initiated to protect lithium cells.';
        alertSev = 'CRITICAL';
        affectedEq = 'battery';
        break;

      case 'OVERCURRENT':
        alertTitle = 'DEMO: Overcurrent Spike - MOSFET Tripped';
        alertMsg = 'Current surged past 6.0A cutoff (7.85A peak). Solid-State MOSFET isolated main power rail.';
        alertSev = 'CRITICAL';
        affectedEq = 'SYSTEM';
        setProtection(p => ({
          ...p,
          powerProtection: {
            ...p.powerProtection,
            status: true,
            tripped: true,
            reason: 'DEMO TRIGGER: Overcurrent Spike 7.85A',
            lastActivation: nowTime
          }
        }));
        break;

      case 'COMM_FAILURE':
        alertTitle = 'DEMO: LoRa SX1278 Wireless Link Severed';
        alertMsg = 'RF link lost. 100% packet loss. Telemetry automatically buffering to onboard MicroSD card.';
        alertSev = 'CRITICAL';
        affectedEq = 'radio';
        break;

      case 'NORMAL':
        alertTitle = 'DEMO: Nominal Conditions Restored';
        alertMsg = 'All sensors and subsystems returned to stable baseline high-altitude envelope.';
        alertSev = 'INFO';
        affectedEq = 'SYSTEM';
        setProtection(p => ({
          ...p,
          heater: {
            ...p.heater,
            status: true,
            powerPercentage: 68,
            reason: 'Ambient Temp < -20°C',
            lastActivation: nowTime
          },
          coolingFan: {
            ...p.coolingFan,
            status: false,
            rpm: 0,
            reason: 'Thermal baseline restored',
            lastActivation: '--'
          },
          powerProtection: {
            ...p.powerProtection,
            status: false,
            tripped: false,
            reason: 'Load current nominal',
            lastActivation: '--'
          },
          emergencyMode: false
        }));
        break;
    }

    if (alertTitle) {
      const generatedAlert: AlertItem = {
        id: `alt-demo-${Date.now()}`,
        severity: alertSev,
        title: alertTitle,
        message: alertMsg,
        timestamp: nowTime,
        equipment: affectedEq,
        acknowledged: false
      };
      setAlerts(curr => [generatedAlert, ...curr]);
      if (alertSev === 'CRITICAL' && audioAlarmRef.current) {
        playMilitaryAlertTone();
      }
    }
  }, []);

  // Protection Controls
  const toggleHeater = () => {
    const nowTime = new Date().toLocaleTimeString('en-GB');
    setProtection(p => ({
      ...p,
      heater: {
        ...p.heater,
        status: !p.heater.status,
        reason: `Manual Override: Operator turned ${!p.heater.status ? 'ON' : 'OFF'}`,
        lastActivation: nowTime,
        powerPercentage: !p.heater.status ? 85 : 0
      }
    }));
  };

  const setHeaterMode = (mode: 'AUTO' | 'MANUAL') => {
    setProtection(p => ({
      ...p,
      heater: { ...p.heater, mode }
    }));
  };

  const toggleCoolingFan = () => {
    const nowTime = new Date().toLocaleTimeString('en-GB');
    setProtection(p => ({
      ...p,
      coolingFan: {
        ...p.coolingFan,
        status: !p.coolingFan.status,
        reason: `Manual Override: Operator turned ${!p.coolingFan.status ? 'ON' : 'OFF'}`,
        lastActivation: nowTime,
        rpm: !p.coolingFan.status ? 3600 : 0
      }
    }));
  };

  const setCoolingFanMode = (mode: 'AUTO' | 'MANUAL') => {
    setProtection(p => ({
      ...p,
      coolingFan: { ...p.coolingFan, mode }
    }));
  };

  const resetMosfet = () => {
    const nowTime = new Date().toLocaleTimeString('en-GB');
    setProtection(p => ({
      ...p,
      powerProtection: {
        ...p.powerProtection,
        status: false,
        tripped: false,
        reason: 'Operator Reset: Circuit re-armed',
        lastActivation: nowTime
      }
    }));
    setAlerts(curr => [
      {
        id: `alt-reset-${Date.now()}`,
        severity: 'INFO',
        title: 'MOSFET Power Rail Re-Armed',
        message: 'Solid-state protection reset by command operator. Voltage restored.',
        timestamp: nowTime,
        equipment: 'SYSTEM',
        acknowledged: true
      },
      ...curr
    ]);
  };

  const setMosfetMode = (mode: 'AUTO' | 'MANUAL') => {
    setProtection(p => ({
      ...p,
      powerProtection: { ...p.powerProtection, mode }
    }));
  };

  const engageEmergencyMode = () => {
    const nowTime = new Date().toLocaleTimeString('en-GB');
    setProtection(p => ({
      ...p,
      emergencyMode: true,
      emergencyActivatedAt: nowTime,
      heater: { ...p.heater, status: false, powerPercentage: 0, reason: 'EMERGENCY SHED' },
      coolingFan: { ...p.coolingFan, status: false, rpm: 0, reason: 'EMERGENCY SHED' }
    }));
    setAlerts(curr => [
      {
        id: `alt-emg-${Date.now()}`,
        severity: 'CRITICAL',
        title: 'EMERGENCY SHUTDOWN ENGAGED',
        message: 'Operator initiated tactical emergency load shedding. Auxiliary modules isolated.',
        timestamp: nowTime,
        equipment: 'SYSTEM',
        acknowledged: false
      },
      ...curr
    ]);
    if (audioAlarmRef.current) playMilitaryAlertTone();
  };

  const disengageEmergencyMode = () => {
    setProtection(p => ({
      ...p,
      emergencyMode: false
    }));
  };

  // Alert Management
  const acknowledgeAlert = (id: string) => {
    setAlerts(curr => curr.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAllAlerts = () => {
    setAlerts(curr => curr.map(a => ({ ...a, acknowledged: true })));
  };

  const clearAlert = (id: string) => {
    setAlerts(curr => curr.filter(a => a.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const refreshTelemetry = () => {
    setSensorData(prev => computeNextSensorData(prev, activeScenario, protection.heater.status, protection.coolingFan.status, protection.powerProtection.tripped));
  };

  return (
    <TelemetryContext.Provider
      value={{
        sensorData,
        equipment,
        alerts,
        protection,
        communication,
        risk,
        subsystems,
        historicalLogs,
        chartHistory,
        timeFilter,
        setTimeFilter,
        activeScenario,
        triggerScenario,
        dataSource,
        setDataSource,
        activeTab,
        setActiveTab,
        selectedEquipment,
        setSelectedEquipment,
        emergencyModalOpen,
        setEmergencyModalOpen,
        audioAlarmEnabled,
        setAudioAlarmEnabled,
        toggleHeater,
        setHeaterMode,
        toggleCoolingFan,
        setCoolingFanMode,
        resetMosfet,
        setMosfetMode,
        engageEmergencyMode,
        disengageEmergencyMode,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        clearAlert,
        clearAllAlerts,
        refreshTelemetry
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = (): TelemetryContextType => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
