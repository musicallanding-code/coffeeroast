import type { ParserId, ReadingParser, SensorReading } from './types';

const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

function toText(raw: Uint8Array | string): string {
  if (typeof raw === 'string') return raw;
  if (decoder) return decoder.decode(raw);
  let s = '';
  for (let i = 0; i < raw.length; i++) s += String.fromCharCode(raw[i]);
  return s;
}

/** A single decimal number = bean temp (°C). e.g. "198.5\r\n" */
const asciiNumber: ReadingParser = (raw) => {
  const m = toText(raw).match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  return { at: Date.now(), beanTemp: parseFloat(m[0]) };
};

/** "BT:198.5,ET:210.1" style — labelled bean / environment temps. */
const asciiBtEt: ReadingParser = (raw) => {
  const text = toText(raw);
  const bt = text.match(/\bBT[:=]\s*(-?\d+(?:\.\d+)?)/i);
  const et = text.match(/\bET[:=]\s*(-?\d+(?:\.\d+)?)/i);
  if (!bt && !et) return null;
  const out: Partial<SensorReading> = { at: Date.now() };
  if (bt) out.beanTemp = parseFloat(bt[1]);
  if (et) out.drumTemp = parseFloat(et[1]);
  return out.beanTemp == null && out.drumTemp == null ? null : out;
};

/** Artisan-style CSV line: time,ET,BT[,...]. Uses fields 2 & 3. */
const artisanCsv: ReadingParser = (raw) => {
  const parts = toText(raw).trim().split(/[;,\t]/);
  if (parts.length < 3) return null;
  const et = parseFloat(parts[1]);
  const bt = parseFloat(parts[2]);
  if (Number.isNaN(bt)) return null;
  return { at: Date.now(), beanTemp: bt, drumTemp: Number.isNaN(et) ? undefined : et };
};

/** 2-byte signed int, hundredths of a degree, big-endian. */
const int16Centi: ReadingParser = (raw) => {
  if (typeof raw === 'string' || raw.length < 2) return null;
  const v = ((raw[0] << 8) | raw[1]) << 16;
  return { at: Date.now(), beanTemp: v / 65536 / 100 };
};

export const PARSERS: Record<ParserId, ReadingParser> = {
  'ascii-number': asciiNumber,
  'ascii-bt-et': asciiBtEt,
  'artisan-csv': artisanCsv,
  'int16-centi': int16Centi,
};

export const PARSER_LABELS: Record<ParserId, string> = {
  'ascii-number': '純數字（豆溫）',
  'ascii-bt-et': '「BT:… ET:…」文字',
  'artisan-csv': 'Artisan CSV（時間,ET,BT）',
  'int16-centi': '2 位元組整數（百分之一度）',
};

/** Split an incoming byte/string stream into complete lines. */
export class LineBuffer {
  private buf = '';
  private readonly decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

  push(chunk: Uint8Array | string): string[] {
    this.buf += typeof chunk === 'string' ? chunk : this.decoder ? this.decoder.decode(chunk) : toText(chunk);
    const lines = this.buf.split(/\r\n|\r|\n/);
    this.buf = lines.pop() ?? '';
    return lines.filter((l) => l.trim().length > 0);
  }
}
