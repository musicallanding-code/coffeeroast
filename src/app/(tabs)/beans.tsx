import { useRouter } from 'expo-router';
import { FlatList, RefreshControl } from 'react-native';

import { SetupNotice } from '@/components/SetupNotice';
import { AppText, EmptyState, ListRow, Pill, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useGreenBeans } from '@/db/beans';
import { t } from '@/i18n/zh-TW';

export default function BeansScreen() {
  const q = useGreenBeans();
  const router = useRouter();
  const data = q.data ?? [];

  return (
    <Screen padded={false}>
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, flexGrow: 1 }}
        ListHeaderComponent={<SetupNotice />}
        renderItem={({ item }) => (
          <ListRow onPress={() => router.push(`/beans/${item.id}`)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="heading" numberOfLines={1} style={{ flex: 1 }}>
                {item.name_zh}
              </AppText>
              {item.process ? <Pill text={item.process} /> : null}
            </Row>
            {item.name_en ? (
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {item.name_en}
              </AppText>
            ) : null}
          </ListRow>
        )}
        ListEmptyComponent={
          q.isLoading ? (
            <AppText color="textSecondary">{t.common.loading}</AppText>
          ) : (
            <EmptyState text={t.beans.empty} />
          )
        }
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} />}
      />
    </Screen>
  );
}
