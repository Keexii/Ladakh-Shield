export type EquipmentType = 'drone' | 'radar' | 'radio' | 'computer' | 'battery';

export type StatusLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type SubsystemStatus = 'OK' | 'WARNING' | 'CRITICAL';

export interface SensorData {
  temperature: number; // °C (BME280)
  pressure: number;    // kPa (BME280)
  humidity: number;    // % (BME280)
  voltage: number;     // V (INA219/INA226)
  current: number;     // A (INA219/INA226)
  power: number;       // W (Calculated V * A)
  batteryHealth: number; // %
  batteryRemainingTime: string; // HH:MM:SS
  timestamp: string;
}

export interface EquipmentItem {
  id: EquipmentType;
  name: string;
  category: string;
  icon: string;
  status: StatusLevel;
  temperature: number; // °C
  voltage: number;     // V
  current: number;     // A
  health: number;      // %
  lastUpdate: string;
  operatingStatus: string;
  parameters: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  specifications: {
    operatingTempRange: string;
    nominalVoltage: string;
    maxCurrentDraw: string;
    highAltitudeRating: string;
  };
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  equipment?: EquipmentType | 'SYSTEM';
  acknowledged: boolean;
}

export interface ProtectionState {
  heater: {
    status: boolean; // ON / OFF
    mode: 'AUTO' | 'MANUAL';
    reason: string;
    lastActivation: string;
    powerPercentage: number;
  };
  coolingFan: {
    status: boolean; // ON / OFF
    mode: 'AUTO' | 'MANUAL';
    reason: string;
    lastActivation: string;
    rpm: number;
  };
  powerProtection: {
    status: boolean; // Engaged / Armed
    mode: 'AUTO' | 'MANUAL';
    reason: string;
    lastActivation: string;
    tripped: boolean;
  };
  emergencyMode: boolean;
  emergencyActivatedAt?: string;
}

export interface CommunicationTelemetry {
  loraConnected: boolean;
  signalStrength: 'Strong' | 'Medium' | 'Weak' | 'None';
  rssi: number;       // -dBm
  snr: number;        // dB
  frequency: string;  // e.g. "868.100 MHz"
  dataRate: string;   // e.g. "5.4 kbps (SF7 / BW 125kHz)"
  packetsSent: number;
  packetsReceived: number;
  packetLoss: number; // %
  lastCommunication: string;
  nodeAddress: string;
  gatewayAddress: string;
}

export interface RiskAnalysis {
  level: 'NORMAL' | 'WARNING' | 'CRITICAL';
  score: number; // 0 - 100
  reason: string;
  recommendedAction: string;
  activeRules: string[];
}

export interface SystemSubsystems {
  powerSystem: SubsystemStatus;
  sensorArray: SubsystemStatus;
  communication: SubsystemStatus;
  dataStorage: SubsystemStatus;
  thermalManagement: SubsystemStatus;
  protectionSystem: SubsystemStatus;
  overall: 'SYSTEM OPERATIONAL' | 'DEGRADED PERFORMANCE' | 'CRITICAL ALERT';
}

export type DemoScenario = 
  | 'NORMAL'
  | 'EXTREME_COLD'
  | 'LOW_PRESSURE'
  | 'HIGH_TEMP'
  | 'LOW_BATTERY'
  | 'OVERCURRENT'
  | 'COMM_FAILURE';

export interface HistoricalLogEntry {
  id: string;
  timestamp: string;
  equipment: string;
  temperature: number;
  pressure: number;
  humidity: number;
  voltage: number;
  current: number;
  power: number;
  health: number;
  status: StatusLevel;
  alert: string;
}
