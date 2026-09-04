/**
 * Seed data for the no-Supabase "demo / POC review" mode. Values mirror the
 * shape of the real Supabase rows so the UI renders exactly as it would live.
 */
import type {
  BlendRow,
  CurvePoint,
  GreenBeanLotRow,
  GreenBeanRow,
  RoastBatchRow,
  RoasterRow,
  RoastedStockMoveRow,
  RoastEvent,
  SupplierRow,
} from '@/db/types';

const OWNER = 'demo-user';
const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();
const dateAgo = (d: number) => new Date(now - d * 86400_000).toISOString().slice(0, 10);

export const demoSuppliers: SupplierRow[] = [
  { id: 's1', owner: OWNER, name: '源友企業', contact: '林小姐', phone: '02-2999-1234', address: '新北市中和區', note: '中南美 / 非洲豆為主', created_at: daysAgo(120) },
  { id: 's2', owner: OWNER, name: '謙品咖啡', contact: '陳先生', phone: '04-2251-6688', address: '台中市西屯區', note: null, created_at: daysAgo(90) },
  { id: 's3', owner: OWNER, name: '歐舍咖啡', contact: null, phone: null, address: '台中市南區', note: '競標批次', created_at: daysAgo(60) },
];

export const demoRoasters: RoasterRow[] = [
  { id: 'r1', owner: OWNER, name: 'Fuji Royal Discovery', batch_capacity_g: 250, note: '半熱風 250g', created_at: daysAgo(200) },
  { id: 'r2', owner: OWNER, name: 'KENT-500', batch_capacity_g: 500, note: null, created_at: daysAgo(200) },
];

export const demoGreenBeans: GreenBeanRow[] = [
  { id: 'b1', owner: OWNER, code: '0001', name_zh: '衣索比亞 耶加雪菲 孔加 水洗 G1', name_en: 'Ethiopia Yirgacheffe Konga Washed G1', country_id: null, region: '衣索比亞', farm: '孔加合作社', process: '水洗', variety: '原生種', altitude: '1,900–2,100 m', flavor_notes: '茉莉花、佛手柑、紅茶、檸檬酸質明亮、餘韻乾淨。', archived: false, created_at: daysAgo(80), updated_at: daysAgo(80) },
  { id: 'b2', owner: OWNER, code: '0002', name_zh: '肯亞 尼耶利 卡拉提娜 水洗 AA', name_en: 'Kenya Nyeri Karatina Washed AA', country_id: null, region: '肯亞', farm: '卡拉提娜處理廠', process: '水洗', variety: 'SL28 / SL34', altitude: '1,700–1,800 m', flavor_notes: '黑醋栗、番茄、蔗糖甜、厚實多汁。', archived: false, created_at: daysAgo(70), updated_at: daysAgo(70) },
  { id: 'b3', owner: OWNER, code: '0003', name_zh: '哥倫比亞 薇拉 聖阿德里安 日曬', name_en: 'Colombia Huila San Adrián Natural', country_id: null, region: '哥倫比亞', farm: '聖阿德里安莊園', process: '日曬', variety: 'Caturra', altitude: '1,650 m', flavor_notes: '草莓、蘭姆酒、黑糖、酒香濃郁。', archived: false, created_at: daysAgo(55), updated_at: daysAgo(55) },
  { id: 'b4', owner: OWNER, code: '0004', name_zh: '瓜地馬拉 薇薇特南果 茵赫特莊園 水洗', name_en: 'Guatemala Huehuetenango El Injerto Washed', country_id: null, region: '瓜地馬拉', farm: '茵赫特莊園', process: '水洗', variety: 'Bourbon', altitude: '1,550 m', flavor_notes: '焦糖、烤杏仁、可可、柑橘、body 飽滿。', archived: false, created_at: daysAgo(40), updated_at: daysAgo(40) },
  { id: 'b5', owner: OWNER, code: '0005', name_zh: '巴西 喜拉朵 黃波旁 去果皮日曬', name_en: 'Brazil Cerrado Yellow Bourbon Pulped Natural', country_id: null, region: '巴西', farm: '喜拉朵產區', process: '去果皮日曬', variety: 'Yellow Bourbon', altitude: '1,100 m', flavor_notes: '花生、牛奶巧克力、榛果、低酸滑順。', archived: false, created_at: daysAgo(30), updated_at: daysAgo(30) },
  { id: 'b6', owner: OWNER, code: '0006', name_zh: '印尼 蘇門答臘 曼特寧 三次手選 濕剝', name_en: 'Indonesia Sumatra Mandheling TP Wet-Hulled', country_id: null, region: '印尼', farm: '林東地區', process: '濕剝', variety: 'Ateng / Jember', altitude: '1,300 m', flavor_notes: '雪松、黑巧克力、藥草、泥土氣息、body 厚重。', archived: false, created_at: daysAgo(20), updated_at: daysAgo(20) },
];

