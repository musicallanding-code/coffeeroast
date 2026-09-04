/**
 * Temperature-sensor abstraction. The live-roast screen only ever talks to this
 * interface, so Bluetooth / USB-serial / mock implementations are interchangeable.
 */

export type SensorReading = {
  /** milliseconds since epoch when the sample was taken */
  at: number;
  /** bean-probe temperature in °C */
  beanTemp: number;
  /** drum / environment probe temperature in °C, if the device has a 2nd probe */
  drumTemp?: number;
};

export type SensorStatus = 'idle' | 'connecting' | 'connected' | 'error';

export type SensorKind = 'mock' | 'ble' | 'webserial';

/** Turns a raw notification/line from a device into a reading (or null to skip). */
export type ReadingParser = (raw: Uint8Array | string) => Partial<SensorReading> | null;

export type ParserId = 'ascii-number' | 'ascii-bt-et' | 'artisan-csv' | 'int16-centi';

export type BleSensorConfig = {
  deviceId: string;
  deviceName?: string;
  serviceUuid: string;
  notifyCharUuid: string;
  parser: ParserId;
};

export type WebSerialSensorConfig = {
  baudRate: number;
  parser: ParserId;
};

export type SensorConfig = {
  kind: SensorKind;
  ble?: BleSensorConfig;
  webserial?: WebSerialSensorConfig;
};

export interface Sensor {
  readonly kind: SensorKind;
  readonly label: string;
  getStatus(): SensorStatus;
  /** Begin streaming. Resolves once connected (or immediately for mock). */
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  /** Subscribe to readings. Returns an unsubscribe function. */
  subscribe(listener: (reading: SensorReading) => void): () => void;
  subscribeStatus(listener: (status: SensorStatus) => void): () => void;
  /** Optional — only the mock simulator reacts to roaster controls. */
  applyControls?(gas: number, airflow: number): void;
}

export const DEFAULT_SENSOR_CONFIG: SensorConfig = { kind: 'mock' };
