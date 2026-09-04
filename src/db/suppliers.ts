import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { demo, isDemoMode } from '@/demo/demoStore';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

import type { SupplierInput, SupplierRow } from './types';

export function useSuppliers() {
  return useQuery({
    queryKey: qk.suppliers,
    queryFn: async (): Promise<SupplierRow[]> => {
      if (isDemoMode) return demo.listSuppliers();
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.supplier(id) : ['suppliers', 'none'],
    enabled: !!id,
    queryFn: async (): Promise<SupplierRow | null> => {
      if (isDemoMode) return demo.getSupplier(id!);
      const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SupplierInput): Promise<SupplierRow> => {
      if (isDemoMode) return demo.createSupplier(input);
      const { data, error } = await supabase.from('suppliers').insert(input).select('*').single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.suppliers }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SupplierInput }): Promise<SupplierRow> => {
      if (isDemoMode) return demo.updateSupplier(id, input);
      const { data, error } = await supabase
        .from('suppliers')
        .update(input)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: qk.suppliers });
      qc.invalidateQueries({ queryKey: qk.supplier(row.id) });
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) return demo.deleteSupplier(id);
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.suppliers }),
  });
}
