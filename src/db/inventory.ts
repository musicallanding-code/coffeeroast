import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { demo, isDemoMode } from '@/demo/demoStore';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

import type {
  GreenBeanLotInput,
  GreenBeanLotWithSupplier,
  GreenBeanStockRow,
  RoastedStockMoveRow,
  RoastedStockRow,
} from './types';

// ─── green-bean lots ───────────────────────────────────────────────────────

export function useGreenBeanLots(beanId: string | undefined) {
  return useQuery({
    queryKey: beanId ? qk.lots(beanId) : ['green_bean_lots', 'none'],
    enabled: !!beanId,
    queryFn: async (): Promise<GreenBeanLotWithSupplier[]> => {
      if (isDemoMode) return demo.listLots(beanId!).map(demo.lotWithSupplier) as GreenBeanLotWithSupplier[];
      const { data, error } = await supabase
        .from('green_bean_lots')
        .select('*, suppliers(id, name)')
        .eq('green_bean_id', beanId)
        .order('purchased_on', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as GreenBeanLotWithSupplier[];
    },
  });
}

/** Lots for a bean that still have stock — for picking during a roast. */
export function useAvailableLots(beanId: string | null | undefined) {
  return useQuery({
    queryKey: beanId ? [...qk.lots(beanId), 'available'] : ['green_bean_lots', 'none'],
    enabled: !!beanId,
    queryFn: async (): Promise<GreenBeanLotWithSupplier[]> => {
      if (isDemoMode) return demo.availableLots(beanId!).map(demo.lotWithSupplier) as GreenBeanLotWithSupplier[];
      const { data, error } = await supabase
        .from('green_bean_lots')
        .select('*, suppliers(id, name)')
        .eq('green_bean_id', beanId)
        .gt('qty_remaining_g', 0)
        .order('purchased_on', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as GreenBeanLotWithSupplier[];
    },
  });
}

export function useCreateLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: GreenBeanLotInput) => {
      if (isDemoMode) return demo.createLot(input);
      const { data, error } = await supabase
        .from('green_bean_lots')
        .insert({ ...input, qty_remaining_g: input.qty_in_g })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: qk.lots(row.green_bean_id) });
      qc.invalidateQueries({ queryKey: qk.greenStock });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useAdjustLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, qty_remaining_g }: { id: string; qty_remaining_g: number }) => {
      if (isDemoMode) return demo.adjustLot(id, qty_remaining_g);
      const { data, error } = await supabase
        .from('green_bean_lots')
        .update({ qty_remaining_g })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: qk.lots(row.green_bean_id) });
      qc.invalidateQueries({ queryKey: qk.greenStock });
    },
  });
}

export function useDeleteLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; beanId: string }) => {
      if (isDemoMode) return demo.deleteLot(id);
      const { error } = await supabase.from('green_bean_lots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: qk.lots(vars.beanId) });
      qc.invalidateQueries({ queryKey: qk.greenStock });
    },
  });
}

// ─── stock views ───────────────────────────────────────────────────────────

export function useGreenBeanStock() {
  return useQuery({
    queryKey: qk.greenStock,
    queryFn: async (): Promise<GreenBeanStockRow[]> => {
      if (isDemoMode) return demo.greenBeanStock();
      const { data, error } = await supabase
        .from('green_bean_stock')
        .select('*')
        .order('remaining_g', { ascending: false });
      if (error) throw error;
      return (data ?? []) as GreenBeanStockRow[];
    },
  });
}

export function useRoastedStock() {
  return useQuery({
    queryKey: qk.roastedStock,
    queryFn: async (): Promise<RoastedStockRow[]> => {
      if (isDemoMode) return demo.roastedStock();
      const { data, error } = await supabase
        .from('roasted_stock')
        .select('*')
        .order('remaining_g', { ascending: false });
      if (error) throw error;
      return (data ?? []) as RoastedStockRow[];
    },
  });
}

export function useRoastedMoves() {
  return useQuery({
    queryKey: qk.roastedMoves,
    queryFn: async (): Promise<RoastedStockMoveRow[]> => {
      if (isDemoMode) return demo.roastedMoves();
      const { data, error } = await supabase
        .from('roasted_stock_moves')
        .select('*')
        .order('moved_on', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as RoastedStockMoveRow[];
    },
  });
}

export function useRecordRoastedMove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      batch_id: string | null;
      green_bean_id: string | null;
      direction: 'in' | 'out';
      qty_g: number;
      reason?: string | null;
      note?: string | null;
      moved_on?: string;
    }) => {
      if (isDemoMode) return demo.recordRoastedMove(input);
      const { error } = await supabase.from('roasted_stock_moves').insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.roastedStock });
      qc.invalidateQueries({ queryKey: qk.roastedMoves });
    },
  });
}