export const demoLots: GreenBeanLotRow[] = [
  { id: 'l1', owner: OWNER, green_bean_id: 'b1', supplier_id: 's3', lot_code: 'YRG-KONGA-24A', purchased_on: dateAgo(75), qty_in_g: 30000, qty_remaining_g: 18400, unit_price: 640, currency: 'TWD', note: '麻袋 x1', created_at: daysAgo(75) },
  { id: 'l2', owner: OWNER, green_bean_id: 'b2', supplier_id: 's1', lot_code: 'KEN-KARATINA-AA', purchased_on: dateAgo(60), qty_in_g: 30000, qty_remaining_g: 6200, unit_price: 720, currency: 'TWD', note: null, created_at: daysAgo(60) },
  { id: 'l3', owner: OWNER, green_bean_id: 'b3', supplier_id: 's2', lot_code: 'COL-SANADRIAN-N', purchased_on: dateAgo(50), qty_in_g: 20000, qty_remaining_g: 320, unit_price: 560, currency: 'TWD', note: '快用完，需補貨', created_at: daysAgo(50) },
  { id: 'l4', owner: OWNER, green_bean_id: 'b4', supplier_id: 's1', lot_code: 'GT-INJERTO-W', purchased_on: dateAgo(35), qty_in_g: 30000, qty_remaining_g: 24500, unit_price: 520, currency: 'TWD', note: null, created_at: daysAgo(35) },
  { id: 'l5', owner: OWNER, green_bean_id: 'b5', supplier_id: 's1', lot_code: 'BR-CERRADO-YB', purchased_on: dateAgo(28), qty_in_g: 60000, qty_remaining_g: 41000, unit_price: 300, currency: 'TWD', note: '拼配基底', created_at: daysAgo(28) },
  { id: 'l6', owner: OWNER, green_bean_id: 'b6', supplier_id: 's2', lot_code: 'ID-MANDHELING-TP', purchased_on: dateAgo(18), qty_in_g: 30000, qty_remaining_g: 27500, unit_price: 480, currency: 'TWD', note: null, created_at: daysAgo(18) },
];

// ── roast curve generator ────────────────────────────────────────────────────
function makeCurve(opts: {
  chargeTemp: number;
  tpTemp: number;
  tpSec: number;
  fcSec: number;
  dropSec: number;
  dropTemp: number;
}): { points: CurvePoint[]; events: RoastEvent[] } {
  const { chargeTemp, tpTemp, tpSec, fcSec, dropSec, dropTemp } = opts;
  const points: CurvePoint[] = [];
  const smoothstep = (x: number) => x * x * (3 - 2 * x);
  for (let s = 0; s <= dropSec; s += 5) {
    let bean: number;
    if (s <= tpSec) {
      bean = chargeTemp + (tpTemp - chargeTemp) * smoothstep(s / tpSec);
    } else {
      const f = (s - tpSec) / (dropSec - tpSec);
      bean = tpTemp + (dropTemp - tpTemp) * Math.pow(f, 0.72);
    }
    const drum = 175 + 55 * Math.min(1, s / 180) + Math.sin(s / 25) * 3;
    points.push({
      tSec: s,
      beanTemp: Math.round((bean + (Math.random() - 0.5) * 0.5) * 10) / 10,
      drumTemp: Math.round(drum * 10) / 10,
      gas: s < 60 ? 8 : s < fcSec ? 6 : 3.5,
      airflow: s < tpSec ? 3 : 5,
    });
  }
  const tempAt = (sec: number) => {
    const p = points.reduce((a, b) => (Math.abs(b.tSec - sec) < Math.abs(a.tSec - sec) ? b : a));
    return p.beanTemp;
  };
  const events: RoastEvent[] = [
    { kind: 'turning_point', tSec: tpSec, temp: Math.round(tempAt(tpSec)) },
    { kind: 'dry_end', tSec: Math.round(fcSec * 0.62), temp: Math.round(tempAt(fcSec * 0.62)) },
    { kind: 'first_crack', tSec: fcSec, temp: Math.round(tempAt(fcSec)) },
    { kind: 'drop', tSec: dropSec, temp: dropTemp },
  ];
  return { points, events };
}

const curveConfigs: Record<string, Parameters<typeof makeCurve>[0]> = {
  t1: { chargeTemp: 192, tpTemp: 91, tpSec: 75, fcSec: 585, dropSec: 690, dropTemp: 205 },
  t2: { chargeTemp: 198, tpTemp: 96, tpSec: 82, fcSec: 640, dropSec: 812, dropTemp: 214 },
  t3: { chargeTemp: 188, tpTemp: 89, tpSec: 70, fcSec: 540, dropSec: 636, dropTemp: 201 },
};

export const demoCurves: Record<string, { points: CurvePoint[]; events: RoastEvent[] }> = {
  t1: makeCurve(curveConfigs.t1),
  t2: makeCurve(curveConfigs.t2),
  t3: makeCurve(curveConfigs.t3),
};

