/**
 * Temperature-sensor abstraction. The live-roast screen only ever talks to this
 * interface, so a Bluetooth (react-native-ble-plx) or USB-serial implementation
 * can drop in later without touching UI code.
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

export type SensorKind = 'mock' | 'ble' | 'usb';

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
}
