import { SensorData, ProtectionState, AlertItem } from '../types/telemetry';

export function updateAdaptiveProtection(
  currentProtection: ProtectionState,
  sensor: SensorData,
  nowIsoString: string
): { updatedProtection: ProtectionState; newAlert?: AlertItem } {
  let updated = { ...currentProtection };
  let newAlert: AlertItem | undefined = undefined;

  // 1. ADAPTIVE HEATER CONTROL
  if (updated.heater.mode === 'AUTO') {
    if (sensor.temperature < -20) {
      const powerPct = Math.min(100, Math.round(50 + Math.abs(sensor.temperature - -20) * 4));
      if (!updated.heater.status || updated.heater.powerPercentage !== powerPct) {
        updated.heater = {
          ...updated.heater,
          status: true,
          powerPercentage: powerPct,
          reason: `Auto Trigger: Ambient temp (${sensor.temperature.toFixed(1)}°C) < -20°C cold threshold`,
          lastActivation: nowIsoString
        };
      }
    } else if (sensor.temperature >= -15 && updated.heater.status) {
      // Hysteresis at -15°C to avoid rapid cycling
      updated.heater = {
        ...updated.heater,
        status: false,
        powerPercentage: 0,
        reason: `Auto Standby: Temp recovered to ${sensor.temperature.toFixed(1)}°C (>= -15°C hysteresis)`,
        lastActivation: nowIsoString
      };
    }
  }

  // 2. ADAPTIVE COOLING FAN CONTROL
  if (updated.coolingFan.mode === 'AUTO') {
    if (sensor.temperature > 45) {
      const calculatedRpm = Math.min(5200, Math.round(2800 + (sensor.temperature - 45) * 160));
      if (!updated.coolingFan.status || updated.coolingFan.rpm !== calculatedRpm) {
        updated.coolingFan = {
          ...updated.coolingFan,
          status: true,
          rpm: calculatedRpm,
          reason: `Auto Trigger: Internal temp (${sensor.temperature.toFixed(1)}°C) > 45°C safe limit`,
          lastActivation: nowIsoString
        };
      }
    } else if (sensor.temperature <= 40 && updated.coolingFan.status) {
      // Hysteresis at 40°C
      updated.coolingFan = {
        ...updated.coolingFan,
        status: false,
        rpm: 0,
        reason: `Auto Standby: Thermal baseline restored (${sensor.temperature.toFixed(1)}°C <= 40°C)`,
        lastActivation: nowIsoString
      };
    }
  }

  // 3. OVERCURRENT MOSFET PROTECTION
  if (sensor.current >= 6.0 && !updated.powerProtection.tripped) {
    updated.powerProtection = {
      ...updated.powerProtection,
      status: true, // tripped
      tripped: true,
      reason: `MOSFET ISOLATION: Current spike detected at ${sensor.current.toFixed(2)}A (Limit: 6.0A)`,
      lastActivation: nowIsoString
    };

    newAlert = {
      id: `alert-mosfet-${Date.now()}`,
      severity: 'CRITICAL',
      title: 'MOSFET Power Protection Tripped',
      message: `Automatic solid-state circuit breaker engaged. Current draw exceeded 6.0A (${sensor.current.toFixed(2)}A). Load shed executed.`,
      timestamp: nowIsoString.slice(11, 19),
      equipment: 'SYSTEM',
      acknowledged: false
    };
  }

  return { updatedProtection: updated, newAlert };
}
