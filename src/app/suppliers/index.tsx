import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl } from 'react-native';

import { SetupNotice } from '@/components/SetupNotice';
import { AppText, EmptyState, ListRow, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useSuppliers } from '@/db/suppliers';
import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

export default function SuppliersScreen() {
  const q = useSuppliers();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen padded={false}>
      <Stack.Screen
        options={{
          title: t.suppliers.title,
          headerRight: () => (
            <Pressable onPress={() => router.push('/suppliers/new')} hitSlop={12}>
              <Ionicons name="add" size={26} color={theme.tint} />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={q.data ?? []}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, flexGrow: 1 }}
        ListHeaderComponent={<SetupNotice />}
        renderItem={({ item }) => (
          <ListRow onPress={() => router.push(`/suppliers/${item.id}`)}>
            <AppText variant="heading">{item.name}</AppText>
            <Row style={{ gap: Spacing.two }}>
              {item.contact ? <AppText variant="caption" color="textSecondary">{item.contact}</AppText> : null}
              {item.phone ? <AppText variant="caption" color="textSecondary">{item.phone}</AppText> : null}
            </Row>
          </ListRow>
        )}
        ListEmptyComponent={
          q.isLoading ? <AppText color="textSecondary">{t.common.loading}</AppText> : <EmptyState text={t.suppliers.empty} />
        }
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} />}
      />
    </Screen>
  );
}
