import { LineBuffer, PARSERS } from './parsers';
import type { Sensor, SensorReading, SensorStatus, WebSerialSensorConfig } from './types';

/** Web Serial API — works in Chrome/Edge on desktop (the Windows/PWA target). */
export function isWebSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

/** Prompt the user to grant access to a serial port (must be a user gesture). */
export async function requestSerialPort(): Promise<boolean> {
  if (!isWebSerialSupported()) return false;
  try {
    await (navigator as any).serial.requestPort();
    return true;
  } catch {
    return false;
  }
}

export class WebSerialSensor implements Sensor {
  readonly kind = 'webserial' as const;
  readonly label = 'USB 序列埠';

  private status: SensorStatus = 'idle';
  private port: any = null;
  private reader: any = null;
  private closed = false;
  private lines = new LineBuffer();
  private last: Partial<SensorReading> = {};

  private readingListeners = new Set<(r: SensorReading) => void>();
  private statusListeners = new Set<(s: SensorStatus) => void>();

  constructor(private readonly config: WebSerialSensorConfig) {}

  getStatus() {
    return this.status;
  }

  async connect() {
    if (!isWebSerialSupported()) throw new Error('此瀏覽器不支援 Web Serial（請用桌面版 Chrome / Edge）。');
    this.setStatus('connecting');
    try {
      const serial = (navigator as any).serial;
      const granted: any[] = await serial.getPorts();
      this.port = granted[0] ?? (await serial.requestPort());
      await this.port.open({ baudRate: this.config.baudRate });
      this.closed = false;
      this.setStatus('connected');
      this.readLoop();
    } catch (e) {
      this.setStatus('error');
      throw e;
    }
  }

  private async readLoop() {
    while (!this.closed && this.port?.readable) {
      this.reader = this.port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) this.handleChunk(value as Uint8Array);
        }
      } catch {
        // stream error — fall through to release and retry unless closed
      } finally {
        try {
          this.reader.releaseLock();
        } catch {
          /* noop */
        }
      }
      if (!this.closed) await new Promise((r) => setTimeout(r, 200));
    }
  }

  async disconnect() {
    this.closed = true;
    try {
      await this.reader?.cancel();
    } catch {
      /* noop */
    }
    try {
      await this.port?.close();
    } catch {
      /* noop */
    }
    this.port = null;
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
    for (const line of this.lines.push(bytes)) this.emitPartial(parse(line));
  }

  private emitPartial(partial: Partial<SensorReading> | null) {
    if (!partial) return;
    this.last = { ...this.last, ...partial };
    if (this.last.beanTemp == null) return;
    this.readingListeners.forEach((l) =>
      l({ at: partial.at ?? Date.now(), beanTemp: this.last.beanTemp!, drumTemp: this.last.drumTemp }),
    );
  }
}
