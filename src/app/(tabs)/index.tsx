import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { RoastListRow } from '@/components/RoastListRow';
import { SetupNotice } from '@/components/SetupNotice';
import { StatTile } from '@/components/StatTile';
import { AppText, Button, EmptyState, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useRoastBatches, useStats } from '@/db/roasts';
import { t } from '@/i18n/zh-TW';

export default function HomeScreen() {
  const router = useRouter();
  const stats = useStats();
  const batches = useRoastBatches();
  const recent = (batches.data ?? []).slice(0, 5);

  return (
    <Screen scroll>
      <SetupNotice />

      <Button label={t.home.startRoast} onPress={() => router.push('/roast/start')} />

      <Row style={{ gap: Spacing.two }}>
        <StatTile label={t.home.totalRoasts} value={stats.data?.roasts ?? '–'} />
        <StatTile label={t.home.beansCount} value={stats.data?.beans ?? '–'} />
      </Row>

      <AppText variant="heading" style={{ marginTop: Spacing.two }}>
        {t.home.recentRoasts}
      </AppText>

      {recent.length === 0 ? (
        <EmptyState text={t.home.noRoasts} />
      ) : (
        <View style={{ gap: Spacing.two }}>
          {recent.map((b) => (
            <RoastListRow key={b.id} batch={b} />
          ))}
        </View>
      )}
    </Screen>
  );
}
