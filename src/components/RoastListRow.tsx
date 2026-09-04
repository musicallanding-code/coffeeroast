import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, ListRow, Pill, Row } from '@/components/ui/kit';
import type { RoastBatchWithBean } from '@/db/types';
import { t } from '@/i18n/zh-TW';
import { formatClock, weightLossPct } from '@/roast/roastMath';

export function RoastListRow({ batch }: { batch: RoastBatchWithBean }) {
  const router = useRouter();
  const name = batch.green_beans?.name_zh ?? batch.bean_name_snapshot ?? '—';
  const date = new Date(batch.started_at);
  const loss = weightLossPct(batch.weight_green_g, batch.weight_roasted_g);
  const total = batch.drop_sec ?? null;

  return (
    <ListRow onPress={() => router.push(`/roast/${batch.id}`)}>
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="heading" numberOfLines={1} style={{ flex: 1 }}>
          {name}
        </AppText>
        {batch.roast_level ? <Pill text={batch.roast_level} /> : null}
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="caption" color="textSecondary">
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </AppText>
        <Row>
          {total != null ? (
            <AppText variant="caption" color="textSecondary">
              {t.roast.totalTime} {formatClock(total)}
            </AppText>
          ) : null}
          {loss != null ? (
            <AppText variant="caption" color="textSecondary">
              · {t.roast.weightLoss} {loss.toFixed(1)}%
            </AppText>
          ) : null}
        </Row>
      </Row>
      <View />
    </ListRow>
  );
}
