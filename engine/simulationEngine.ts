import { SensorData, EquipmentItem, DemoScenario, CommunicationTelemetry, AlertItem } from '../types/telemetry';

export interface SimulationState {
  currentScenario: DemoScenario;
  scenarioTimeElapsed: number; // seconds
  sdCardUsedBytes: number;
  sdCardTotalBytes: number;
}

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'drone',
    name: 'Tactical Drone (UAV)',
    category: 'Avionics & Propulsion',
    icon: 'Plane',
    status: 'NORMAL',
    temperature: -18.2,
    voltage: 12.35,
    current: 2.6,
    health: 84,
    lastUpdate: 'Just now',
    operatingStatus: 'Hover Patrol / Standby Beacon',
    parameters: [
      { label: 'Motor ESC Temp', value: -12.4, unit: '°C' },
      { label: 'Rotor RPM', value: 3200, unit: 'RPM' },
      { label: 'Battery SoC', value: 82, unit: '%' },
      { label: 'GPS Satellites', value: 14 }
    ],
    specifications: {
      operatingTempRange: '-40°C to +50°C',
      nominalVoltage: '11.1V - 12.6V (3S LiPo)',
      maxCurrentDraw: '8.5A peak',
      highAltitudeRating: 'Qualified up to 5,500m AMSL'
    }
  },
  {
    id: 'radar',
    name: 'Border Surveillance Radar',
    category: 'RF Detection & Tracking',
    icon: 'RadioTower',
    status: 'NORMAL',
    temperature: -15.6,
    voltage: 12.42,
    current: 3.1,
    health: 91,
    lastUpdate: 'Just now',
    operatingStatus: 'Sector Scan 180° Active',
    parameters: [
      { label: 'T/R Module Temp', value: 24.1, unit: '°C' },
      { label: 'Sweep Frequency', value: 9.4, unit: 'GHz' },
      { label: 'RF Output Power', value: 45, unit: 'W' },
      { label: 'Target Track Count', value: 3 }
    ],
    specifications: {
      operatingTempRange: '-35°C to +55°C',
      nominalVoltage: '12.0V - 14.0V',
      maxCurrentDraw: '6.0A continuous',
      highAltitudeRating: 'Pressurized dome seal'
    }
  },
  {
    id: 'radio',
    name: 'VHF/UHF Tactical Radio',
    category: 'Encrypted Comms',
    icon: 'Radio',
    status: 'NORMAL',
    temperature: -19.4,
    voltage: 12.38,
    current: 1.4,
    health: 88,
    lastUpdate: 'Just now',
    operatingStatus: 'Standby RX / Mesh Relay',
    parameters: [
      { label: 'PA Stage Temp', value: 18.5, unit: '°C' },
      { label: 'VSWR', value: '1.18:1' },
      { label: 'RSSI Link', value: -84, unit: 'dBm' },
      { label: 'Encryption', value: 'AES-256 GCM' }
    ],
    specifications: {
      operatingTempRange: '-40°C to +60°C',
      nominalVoltage: '12.0V DC',
      maxCurrentDraw: '3.5A TX / 0.8A RX',
      highAltitudeRating: 'MIL-STD-810G tested'
    }
  },
  {
    id: 'computer',
    name: 'Tactical Edge Computer',
    category: 'Mission Processor / AI',
    icon: 'Cpu',
    status: 'NORMAL',
    temperature: 28.3,
    voltage: 12.39,
    current: 2.1,
    health: 95,
    lastUpdate: 'Just now',
    operatingStatus: 'Telemetry Aggregation & Inference',
    parameters: [
      { label: 'CPU Core Temp', value: 34.2, unit: '°C' },
      { label: 'CPU Utilization', value: 22, unit: '%' },
      { label: 'RAM Allocated', value: '1.4 / 4.0', unit: 'GB' },
      { label: 'Storage Free', value: '24.6', unit: 'GB' }
    ],
    specifications: {
      operatingTempRange: '-25°C to +65°C',
      nominalVoltage: '12.0V Regulated',
      maxCurrentDraw: '4.0A load',
      highAltitudeRating: 'Conduction cooled chassis'
    }
  },
  {
    id: 'battery',
    name: 'Cold-Resistant Power Pack',
    category: 'Energy Storage Subsystem',
    icon: 'BatteryCharging',
    status: 'NORMAL',
    temperature: -14.8,
    voltage: 12.41,
    current: 2.55,
    health: 82,
    lastUpdate: 'Just now',
    operatingStatus: 'Discharging Nominally',
    parameters: [
      { label: 'Pack State of Charge', value: 82, unit: '%' },
      { label: 'Cell Balance Delta', value: 12, unit: 'mV' },
      { label: 'Internal Resistance', value: 24, unit: 'mΩ' },
      { label: 'Discharge Cycle', value: 142 }
    ],
    specifications: {
      operatingTempRange: '-30°C to +45°C (with PTC heater)',
      nominalVoltage: '12.8V LiFePO4',
      maxCurrentDraw: '15.0A pulse',
      highAltitudeRating: 'Low-pressure sealed vent'
    }
  }
];

