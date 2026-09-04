import { FlatList, RefreshControl } from 'react-native';

import { RoastListRow } from '@/components/RoastListRow';
import { SetupNotice } from '@/components/SetupNotice';
import { AppText, EmptyState, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useRoastBatches } from '@/db/roasts';
import { t } from '@/i18n/zh-TW';

export default function RoastsScreen() {
  const q = useRoastBatches();
  const data = q.data ?? [];

  return (
    <Screen padded={false}>
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, flexGrow: 1 }}
        ListHeaderComponent={<SetupNotice />}
        renderItem={({ item }) => <RoastListRow batch={item} />}
        ListEmptyComponent={
          q.isLoading ? (
            <AppText color="textSecondary">{t.common.loading}</AppText>
          ) : (
            <EmptyState text={t.roast.empty} />
          )
        }
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} />}
      />
    </Screen>
  );
}
