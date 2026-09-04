import { create } from 'zustand';

import type { CurvePoint, RoastEvent, RoastEventKind } from '@/db/types';
import type { SensorReading } from '@/sensors/types';

export type SessionConfig = {
  beanId: string | null;
  beanName: string;
  greenWeightG: number | null;
  roasterName: string;
};

export type SessionStatus = 'idle' | 'running' | 'finished';

type SessionState = {
  status: SessionStatus;
  config: SessionConfig;
  startedAt: number | null;
  elapsedSec: number;
  points: CurvePoint[];
  events: RoastEvent[];
  gas: number;
  airflow: number;
  latestBeanTemp: number | null;
  latestDrumTemp: number | null;

  begin: (config: SessionConfig) => void;
  ingest: (reading: SensorReading) => void;
  setControls: (next: { gas?: number; airflow?: number }) => void;
  mark: (kind: RoastEventKind) => void;
  unmark: (kind: RoastEventKind) => void;
  finish: () => void;
  reset: () => void;
};

const initialConfig: SessionConfig = {
  beanId: null,
  beanName: '',
  greenWeightG: null,
  roasterName: '',
};

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  config: initialConfig,
  startedAt: null,
  elapsedSec: 0,
  points: [],
  events: [],
  gas: 6,
  airflow: 5,
  latestBeanTemp: null,
  latestDrumTemp: null,

  begin: (config) =>
    set({
      status: 'running',
      config,
      startedAt: Date.now(),
      elapsedSec: 0,
      points: [],
      events: [],
      gas: 6,
      airflow: 5,
      latestBeanTemp: null,
      latestDrumTemp: null,
    }),

  ingest: (reading) => {
    const { status, startedAt, points } = get();
    if (status !== 'running' || startedAt == null) return;
    const tSec = Math.round((reading.at - startedAt) / 1000);
    const last = points[points.length - 1];
    const point: CurvePoint = {
      tSec,
      beanTemp: reading.beanTemp,
      drumTemp: reading.drumTemp ?? null,
      gas: get().gas,
      airflow: get().airflow,
    };
    const nextPoints = last && last.tSec === tSec ? [...points.slice(0, -1), point] : [...points, point];
    set({
      points: nextPoints,
      elapsedSec: tSec,
      latestBeanTemp: reading.beanTemp,
      latestDrumTemp: reading.drumTemp ?? null,
    });
  },

  setControls: ({ gas, airflow }) =>
    set((s) => ({
      gas: gas ?? s.gas,
      airflow: airflow ?? s.airflow,
    })),

  mark: (kind) => {
    const { events, elapsedSec, latestBeanTemp } = get();
    const filtered = events.filter((e) => e.kind !== kind);
    set({
      events: [...filtered, { kind, tSec: elapsedSec, temp: latestBeanTemp }].sort(
        (a, b) => a.tSec - b.tSec,
      ),
    });
  },

  unmark: (kind) => set((s) => ({ events: s.events.filter((e) => e.kind !== kind) })),

  finish: () => {
    const { events, elapsedSec, latestBeanTemp } = get();
    const withDrop = events.some((e) => e.kind === 'drop')
      ? events
      : [...events, { kind: 'drop' as const, tSec: elapsedSec, temp: latestBeanTemp }].sort(
          (a, b) => a.tSec - b.tSec,
        );
    set({ status: 'finished', events: withDrop });
  },

  reset: () =>
    set({
      status: 'idle',
      config: initialConfig,
      startedAt: null,
      elapsedSec: 0,
      points: [],
      events: [],
      gas: 6,
      airflow: 5,
      latestBeanTemp: null,
      latestDrumTemp: null,
    }),
}));