export function computeNextSensorData(
  prev: SensorData,
  scenario: DemoScenario,
  heaterOn: boolean,
  coolingFanOn: boolean,
  mosfetTripped: boolean
): SensorData {
  const noise = (Math.random() - 0.5);

  let targetTemp = -24.5;
  let targetPress = 58.2;
  let targetHum = 18.0;
  let targetVolt = 12.4;
  let targetCurr = 2.6;
  let targetBatteryHealth = 82;

  // Apply scenario targets
  switch (scenario) {
    case 'EXTREME_COLD':
      targetTemp = -34.8;
      targetPress = 52.4;
      targetHum = 11.0;
      targetVolt = 11.2;
      targetBatteryHealth = 68;
      targetCurr = heaterOn ? 4.2 : 2.4;
      break;

    case 'LOW_PRESSURE':
      targetTemp = -27.0;
      targetPress = 44.1; // 5,800m Khardung La pass equivalent
      targetHum = 9.5;
      targetVolt = 12.3;
      targetCurr = 2.5;
      break;

    case 'HIGH_TEMP':
      targetTemp = 58.4;
      targetPress = 58.5;
      targetHum = 24.0;
      targetVolt = 12.1;
      targetCurr = coolingFanOn ? 3.8 : 3.2;
      break;

    case 'LOW_BATTERY':
      targetTemp = -23.0;
      targetPress = 58.0;
      targetHum = 17.5;
      targetVolt = 9.65;
      targetCurr = 1.6;
      targetBatteryHealth = 14;
      break;

    case 'OVERCURRENT':
      targetTemp = -16.0;
      targetPress = 58.2;
      targetHum = 18.0;
      targetVolt = 11.8;
      targetCurr = mosfetTripped ? 0.05 : 7.85; // Drops when MOSFET trips
      break;

    case 'COMM_FAILURE':
      targetTemp = -25.2;
      targetPress = 57.8;
      targetHum = 18.2;
      targetVolt = 12.38;
      targetCurr = 2.1;
      break;

    case 'NORMAL':
    default:
      targetTemp = -24.5;
      targetPress = 58.2;
      targetHum = 18.0;
      targetVolt = 12.4;
      targetCurr = 2.6;
      targetBatteryHealth = 82;
      break;
  }

  // Effect of heater on ambient / internal temp
  if (heaterOn && scenario !== 'HIGH_TEMP') {
    targetTemp += 12.0; // warms up
  }

  // Effect of cooling fan
  if (coolingFanOn && scenario === 'HIGH_TEMP') {
    targetTemp -= 10.5; // cooling down
  }

  // If MOSFET is tripped, current is virtually 0
  if (mosfetTripped) {
    targetCurr = 0.05;
  }

  // Smooth interpolation towards targets
  const newTemp = +(prev.temperature + (targetTemp - prev.temperature) * 0.15 + noise * 0.1).toFixed(1);
  const newPress = +(prev.pressure + (targetPress - prev.pressure) * 0.15 + noise * 0.08).toFixed(1);
  const newHum = +Math.max(5, Math.min(95, prev.humidity + (targetHum - prev.humidity) * 0.15 + noise * 0.2)).toFixed(1);
  const newVolt = +Math.max(8.0, prev.voltage + (targetVolt - prev.voltage) * 0.2 + noise * 0.02).toFixed(2);
  const newCurr = +Math.max(0.0, prev.current + (targetCurr - prev.current) * 0.25 + noise * 0.03).toFixed(2);
  const newPower = +(newVolt * newCurr).toFixed(2);
  const newBatHealth = Math.max(5, Math.round(prev.batteryHealth + (targetBatteryHealth - prev.batteryHealth) * 0.1));

  // Compute remaining time: e.g. Ah remaining / current draw
  let hoursRemaining = newCurr > 0.1 ? (18 * (newBatHealth / 100)) / newCurr : 99;
  if (hoursRemaining > 99) hoursRemaining = 99;
  const hrs = Math.floor(hoursRemaining);
  const mins = Math.floor((hoursRemaining - hrs) * 60);
  const secs = Math.floor((((hoursRemaining - hrs) * 60) - mins) * 60);
  const remainingStr = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB');

  return {
    temperature: newTemp,
    pressure: newPress,
    humidity: newHum,
    voltage: newVolt,
    current: newCurr,
    power: newPower,
    batteryHealth: newBatHealth,
    batteryRemainingTime: remainingStr,
    timestamp: timeStr
  };
}

