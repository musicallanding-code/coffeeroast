import { Platform } from 'react-native';

import type { CurvePoint, RoastBatchRow, RoastEvent } from '@/db/types';
import { t } from '@/i18n/zh-TW';

import { formatClock } from './roastMath';

function buildCsv(batch: RoastBatchRow, events: RoastEvent[], points: CurvePoint[]): string {
  const lines: string[] = [];
  lines.push(`# ${t.appName}`);
  lines.push(`# batch,${batch.batch_no ?? batch.id}`);
  lines.push(`# bean,${batch.bean_name_snapshot ?? ''}`);
  lines.push(`# started_at,${batch.started_at}`);
  lines.push(`# roast_level,${batch.roast_level ?? ''}`);
  lines.push(`# weight_green_g,${batch.weight_green_g ?? ''}`);
  lines.push(`# weight_roasted_g,${batch.weight_roasted_g ?? ''}`);
  events.forEach((e) => lines.push(`# event,${e.kind},${e.tSec},${e.temp ?? ''}`));
  lines.push('t_sec,clock,bean_temp,drum_temp,gas,airflow');
  points.forEach((p) => {
    lines.push(
      [p.tSec, formatClock(p.tSec), p.beanTemp, p.drumTemp ?? '', p.gas ?? '', p.airflow ?? ''].join(','),
    );
  });
  return lines.join('\n');
}

function safeName(batch: RoastBatchRow): string {
  return `roast-${(batch.batch_no ?? batch.id).replace(/[^\w-]/g, '')}`;
}

function webDownload(filename: string, content: string | Blob, mime: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportRoastCsv(
  batch: RoastBatchRow,
  events: RoastEvent[],
  points: CurvePoint[],
): Promise<void> {
  const csv = buildCsv(batch, events, points);
  const filename = `${safeName(batch)}.csv`;

  if (Platform.OS === 'web') {
    webDownload(filename, csv, 'text/csv');
    return;
  }
  const FileSystem = require('expo-file-system');
  const Sharing = require('expo-sharing');
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType?.UTF8 ?? 'utf8' });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: t.roast.exportCsv });
  }
}

/** dataUrl is a "data:image/png;base64,..." string from the chart's Svg.toDataURL(). */
export async function exportRoastPng(batch: RoastBatchRow, dataUrl: string): Promise<void> {
  const filename = `${safeName(batch)}.png`;
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');

  if (Platform.OS === 'web') {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    webDownload(filename, new Blob([bytes], { type: 'image/png' }), 'image/png');
    return;
  }
  const FileSystem = require('expo-file-system');
  const Sharing = require('expo-sharing');
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t.roast.exportImage });
  }
}
