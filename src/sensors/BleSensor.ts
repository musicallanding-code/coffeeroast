import { base64ToBytes, getBleManager } from './ble';
import { LineBuffer, PARSERS } from './parsers';
import type { BleSensorConfig, Sensor, SensorReading, SensorStatus } from './types';

/**
 * Streams from a BLE peripheral's notify characteristic. Requires a custom dev
 * build (react-native-ble-plx is unavailable in Expo Go).
 */
export class BleSensor implements Sensor {
  readonly kind = 'ble' as const;
  readonly label = '藍牙探針';

  private status: SensorStatus = 'idle';
  private manager: any = null;
  private device: any = null;
  private sub: { remove: () => void } | null = null;
  private lines = new LineBuffer();
  private last: Partial<SensorReading> = {};

  private readingListeners = new Set<(r: SensorReading) => void>();
  private statusListeners = new Set<(s: SensorStatus) => void>();

  constructor(private readonly config: BleSensorConfig) {}

  getStatus() {
    return this.status;
  }

  async connect() {
    this.setStatus('connecting');
    try {
      this.manager = await getBleManager();
      if (!this.manager) throw new Error('BLE 不可用');
      const device = await this.manager.connectToDevice(this.config.deviceId, { timeout: 10000 });
      await device.discoverAllServicesAndCharacteristics();
      this.device = device;

      this.sub = device.monitorCharacteristicForService(
        this.config.serviceUuid,
        this.config.notifyCharUuid,
        (error: any, characteristic: any) => {
          if (error || !characteristic?.value) return;
          this.handleChunk(base64ToBytes(characteristic.value));
        },
      );
      this.disconnectSub = this.manager.onDeviceDisconnected(this.config.deviceId, () => {
        if (this.status === 'connected') this.setStatus('error');
      });
      this.setStatus('connected');
    } catch (e) {
      this.setStatus('error');
      throw e;
    }
  }

  private disconnectSub: { remove: () => void } | null = null;

  async disconnect() {
    this.sub?.remove();
    this.sub = null;
    this.disconnectSub?.remove();
    this.disconnectSub = null;
    try {
      if (this.device) await this.manager?.cancelDeviceConnection(this.config.deviceId);
    } catch {
      // ignore
    }
    this.device = null;
    this.setStatus('idle');
  }

  subscribe(listener: (r: SensorReading) => void) {
    this.readingListeners.add(listener);
    return () => this.readingListeners.delete(listener);
  }

  subscribeStatus(listener: (s: SensorStatus) => void) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(s: SensorStatus) {
    this.status = s;
    this.statusListeners.forEach((l) => l(s));
  }

  private handleChunk(bytes: Uint8Array) {
    const parse = PARSERS[this.config.parser];
    if (this.config.parser === 'int16-centi') {
      this.emitPartial(parse(bytes));
      return;
    }
    for (const line of this.lines.push(bytes)) {
      this.emitPartial(parse(line));
    }
  }

  private emitPartial(partial: Partial<SensorReading> | null) {
    if (!partial) return;
    this.last = { ...this.last, ...partial };
    if (this.last.beanTemp == null) return;
    const reading: SensorReading = {
      at: partial.at ?? Date.now(),
      beanTemp: this.last.beanTemp,
      drumTemp: this.last.drumTemp,
    };
    this.readingListeners.forEach((l) => l(reading));
  }
}
