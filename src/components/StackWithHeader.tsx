import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

/** Shared stack layout with the app's header styling. */
export function StackWithHeader() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
        headerTintColor: theme.tint,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
