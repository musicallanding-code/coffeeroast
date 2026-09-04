import type { CurvePoint, RoastEventKind } from '@/db/types';

/** Grams as "1.2 kg" / "850 g". */
export function formatWeight(grams: number | null | undefined): string {
  if (grams == null) return '–';
  if (Math.abs(grams) >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} kg`;
  return `${Math.round(grams)} g`;
}

/** "mm:ss" from seconds. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

/** Rate of rise in °C per minute, from the last `windowSec` of bean-temp samples. */
export function rateOfRise(points: CurvePoint[], windowSec = 30): number | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1];
  let ref = points[0];
  for (let i = points.length - 1; i >= 0; i--) {
    if (last.tSec - points[i].tSec >= windowSec) {
      ref = points[i];
      break;
    }
  }
  const dt = last.tSec - ref.tSec;
  if (dt <= 0) return null;
  return ((last.beanTemp - ref.beanTemp) / dt) * 60;
}

/** Weight-loss percentage between green and roasted weight. */
export function weightLossPct(greenG?: number | null, roastedG?: number | null): number | null {
  if (!greenG || !roastedG || greenG <= 0) return null;
  return ((greenG - roastedG) / greenG) * 100;
}

/**
 * Development time ratio: time from first crack to drop, as a fraction of total
 * roast time. Typical target 0.15–0.25.
 */
export function developmentTimeRatio(
  firstCrackSec?: number | null,
  dropSec?: number | null,
): number | null {
  if (firstCrackSec == null || dropSec == null || dropSec <= 0 || firstCrackSec > dropSec) {
    return null;
  }
  return (dropSec - firstCrackSec) / dropSec;
}

export const EVENT_ORDER: RoastEventKind[] = [
  'turning_point',
  'dry_end',
  'first_crack',
  'second_crack',
  'drop',
];

/** Interpolate the bean temp at a given second from the recorded curve. */
export function tempAtSecond(points: CurvePoint[], tSec: number): number | null {
  if (points.length === 0) return null;
  if (tSec <= points[0].tSec) return points[0].beanTemp;
  const lastPoint = points[points.length - 1];
  if (tSec >= lastPoint.tSec) return lastPoint.beanTemp;
  for (let i = 1; i < points.length; i++) {
    if (points[i].tSec >= tSec) {
      const a = points[i - 1];
      const b = points[i];
      const f = (tSec - a.tSec) / (b.tSec - a.tSec);
      return a.beanTemp + f * (b.beanTemp - a.beanTemp);
    }
  }
  return lastPoint.beanTemp;
}
