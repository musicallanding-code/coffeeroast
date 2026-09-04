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
};
