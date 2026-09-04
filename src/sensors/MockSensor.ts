import { t } from '@/i18n/zh-TW';

import type { Sensor, SensorReading, SensorStatus } from './types';

export type MockSensorOptions = {
  tickMs?: number;
  chargeTemp?: number;
  turningPointTemp?: number;
  turningPointSec?: number;
  ceilingTemp?: number;
};

/**
 * Simulates a drum-roaster bean probe + drum probe. The curve shape is modelled
 * on the legacy app's recorded data: a sharp post-charge dip to a turning point
 * near ~95 °C around 70 s, then a rise with a steadily falling rate that is
 * scaled by the current gas setting.
 */
export class MockSensor implements Sensor {
  readonly kind = 'mock' as const;
  readonly label = t.roast.sensorMock;

  private readonly tickMs: number;
  private readonly chargeTemp: number;
  private readonly tpTemp: number;
  private readonly tpSec: number;
  private readonly ceiling: number;

  private status: SensorStatus = 'idle';
  private timer: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private lastTick = 0;
  private beanTemp = 0;
  private drumTemp = 0;
  private gas = 6;
  private airflow = 5;

  private readingListeners = new Set<(r: SensorReading) => void>();
  private statusListeners = new Set<(s: SensorStatus) => void>();

  constructor(opts: MockSensorOptions = {}) {
    this.tickMs = opts.tickMs ?? 1000;
    this.chargeTemp = opts.chargeTemp ?? 190;
    this.tpTemp = opts.turningPointTemp ?? 94;
    this.tpSec = opts.turningPointSec ?? 80;
    this.ceiling = opts.ceilingTemp ?? 235;
  }

  getStatus() {
    return this.status;
  }

  /** Roaster controls (0–10). Affects how fast the bean temp climbs. */
  applyControls(gas: number, airflow: number) {
    this.gas = clamp(gas, 0, 10);
    this.airflow = clamp(airflow, 0, 10);
  }

  async connect() {
    if (this.timer) return;
    this.setStatus('connecting');
    this.startedAt = Date.now();
    this.lastTick = this.startedAt;
    this.beanTemp = this.chargeTemp;
    this.drumTemp = this.chargeTemp + 40;
    this.setStatus('connected');
    this.emitReading();
    this.timer = setInterval(() => this.tick(), this.tickMs);
  }

  async disconnect() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
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

  private tick() {
    const now = Date.now();
    const dt = Math.max(0.001, (now - this.lastTick) / 1000);
    this.lastTick = now;
    const elapsed = (now - this.startedAt) / 1000;

    if (elapsed <= this.tpSec) {
      // Deterministic dip toward the turning point (function of wall-clock elapsed,
      // so a throttled/backgrounded timer can't drift the curve).
      const frac = clamp(elapsed / this.tpSec, 0, 1);
      const eased = frac * frac * (3 - 2 * frac); // smoothstep
      this.beanTemp = this.chargeTemp + (this.tpTemp - this.chargeTemp) * eased;
    } else {
      const headroom = clamp((this.ceiling - this.beanTemp) / (this.ceiling - this.tpTemp), 0, 1);
      const gasFactor = this.gas / 6;
      const airDrag = 1 - (this.airflow - 5) * 0.03;
      const ratePerSec = 0.25 * gasFactor * airDrag * Math.sqrt(headroom); // °C/s
      this.beanTemp += ratePerSec * dt;
    }
    this.beanTemp += (Math.random() - 0.5) * 0.15;

    // Drum probe: chases a gas-driven setpoint and wobbles with burner cycling.
    const drumSet = 150 + this.gas * 12 - this.airflow * 2;
    this.drumTemp += ((drumSet - this.drumTemp) / 45) * dt;
    this.drumTemp += Math.sin(elapsed / 7) * 0.6 + (Math.random() - 0.5) * 0.3;

    this.emitReading();
  }

  private emitReading() {
    const reading: SensorReading = {
      at: Date.now(),
      beanTemp: round1(this.beanTemp),
      drumTemp: round1(this.drumTemp),
    };
    this.readingListeners.forEach((l) => l(reading));
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
