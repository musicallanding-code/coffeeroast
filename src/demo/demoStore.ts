/**
 * In-memory data store used when Supabase is not configured, so the whole app is
 * a reviewable POC (populated lists, working create/edit flows within the session).
 * Changes do not persist across a reload.
 */
import { isSupabaseConfigured } from '@/lib/supabase';
import type {
  BlendRow,
  CurvePoint,
  GreenBeanInput,
  GreenBeanLotInput,
  GreenBeanLotRow,
  GreenBeanRow,
  GreenBeanStockRow,
  RoastBatchRow,
  RoastBatchWithBean,
  RoastedStockMoveRow,
  RoastedStockRow,
  SupplierInput,
  SupplierRow,
} from '@/db/types';
import { eventColumnsFromEvents } from '@/db/types';
import type { SaveRoastPayload } from '@/db/roasts';
import type { BlendComponentInput } from '@/db/blends';

import {
  demoBatches,
  demoBlends,
  demoCurves,
  demoGreenBeans,
  demoLots,
  demoRoastedMoves,
  demoSuppliers,
} from './demoData';

export const isDemoMode = !isSupabaseConfigured;

type BlendFull = BlendRow & {
  blend_components: {
    id: string;
    owner: string;
    blend_id: string;
    green_bean_id: string;
    parts: number;
    sort_order: number;
  }[];
};

const s = {
  beans: [...demoGreenBeans],
  suppliers: [...demoSuppliers],
  lots: [...demoLots],
  batches: [...demoBatches],
  curves: { ...demoCurves } as Record<string, { points: CurvePoint[]; events: any[] }>,
  moves: [...demoRoastedMoves],
  blends: demoBlends.map((b) => ({ ...b, blend_components: [...b.blend_components] })) as BlendFull[],
};

const OWNER = 'demo-user';
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const iso = () => new Date().toISOString();
const sortNewest = <T extends { created_at: string }>(a: T[]) =>
  [...a].sort((x, y) => y.created_at.localeCompare(x.created_at));

const beanRef = (id: string | null) => {
  const b = id ? s.beans.find((x) => x.id === id) : null;
  return b ? { id: b.id, name_zh: b.name_zh, name_en: b.name_en } : null;
};