export function updateEquipmentStatus(
  currentEquipment: EquipmentItem[],
  sensor: SensorData,
  scenario: DemoScenario,
  mosfetTripped: boolean
): EquipmentItem[] {
  return currentEquipment.map(eq => {
    let status = eq.status;
    let temp = eq.temperature;
    let volt = sensor.voltage;
    let curr = eq.current;
    let health = eq.health;

    // Adjust based on scenario & equipment type
    switch (eq.id) {
      case 'drone':
        temp = +(sensor.temperature + 4.2).toFixed(1);
        if (scenario === 'EXTREME_COLD') {
          status = 'WARNING';
          health = 68;
        } else if (scenario === 'OVERCURRENT' || mosfetTripped) {
          status = mosfetTripped ? 'WARNING' : 'CRITICAL';
          curr = mosfetTripped ? 0.0 : 4.8;
        } else {
          status = 'NORMAL';
          health = 84;
        }
        break;

      case 'radar':
        temp = +(sensor.temperature + 12.0).toFixed(1);
        if (scenario === 'HIGH_TEMP') {
          status = 'CRITICAL';
          temp = 64.2;
          health = 62;
        } else if (scenario === 'OVERCURRENT') {
          status = mosfetTripped ? 'WARNING' : 'CRITICAL';
        } else {
          status = 'NORMAL';
          health = 91;
        }
        break;

      case 'radio':
        temp = +(sensor.temperature + 6.0).toFixed(1);
        if (scenario === 'COMM_FAILURE') {
          status = 'OFFLINE';
          health = 54;
        } else if (scenario === 'LOW_BATTERY') {
          status = 'WARNING';
          health = 70;
        } else {
          status = 'NORMAL';
          health = 88;
        }
        break;

      case 'computer':
        temp = +(sensor.temperature + 22.0).toFixed(1);
        if (scenario === 'HIGH_TEMP') {
          status = 'CRITICAL';
          temp = 72.8;
          health = 58;
        } else if (mosfetTripped) {
          status = 'OFFLINE';
        } else {
          status = 'NORMAL';
          health = 95;
        }
        break;

      case 'battery':
        temp = +(sensor.temperature + 2.0).toFixed(1);
        health = sensor.batteryHealth;
        if (scenario === 'LOW_BATTERY') {
          status = 'CRITICAL';
        } else if (scenario === 'EXTREME_COLD') {
          status = 'WARNING';
        } else {
          status = 'NORMAL';
        }
        break;
    }

    return {
      ...eq,
      status,
      temperature: temp,
      voltage: volt,
      current: curr,
      health,
      lastUpdate: 'Just now'
    };
  });
}

export function computeCommunication(
  prev: CommunicationTelemetry,
  scenario: DemoScenario
): CommunicationTelemetry {
  if (scenario === 'COMM_FAILURE') {
    return {
      ...prev,
      loraConnected: false,
      signalStrength: 'None',
      rssi: -128,
      snr: -14.2,
      packetLoss: 100,
      packetsSent: prev.packetsSent + 1,
      lastCommunication: 'Link Dropped (Offline SD Log Active)'
    };
  }

  const noiseRssi = Math.floor(Math.random() * 5) - 2;
  const newSent = prev.packetsSent + 1;
  const newRcv = prev.packetsReceived + 1;

  return {
    ...prev,
    loraConnected: true,
    signalStrength: 'Strong',
    rssi: -84 + noiseRssi,
    snr: 8.5 + (Math.random() - 0.5) * 0.4,
    packetLoss: +(0.2 + Math.random() * 0.3).toFixed(1),
    packetsSent: newSent,
    packetsReceived: newRcv,
    lastCommunication: '1s ago'
  };
}
