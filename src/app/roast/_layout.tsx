import { Stack } from 'expo-router';

import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

export default function RoastLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
        headerTintColor: theme.tint,
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="start" options={{ title: t.roast.newTitle, presentation: 'modal' }} />
      <Stack.Screen name="live" options={{ title: t.roast.liveTitle, headerBackVisible: false, gestureEnabled: false }} />
      <Stack.Screen name="summary" options={{ title: t.roast.finishTitle, headerBackVisible: false, gestureEnabled: false }} />
      <Stack.Screen name="[id]" options={{ title: t.roast.detailTitle }} />
    </Stack>
  );
}
