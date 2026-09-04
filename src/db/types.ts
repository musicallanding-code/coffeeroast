/** App-facing domain types + row shapes for Supabase tables. */

export type RoastEventKind =
  | 'turning_point'
  | 'dry_end'
  | 'first_crack'
  | 'second_crack'
  | 'drop';

export type RoastStatus = 'roasting' | 'completed';

export type CurvePoint = {
  tSec: number;
  beanTemp: number;
  drumTemp?: number | null;
  gas?: number | null;
  airflow?: number | null;
};

export type RoastEvent = {
  kind: RoastEventKind;
  tSec: number;
  temp: number | null;
};

// ─── Supabase row shapes ────────────────────────────────────────────────────

export type ProfileRow = {
  id: string;
  display_name: string | null;
  locale: string;
  created_at: string;
};

export type CountryRow = {
  id: string;
  owner: string;
  name_zh: string;
  name_en: string | null;
  note: string | null;
  created_at: string;
};

export type GreenBeanRow = {
  id: string;
  owner: string;
  code: string | null;
  name_zh: string;
  name_en: string | null;
  country_id: string | null;
  region: string | null;
  farm: string | null;
  process: string | null;
  variety: string | null;
  altitude: string | null;
  flavor_notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type GreenBeanInput = {
  code?: string | null;
  name_zh: string;
  name_en?: string | null;
  country_id?: string | null;
  region?: string | null;
  farm?: string | null;
  process?: string | null;
  variety?: string | null;
  altitude?: string | null;
  flavor_notes?: string | null;
};

export type RoasterRow = {
  id: string;
  owner: string;
  name: string;
  batch_capacity_g: number | null;
  note: string | null;
  created_at: string;
};

export type RoastBatchRow = {
  id: string;
  owner: string;
  batch_no: string | null;
  green_bean_id: string | null;
  green_bean_lot_id: string | null;
  roaster_id: string | null;
  bean_name_snapshot: string | null;
  status: RoastStatus;
  started_at: string;
  room_temp: number | null;
  charge_temp: number | null;
  turning_point_sec: number | null;
  turning_point_temp: number | null;
  dry_end_sec: number | null;
  dry_end_temp: number | null;
  first_crack_sec: number | null;
  first_crack_temp: number | null;
  second_crack_sec: number | null;
  second_crack_temp: number | null;
  drop_sec: number | null;
  drop_temp: number | null;
  weight_green_g: number | null;
  weight_roasted_g: number | null;
  roast_level: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RoastCurvePointRow = {
  id: number;
  owner: string;
  batch_id: string;
  t_sec: number;
  bean_temp: number | null;
  drum_temp: number | null;
  gas: number | null;
  airflow: number | null;
};

export type RoastBatchWithBean = RoastBatchRow & {
  green_beans: Pick<GreenBeanRow, 'id' | 'name_zh' | 'name_en'> | null;
};

// ─── mappers ────────────────────────────────────────────────────────────────

export function eventColumnsFromEvents(events: RoastEvent[]) {
  const pick = (kind: RoastEventKind) => events.find((e) => e.kind === kind);
  const cols: Partial<RoastBatchRow> = {};
  (['turning_point', 'dry_end', 'first_crack', 'second_crack', 'drop'] as RoastEventKind[]).forEach(
    (kind) => {
      const ev = pick(kind);
      const prefix =
        kind === 'turning_point'
          ? 'turning_point'
          : kind === 'dry_end'
            ? 'dry_end'
            : kind === 'first_crack'
              ? 'first_crack'
              : kind === 'second_crack'
                ? 'second_crack'
                : 'drop';
      (cols as Record<string, number | null>)[`${prefix}_sec`] = ev ? ev.tSec : null;
      (cols as Record<string, number | null>)[`${prefix}_temp`] = ev ? ev.temp : null;
    },
  );
  return cols;
}

export function eventsFromBatch(batch: RoastBatchRow): RoastEvent[] {
  const out: RoastEvent[] = [];
  const add = (kind: RoastEventKind, sec: number | null, temp: number | null) => {
    if (sec != null) out.push({ kind, tSec: sec, temp });
  };
  add('turning_point', batch.turning_point_sec, batch.turning_point_temp);
  add('dry_end', batch.dry_end_sec, batch.dry_end_temp);
  add('first_crack', batch.first_crack_sec, batch.first_crack_temp);
  add('second_crack', batch.second_crack_sec, batch.second_crack_temp);
  add('drop', batch.drop_sec, batch.drop_temp);
  return out;
}

export function curvePointsFromRows(rows: RoastCurvePointRow[]): CurvePoint[] {
  return rows
    .map((r) => ({
      tSec: r.t_sec,
      beanTemp: r.bean_temp ?? 0,
      drumTemp: r.drum_temp,
      gas: r.gas,
      airflow: r.airflow,
    }))
    .sort((a, b) => a.tSec - b.tSec);
}