export const demo = {
  // ── green beans ──────────────────────────────────────────────
  listGreenBeans: (): GreenBeanRow[] => sortNewest(s.beans.filter((b) => !b.archived)),
  getGreenBean: (id: string) => s.beans.find((b) => b.id === id) ?? null,
  listCountries: () => [],
  createGreenBean: (input: GreenBeanInput): GreenBeanRow => {
    const row: GreenBeanRow = {
      id: uid('b'),
      owner: OWNER,
      code: input.code ?? null,
      name_zh: input.name_zh,
      name_en: input.name_en ?? null,
      country_id: input.country_id ?? null,
      region: input.region ?? null,
      farm: input.farm ?? null,
      process: input.process ?? null,
      variety: input.variety ?? null,
      altitude: input.altitude ?? null,
      flavor_notes: input.flavor_notes ?? null,
      archived: false,
      created_at: iso(),
      updated_at: iso(),
    };
    s.beans.unshift(row);
    return row;
  },
  updateGreenBean: (id: string, input: GreenBeanInput): GreenBeanRow => {
    const i = s.beans.findIndex((b) => b.id === id);
    s.beans[i] = { ...s.beans[i], ...input, updated_at: iso() };
    return s.beans[i];
  },
  archiveGreenBean: (id: string) => {
    const b = s.beans.find((x) => x.id === id);
    if (b) b.archived = true;
  },

  // ── suppliers ────────────────────────────────────────────────
  listSuppliers: (): SupplierRow[] => [...s.suppliers].sort((a, b) => a.name.localeCompare(b.name)),
  getSupplier: (id: string) => s.suppliers.find((x) => x.id === id) ?? null,
  createSupplier: (input: SupplierInput): SupplierRow => {
    const row: SupplierRow = { id: uid('s'), owner: OWNER, name: input.name, contact: input.contact ?? null, phone: input.phone ?? null, address: input.address ?? null, note: input.note ?? null, created_at: iso() };
    s.suppliers.unshift(row);
    return row;
  },
  updateSupplier: (id: string, input: SupplierInput): SupplierRow => {
    const i = s.suppliers.findIndex((x) => x.id === id);
    s.suppliers[i] = { ...s.suppliers[i], ...input };
    return s.suppliers[i];
  },
  deleteSupplier: (id: string) => {
    s.suppliers = s.suppliers.filter((x) => x.id !== id);
  },

  // ── lots ─────────────────────────────────────────────────────
  listLots: (beanId: string): GreenBeanLotRow[] =>
    s.lots.filter((l) => l.green_bean_id === beanId).sort((a, b) => (b.purchased_on ?? '').localeCompare(a.purchased_on ?? '')),
  availableLots: (beanId: string) => s.lots.filter((l) => l.green_bean_id === beanId && l.qty_remaining_g > 0),
  lotWithSupplier: (l: GreenBeanLotRow) => ({
    ...l,
    suppliers: l.supplier_id ? (() => { const sup = s.suppliers.find((x) => x.id === l.supplier_id); return sup ? { id: sup.id, name: sup.name } : null; })() : null,
  }),
  createLot: (input: GreenBeanLotInput): GreenBeanLotRow => {
    const row: GreenBeanLotRow = { id: uid('l'), owner: OWNER, green_bean_id: input.green_bean_id, supplier_id: input.supplier_id ?? null, lot_code: input.lot_code ?? null, purchased_on: input.purchased_on ?? null, qty_in_g: input.qty_in_g, qty_remaining_g: input.qty_in_g, unit_price: input.unit_price ?? null, currency: input.currency ?? 'TWD', note: input.note ?? null, created_at: iso() };
    s.lots.unshift(row);
    return row;
  },
  adjustLot: (id: string, qty_remaining_g: number) => {
    const l = s.lots.find((x) => x.id === id);
    if (l) l.qty_remaining_g = qty_remaining_g;
    return l!;
  },
  deleteLot: (id: string) => {
    s.lots = s.lots.filter((x) => x.id !== id);
  },

  // ── stock views ──────────────────────────────────────────────
  greenBeanStock: (): GreenBeanStockRow[] =>
    s.beans
      .filter((b) => !b.archived)
      .map((b) => {
        const lots = s.lots.filter((l) => l.green_bean_id === b.id);
        return {
          green_bean_id: b.id,
          owner: OWNER,
          name_zh: b.name_zh,
          name_en: b.name_en,
          remaining_g: lots.reduce((n, l) => n + l.qty_remaining_g, 0),
          total_in_g: lots.reduce((n, l) => n + l.qty_in_g, 0),
          lot_count: lots.length,
        };
      })
      .sort((a, b) => b.remaining_g - a.remaining_g),
  roastedStock: (): RoastedStockRow[] => {
    const byBean = new Map<string, number>();
    s.moves.forEach((m) => {
      if (!m.green_bean_id) return;
      byBean.set(m.green_bean_id, (byBean.get(m.green_bean_id) ?? 0) + (m.direction === 'in' ? m.qty_g : -m.qty_g));
    });
    return [...byBean.entries()]
      .map(([green_bean_id, remaining_g]) => ({ green_bean_id, owner: OWNER, name_zh: s.beans.find((b) => b.id === green_bean_id)?.name_zh ?? null, remaining_g }))
      .sort((a, b) => b.remaining_g - a.remaining_g);
  },
  roastedMoves: (): RoastedStockMoveRow[] => sortNewest(s.moves),
  recordRoastedMove: (input: {
    batch_id: string | null;
    green_bean_id: string | null;
    direction: 'in' | 'out';
    qty_g: number;
    reason?: string | null;
    note?: string | null;
    moved_on?: string;
  }) => {
    s.moves.unshift({
      id: uid('m'),
      owner: OWNER,
      created_at: iso(),
      moved_on: input.moved_on ?? iso().slice(0, 10),
      batch_id: input.batch_id,
      green_bean_id: input.green_bean_id,
      direction: input.direction,
      qty_g: input.qty_g,
      reason: input.reason ?? null,
      note: input.note ?? null,
    });
  },

  // ── roasts ───────────────────────────────────────────────────
  listBatches: (): RoastBatchWithBean[] =>
    sortNewest(s.batches).map((b) => ({ ...b, green_beans: beanRef(b.green_bean_id) })),
  getBatch: (id: string): RoastBatchWithBean | null => {
    const b = s.batches.find((x) => x.id === id);
    return b ? { ...b, green_beans: beanRef(b.green_bean_id) } : null;
  },
  getCurve: (id: string): CurvePoint[] => s.curves[id]?.points ?? [],
  stats: () => ({ roasts: s.batches.length, beans: s.beans.filter((b) => !b.archived).length }),
  saveRoast: (payload: SaveRoastPayload): RoastBatchRow => {
    const id = uid('t');
    const d = new Date(payload.startedAt);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const drop = payload.events.find((e) => e.kind === 'drop');
    const row: RoastBatchRow = {
      id,
      owner: OWNER,
      batch_no: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`,
      green_bean_id: payload.beanId,
      green_bean_lot_id: payload.beanLotId,
      roaster_id: null,
      bean_name_snapshot: payload.beanName || null,
      status: 'completed',
      started_at: new Date(payload.startedAt).toISOString(),
      room_temp: null,
      charge_temp: payload.points[0]?.beanTemp ?? null,
      turning_point_sec: null, turning_point_temp: null,
      dry_end_sec: null, dry_end_temp: null,
      first_crack_sec: null, first_crack_temp: null,
      second_crack_sec: null, second_crack_temp: null,
      drop_sec: drop?.tSec ?? payload.points[payload.points.length - 1]?.tSec ?? null,
      drop_temp: null,
      weight_green_g: payload.greenWeightG,
      weight_roasted_g: payload.roastedWeightG,
      roast_level: payload.roastLevel,
      notes: payload.notes,
      created_at: iso(),
      updated_at: iso(),
      ...(eventColumnsFromEvents(payload.events) as Partial<RoastBatchRow>),
    } as RoastBatchRow;
    s.batches.unshift(row);
    s.curves[id] = { points: payload.points, events: payload.events };
    if (payload.beanLotId && payload.greenWeightG) {
      const l = s.lots.find((x) => x.id === payload.beanLotId);
      if (l) l.qty_remaining_g = Math.max(0, l.qty_remaining_g - payload.greenWeightG);
    }
    if (payload.roastedWeightG) {
      demo.recordRoastedMove({ batch_id: id, green_bean_id: payload.beanId, direction: 'in', qty_g: payload.roastedWeightG, reason: 'roast', note: null });
    }
    return row;
  },
  deleteBatch: (id: string) => {
    s.batches = s.batches.filter((x) => x.id !== id);
    delete s.curves[id];
  },

  // ── blends ───────────────────────────────────────────────────
  listBlends: () => sortNewest(s.blends.filter((b) => !b.archived)).map(withBeans),
  getBlend: (id: string) => { const b = s.blends.find((x) => x.id === id); return b ? withBeans(b) : null; },
  saveBlend: (input: { id?: string; name: string; note: string | null; components: BlendComponentInput[] }) => {
    let blend = input.id ? s.blends.find((b) => b.id === input.id) : undefined;
    if (blend) {
      blend.name = input.name;
      blend.note = input.note;
      blend.updated_at = iso();
    } else {
      blend = { id: uid('bl'), owner: OWNER, name: input.name, note: input.note, archived: false, created_at: iso(), updated_at: iso(), blend_components: [] };
      s.blends.unshift(blend);
    }
    blend.blend_components = input.components.map((c, i) => ({ id: uid('bc'), owner: OWNER, blend_id: blend!.id, green_bean_id: c.green_bean_id, parts: c.parts, sort_order: i }));
    return blend.id;
  },
  archiveBlend: (id: string) => {
    const b = s.blends.find((x) => x.id === id);
    if (b) b.archived = true;
  },
};

function withBeans(b: BlendFull) {
  return {
    ...b,
    blend_components: b.blend_components.map((c) => ({ ...c, green_beans: beanRef(c.green_bean_id) })),
  };
}
