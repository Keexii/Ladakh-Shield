import { SensorData, RiskAnalysis } from '../types/telemetry';

const SEVERITY_WEIGHT: Record<'NORMAL' | 'WARNING' | 'CRITICAL', number> = {
  NORMAL: 0,
  WARNING: 1,
  CRITICAL: 2
};

function upgradeSeverity(
  current: 'NORMAL' | 'WARNING' | 'CRITICAL',
  target: 'NORMAL' | 'WARNING' | 'CRITICAL'
): 'NORMAL' | 'WARNING' | 'CRITICAL' {
  return SEVERITY_WEIGHT[target] > SEVERITY_WEIGHT[current] ? target : current;
}

export function evaluateRisk(sensor: SensorData, isMosfetTripped: boolean = false): RiskAnalysis {
  const activeRules: string[] = [];
  let score = 0;
  let highestSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  const reasons: string[] = [];
  const actions: string[] = [];

  // Rule 1: Temperature evaluation (Ladakh high-altitude thermal range)
  if (sensor.temperature < -30) {
    activeRules.push('RULE-T01: Ambient temperature < -30°C (Deep Cold Freeze Risk)');
    reasons.push(`Extreme freezing temperature at ${sensor.temperature.toFixed(1)}°C poses severe risk to Li-ion electrolytes and avionics.`);
    actions.push('Execute full-power PTC heating pad & preheat battery pack immediately.');
    highestSeverity = upgradeSeverity(highestSeverity, 'CRITICAL');
    score += 45;
  } else if (sensor.temperature < -20) {
    activeRules.push('RULE-T02: Ambient temperature < -20°C (Low Temperature Advisory)');
    reasons.push(`Sub-zero environmental cold at ${sensor.temperature.toFixed(1)}°C is below standard electronics baseline.`);
    actions.push('Recommend auxiliary heating activation and battery insulation wrap.');
    highestSeverity = upgradeSeverity(highestSeverity, 'WARNING');
    score += 25;
  } else if (sensor.temperature > 55) {
    activeRules.push('RULE-T03: Operating temperature > 55°C (Thermal Runaway Hazard)');
    reasons.push(`Core electronics overheating at ${sensor.temperature.toFixed(1)}°C.`);
    actions.push('Emergency forced air cooling fan at 100% RPM; shed non-essential tactical loads.');
    highestSeverity = upgradeSeverity(highestSeverity, 'CRITICAL');
    score += 45;
  } else if (sensor.temperature > 45) {
    activeRules.push('RULE-T04: Operating temperature > 45°C (High Temperature Warning)');
    reasons.push(`Equipment operating temperature elevated to ${sensor.temperature.toFixed(1)}°C.`);
    actions.push('Engage cooling fan and verify heatsink airflow.');
    highestSeverity = upgradeSeverity(highestSeverity, 'WARNING');
    score += 20;
  }

  // Rule 2: Overcurrent & Electrical Load
  if (sensor.current >= 6.0 || isMosfetTripped) {
    activeRules.push('RULE-E01: Load Current >= 6.0A (Severe Overcurrent)');
    reasons.push(`Abnormal current surge detected (${sensor.current.toFixed(2)}A) - potential short-circuit or motor stall.`);
    actions.push('Solid-state MOSFET power isolation engaged. Inspect power rail and isolate faulted subsystem.');
    highestSeverity = upgradeSeverity(highestSeverity, 'CRITICAL');
    score += 50;
  } else if (sensor.current >= 4.5) {
    activeRules.push('RULE-E02: Load Current >= 4.5A (Elevated Current Warning)');
    reasons.push(`Load current at ${sensor.current.toFixed(2)}A exceeds continuous rating.`);
    actions.push('Reduce transmission burst rate and observe power trend.');
    highestSeverity = upgradeSeverity(highestSeverity, 'WARNING');
    score += 25;
  }

  // Rule 3: Bus Voltage & Battery Health
  if (sensor.voltage < 9.8) {
    activeRules.push('RULE-V01: Bus Voltage < 9.8V (Critical Undervoltage)');
    reasons.push(`Bus voltage has dropped to ${sensor.voltage.toFixed(2)}V (near cutoff threshold).`);
    actions.push('Initiate emergency power-save hibernation; preserve telemetry beacon.');
    highestSeverity = upgradeSeverity(highestSeverity, 'CRITICAL');
    score += 40;
  } else if (sensor.voltage < 10.8) {
    activeRules.push('RULE-V02: Bus Voltage < 10.8V (Low Battery Warning)');
    reasons.push(`Battery pack discharged to ${sensor.voltage.toFixed(2)}V (${sensor.batteryHealth}% remaining).`);
    actions.push('Prepare auxiliary power bank or schedule solar recharge window.');
    highestSeverity = upgradeSeverity(highestSeverity, 'WARNING');
    score += 20;
  }

  // Rule 4: Atmospheric Pressure (Ladakh high altitude effect)
  if (sensor.pressure < 48) {
    activeRules.push('RULE-P01: Pressure < 48 kPa (Extreme High Altitude > 5,500m)');
    reasons.push(`Barometric pressure ${sensor.pressure.toFixed(1)} kPa indicates rarefied atmosphere with reduced convective cooling.`);
    actions.push('Derate thermal cooling calculations by 35% due to thin air density.');
    highestSeverity = upgradeSeverity(highestSeverity, 'WARNING');
    score += 15;
  } else if (sensor.pressure < 54) {
    activeRules.push('RULE-P02: Pressure < 54 kPa (High Mountain Pass Altitude)');
    reasons.push(`Atmospheric pressure at ${sensor.pressure.toFixed(1)} kPa corresponds to 5,000m+ terrain.`);
    actions.push('Calibrate altimeter and check hermetic seal integrity.');
    score += 10;
  }

  // Compile final assessment
  if (highestSeverity === 'NORMAL') {
    return {
      level: 'NORMAL',
      score: Math.max(5, score),
      reason: 'All electrical, thermal, and barometric parameters within nominal high-altitude operational tolerances.',
      recommendedAction: 'Maintain standard telemetry polling cycle (every 2s). LoRa link healthy.',
      activeRules: ['RULE-NOM: System Operating Within Baseline High-Altitude Envelopes']
    };
  }

  return {
    level: highestSeverity,
    score: Math.min(100, score),
    reason: reasons.join(' | '),
    recommendedAction: actions.join(' | '),
    activeRules
  };
}
