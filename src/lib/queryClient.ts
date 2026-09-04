import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const qk = {
  greenBeans: ['green_beans'] as const,
  greenBean: (id: string) => ['green_beans', id] as const,
  countries: ['countries'] as const,
  roasters: ['roasters'] as const,
  roastBatches: ['roast_batches'] as const,
  roastBatch: (id: string) => ['roast_batches', id] as const,
  roastCurve: (id: string) => ['roast_curve', id] as const,
  stats: ['stats'] as const,
  suppliers: ['suppliers'] as const,
  supplier: (id: string) => ['suppliers', id] as const,
  lots: (beanId: string) => ['green_bean_lots', beanId] as const,
  greenStock: ['green_bean_stock'] as const,
  roastedStock: ['roasted_stock'] as const,
  roastedMoves: ['roasted_stock_moves'] as const,
  blends: ['blends'] as const,
  blend: (id: string) => ['blends', id] as const,
};
