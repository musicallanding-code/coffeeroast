import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { demo, isDemoMode } from '@/demo/demoStore';
import { qk } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

import type { BlendComponentWithBean, BlendRow } from './types';

export type BlendComponentInput = { green_bean_id: string; parts: number };

export type BlendWithComponents = BlendRow & {
  blend_components: BlendComponentWithBean[];
};

export function useBlends() {
  return useQuery({
    queryKey: qk.blends,
    queryFn: async (): Promise<BlendWithComponents[]> => {
      if (isDemoMode) return demo.listBlends() as unknown as BlendWithComponents[];
      const { data, error } = await supabase
        .from('blends')
        .select('*, blend_components(*, green_beans(id, name_zh, name_en))')
        .eq('archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlendWithComponents[];
    },
  });
}

export function useBlend(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.blend(id) : ['blends', 'none'],
    enabled: !!id,
    queryFn: async (): Promise<BlendWithComponents | null> => {
      if (isDemoMode) return demo.getBlend(id!) as unknown as BlendWithComponents | null;
      const { data, error } = await supabase
        .from('blends')
        .select('*, blend_components(*, green_beans(id, name_zh, name_en))')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as BlendWithComponents | null;
    },
  });
}

async function replaceComponents(blendId: string, components: BlendComponentInput[]) {
  const { error: delErr } = await supabase.from('blend_components').delete().eq('blend_id', blendId);
  if (delErr) throw delErr;
  if (components.length > 0) {
    const rows = components.map((c, i) => ({
      blend_id: blendId,
      green_bean_id: c.green_bean_id,
      parts: c.parts,
      sort_order: i,
    }));
    const { error } = await supabase.from('blend_components').insert(rows);
    if (error) throw error;
  }
}

export function useSaveBlend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      name: string;
      note: string | null;
      components: BlendComponentInput[];
    }): Promise<string> => {
      if (isDemoMode) return demo.saveBlend(input);
      let blendId = input.id;
      if (blendId) {
        const { error } = await supabase
          .from('blends')
          .update({ name: input.name, note: input.note })
          .eq('id', blendId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('blends')
          .insert({ name: input.name, note: input.note })
          .select('id')
          .single();
        if (error) throw error;
        blendId = data.id;
      }
      await replaceComponents(blendId!, input.components);
      return blendId!;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: qk.blends });
      qc.invalidateQueries({ queryKey: qk.blend(id) });
    },
  });
}

export function useArchiveBlend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) return demo.archiveBlend(id);
      const { error } = await supabase.from('blends').update({ archived: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.blends }),
  });
}
