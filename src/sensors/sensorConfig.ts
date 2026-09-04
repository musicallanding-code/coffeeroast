import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SENSOR_CONFIG, type SensorConfig } from './types';

const KEY = 'coffeeroast:sensorConfig';

export async function loadSensorConfig(): Promise<SensorConfig> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SENSOR_CONFIG;
    const parsed = JSON.parse(raw) as SensorConfig;
    if (parsed && (parsed.kind === 'mock' || parsed.kind === 'ble' || parsed.kind === 'webserial')) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return DEFAULT_SENSOR_CONFIG;
}

export async function saveSensorConfig(config: SensorConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    // ignore persistence failures
  }
}

export const DEFAULT_BLE_UUIDS = {
  // Nordic UART Service — a common default for hobby temperature bridges.
  serviceUuid: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  notifyCharUuid: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
};
