import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="roasts"
        options={{
          title: t.tabs.roasts,
          tabBarIcon: ({ color, size }) => <Ionicons name="flame-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="beans"
        options={{
          title: t.tabs.beans,
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" color={color} size={size} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/beans/new')} hitSlop={12} style={{ paddingHorizontal: 16 }}>
              <Ionicons name="add" size={26} color={theme.tint} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
