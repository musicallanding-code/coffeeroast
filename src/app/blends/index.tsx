import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl } from 'react-native';

import { SetupNotice } from '@/components/SetupNotice';
import { AppText, EmptyState, ListRow, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useBlends } from '@/db/blends';
import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

export default function BlendsScreen() {
  const q = useBlends();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen padded={false}>
      <Stack.Screen
        options={{
          title: t.blends.title,
          headerRight: () => (
            <Pressable onPress={() => router.push('/blends/new')} hitSlop={12}>
              <Ionicons name="add" size={26} color={theme.tint} />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={q.data ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, flexGrow: 1 }}
        ListHeaderComponent={<SetupNotice />}
        renderItem={({ item }) => {
          const total = item.blend_components.reduce((s, c) => s + Number(c.parts), 0);
          return (
            <ListRow onPress={() => router.push(`/blends/${item.id}`)}>
              <AppText variant="heading">{item.name}</AppText>
              <Row style={{ flexWrap: 'wrap', gap: Spacing.one }}>
                {item.blend_components.map((c) => (
                  <AppText key={c.id} variant="caption" color="textSecondary">
                    {c.green_beans?.name_zh ?? '—'} {total > 0 ? Math.round((Number(c.parts) / total) * 100) : 0}%
                  </AppText>
                ))}
              </Row>
            </ListRow>
          );
        }}
        ListEmptyComponent={
          q.isLoading ? <AppText color="textSecondary">{t.common.loading}</AppText> : <EmptyState text={t.blends.empty} />
        }
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} />}
      />
    </Screen>
  );
}
