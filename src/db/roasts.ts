import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

import {
  curvePointsFromRows,
  eventColumnsFromEvents,
  type CurvePoint,
  type RoastBatchRow,
  type RoastBatchWithBean,
  type RoastCurvePointRow,
  type RoastEvent,
} from './types';

export type SaveRoastPayload = {
  beanId: string | null;
  beanName: string;
  roasterName: string;
  startedAt: number;
  greenWeightG: number | null;
  roastedWeightG: number | null;
  roastLevel: string | null;
  notes: string | null;
  points: CurvePoint[];
  events: RoastEvent[];
};

export function useRoastBatches() {
  return useQuery({
    queryKey: qk.roastBatches,
    queryFn: async (): Promise<RoastBatchWithBean[]> => {
      const { data, error } = await supabase
        .from('roast_batches')
        .select('*, green_beans(id, name_zh, name_en)')
        .order('started_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as RoastBatchWithBean[];
    },
  });
}

export function useRoastBatch(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.roastBatch(id) : ['roast_batches', 'none'],
    enabled: !!id,
    queryFn: async (): Promise<RoastBatchWithBean | null> => {
      const { data, error } = await supabase
        .from('roast_batches')
        .select('*, green_beans(id, name_zh, name_en)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as RoastBatchWithBean | null;
    },
  });
}

export function useRoastCurve(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.roastCurve(id) : ['roast_curve', 'none'],
    enabled: !!id,
    queryFn: async (): Promise<CurvePoint[]> => {
      const { data, error } = await supabase
        .from('roast_curve_points')
        .select('*')
        .eq('batch_id', id)
        .order('t_sec', { ascending: true });
      if (error) throw error;
      return curvePointsFromRows((data ?? []) as RoastCurvePointRow[]);
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: qk.stats,
    queryFn: async () => {
      const [batches, beans] = await Promise.all([
        supabase.from('roast_batches').select('id', { count: 'exact', head: true }),
        supabase.from('green_beans').select('id', { count: 'exact', head: true }).eq('archived', false),
      ]);
      return {
        roasts: batches.count ?? 0,
        beans: beans.count ?? 0,
      };
    },
  });
}

export function useSaveRoast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SaveRoastPayload): Promise<RoastBatchRow> => {
      const drop = payload.events.find((e) => e.kind === 'drop');
      const startedAtIso = new Date(payload.startedAt).toISOString();
      const batchNo = buildBatchNo(payload.startedAt);

      const insert: Record<string, unknown> = {
        batch_no: batchNo,
        green_bean_id: payload.beanId,
        bean_name_snapshot: payload.beanName || null,
        status: 'completed',
        started_at: startedAtIso,
        charge_temp: payload.points[0]?.beanTemp ?? null,
        weight_green_g: payload.greenWeightG,
        weight_roasted_g: payload.roastedWeightG,
        roast_level: payload.roastLevel,
        notes: payload.notes,
        drop_sec: drop?.tSec ?? payload.points[payload.points.length - 1]?.tSec ?? null,
        ...eventColumnsFromEvents(payload.events),
      };

      const { data: batch, error: batchErr } = await supabase
        .from('roast_batches')
        .insert(insert)
        .select('*')
        .single();
      if (batchErr) throw batchErr;

      if (payload.points.length > 0) {
        const rows = payload.points.map((p) => ({
          batch_id: batch.id,
          t_sec: p.tSec,
          bean_temp: p.beanTemp,
          drum_temp: p.drumTemp ?? null,
          gas: p.gas ?? null,
          airflow: p.airflow ?? null,
        }));
        // chunk to keep payloads small
        for (let i = 0; i < rows.length; i += 500) {
          const { error } = await supabase.from('roast_curve_points').insert(rows.slice(i, i + 500));
          if (error) throw error;
        }
      }
      return batch;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.roastBatches });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useDeleteRoastBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('roast_batches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.roastBatches });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

function buildBatchNo(startedAt: number): string {
  const d = new Date(startedAt);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}`;
}
