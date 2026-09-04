import { BleSensor } from './BleSensor';
import { MockSensor } from './MockSensor';
import { WebSerialSensor } from './WebSerialSensor';
import type { Sensor, SensorConfig } from './types';

/** Build a fresh Sensor instance for a roast session from the saved config. */
export function createSensor(config: SensorConfig): Sensor {
  if (config.kind === 'ble' && config.ble) return new BleSensor(config.ble);
  if (config.kind === 'webserial' && config.webserial) return new WebSerialSensor(config.webserial);
  return new MockSensor();
}