function batch(
  id: string,
  beanId: string,
  daysBack: number,
  level: string,
  greenG: number,
  roastedG: number,
  curveKey: keyof typeof demoCurves | null,
): RoastBatchRow {
  const c = curveKey ? demoCurves[curveKey] : null;
  const ev = (k: RoastEvent['kind']) => c?.events.find((e) => e.kind === k);
  const d = new Date(now - daysBack * 86400_000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    id,
    owner: OWNER,
    batch_no: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`,
    green_bean_id: beanId,
    green_bean_lot_id: null,
    roaster_id: 'r1',
    bean_name_snapshot: demoGreenBeans.find((b) => b.id === beanId)?.name_zh ?? null,
    status: 'completed',
    started_at: daysAgo(daysBack),
    room_temp: 27,
    charge_temp: c?.points[0]?.beanTemp ?? null,
    turning_point_sec: ev('turning_point')?.tSec ?? null,
    turning_point_temp: ev('turning_point')?.temp ?? null,
    dry_end_sec: ev('dry_end')?.tSec ?? null,
    dry_end_temp: ev('dry_end')?.temp ?? null,
    first_crack_sec: ev('first_crack')?.tSec ?? null,
    first_crack_temp: ev('first_crack')?.temp ?? null,
    second_crack_sec: null,
    second_crack_temp: null,
    drop_sec: ev('drop')?.tSec ?? null,
    drop_temp: ev('drop')?.temp ?? null,
    weight_green_g: greenG,
    weight_roasted_g: roastedG,
    roast_level: level,
    notes: curveKey === 't1' ? '一爆後拉長發展，甜感集中。' : null,
    created_at: daysAgo(daysBack),
    updated_at: daysAgo(daysBack),
  };
}

export const demoBatches: RoastBatchRow[] = [
  batch('t1', 'b1', 2, '淺焙', 220, 187, 't1'),
  batch('t2', 'b2', 4, '中焙', 220, 184, 't2'),
  batch('t3', 'b4', 6, '中淺焙', 220, 188, 't3'),
  batch('t4', 'b3', 9, '中深焙', 220, 181, null),
  batch('t5', 'b5', 12, '中焙', 250, 212, null),
  batch('t6', 'b1', 15, '淺焙', 220, 186, null),
  batch('t7', 'b6', 19, '深焙', 250, 205, null),
];

export const demoRoastedMoves: RoastedStockMoveRow[] = [
  { id: 'm1', owner: OWNER, batch_id: 't1', green_bean_id: 'b1', moved_on: dateAgo(2), direction: 'in', qty_g: 187, reason: 'roast', note: null, created_at: daysAgo(2) },
  { id: 'm2', owner: OWNER, batch_id: 't2', green_bean_id: 'b2', moved_on: dateAgo(4), direction: 'in', qty_g: 184, reason: 'roast', note: null, created_at: daysAgo(4) },
  { id: 'm3', owner: OWNER, batch_id: null, green_bean_id: 'b1', moved_on: dateAgo(1), direction: 'out', qty_g: 100, reason: '售出', note: '門市', created_at: daysAgo(1) },
  { id: 'm4', owner: OWNER, batch_id: null, green_bean_id: 'b2', moved_on: dateAgo(3), direction: 'out', qty_g: 50, reason: '樣品', note: null, created_at: daysAgo(3) },
];

export const demoBlends: (BlendRow & { blend_components: { id: string; owner: string; blend_id: string; green_bean_id: string; parts: number; sort_order: number }[] })[] = [
  {
    id: 'bl1',
    owner: OWNER,
    name: '晨光義式配方',
    note: '巴西打底、瓜地馬拉增厚度、耶加提香。適合牛奶飲品。',
    archived: false,
    created_at: daysAgo(25),
    updated_at: daysAgo(25),
    blend_components: [
      { id: 'bc1', owner: OWNER, blend_id: 'bl1', green_bean_id: 'b5', parts: 5, sort_order: 0 },
      { id: 'bc2', owner: OWNER, blend_id: 'bl1', green_bean_id: 'b4', parts: 3, sort_order: 1 },
      { id: 'bc3', owner: OWNER, blend_id: 'bl1', green_bean_id: 'b1', parts: 2, sort_order: 2 },
    ],
  },
  {
    id: 'bl2',
    owner: OWNER,
    name: '果香手沖綜合',
    note: '肯亞 + 哥倫比亞日曬，明亮多汁。',
    archived: false,
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    blend_components: [
      { id: 'bc4', owner: OWNER, blend_id: 'bl2', green_bean_id: 'b2', parts: 1, sort_order: 0 },
      { id: 'bc5', owner: OWNER, blend_id: 'bl2', green_bean_id: 'b3', parts: 1, sort_order: 1 },
    ],
  },
];
