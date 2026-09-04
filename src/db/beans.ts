import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { demo, isDemoMode } from '@/demo/demoStore';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

import type { CountryRow, GreenBeanInput, GreenBeanRow } from './types';

export function useGreenBeans() {
  return useQuery({
    queryKey: qk.greenBeans,
    queryFn: async (): Promise<GreenBeanRow[]> => {
      if (isDemoMode) return demo.listGreenBeans();
      const { data, error } = await supabase
        .from('green_beans')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGreenBean(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.greenBean(id) : ['green_beans', 'none'],
    enabled: !!id,
    queryFn: async (): Promise<GreenBeanRow | null> => {
      if (isDemoMode) return demo.getGreenBean(id!);
      const { data, error } = await supabase.from('green_beans').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCountries() {
  return useQuery({
    queryKey: qk.countries,
    queryFn: async (): Promise<CountryRow[]> => {
      if (isDemoMode) return demo.listCountries();
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name_zh', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateGreenBean() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: GreenBeanInput): Promise<GreenBeanRow> => {
      if (isDemoMode) return demo.createGreenBean(input);
      const { data, error } = await supabase.from('green_beans').insert(input).select('*').single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.greenBeans });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useUpdateGreenBean() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: GreenBeanInput }): Promise<GreenBeanRow> => {
      if (isDemoMode) return demo.updateGreenBean(id, input);
      const { data, error } = await supabase
        .from('green_beans')
        .update(input)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: qk.greenBeans });
      qc.invalidateQueries({ queryKey: qk.greenBean(row.id) });
    },
  });
}

export function useArchiveGreenBean() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) return demo.archiveGreenBean(id);
      const { error } = await supabase.from('green_beans').update({ archived: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.greenBeans });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}
