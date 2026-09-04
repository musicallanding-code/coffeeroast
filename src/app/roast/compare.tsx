import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { PickerRow } from '@/components/PickerRow';
import { RoastChart } from '@/components/RoastChart';
import { AppText, Card, Row } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useRoastBatch, useRoastBatches, useRoastCurve } from '@/db/roasts';
import { t } from '@/i18n/zh-TW';
import { developmentTimeRatio, formatClock } from '@/roast/roastMath';
import { useTheme } from '@/hooks/use-theme';

export default function CompareScreen() {
  const theme = useTheme();
  const batches = useRoastBatches();
  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);

  const aCurve = useRoastCurve(aId ?? undefined);
  const bCurve = useRoastCurve(bId ?? undefined);
  const aBatch = useRoastBatch(aId ?? undefined);
  const bBatch = useRoastBatch(bId ?? undefined);

  const options = (batches.data ?? []).map((b) => ({
    value: b.id,
    label: b.green_beans?.name_zh ?? b.bean_name_snapshot ?? b.batch_no ?? b.id.slice(0, 6),
    sub: new Date(b.started_at).toLocaleDateString(),
  }));

  const stat = (batch: typeof aBatch.data) => {
    if (!batch) return { total: '–', fc: '–', dtr: '–', drop: '–' };
    const dtr = developmentTimeRatio(batch.first_crack_sec, batch.drop_sec);
    return {
      total: batch.drop_sec != null ? formatClock(batch.drop_sec) : '–',
      fc: batch.first_crack_sec != null ? formatClock(batch.first_crack_sec) : '–',
      dtr: dtr != null ? `${(dtr * 100).toFixed(0)}%` : '–',
      drop: batch.drop_temp != null ? `${batch.drop_temp}°C` : '–',
    };
  };
  const sa = stat(aBatch.data);
  const sb = stat(bBatch.data);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three }}>
      <Stack.Screen options={{ title: t.roast.compareTitle }} />

      <PickerRow label={t.roast.roastA} value={aId} onChange={setAId} options={options} />
      <PickerRow label={t.roast.roastB} value={bId} onChange={setBId} options={options} />

      {aId ? (
        <Card style={{ padding: Spacing.one }}>
          <RoastChart
            points={aCurve.data ?? []}
            overlay={bId ? { points: bCurve.data ?? [] } : undefined}
            showDrum={false}
            height={240}
          />
          <Row style={{ gap: Spacing.three, paddingHorizontal: Spacing.two, paddingTop: Spacing.one }}>
            <Row style={{ gap: Spacing.one }}>
              <View style={{ width: 14, height: 3, backgroundColor: theme.beanTemp }} />
              <AppText variant="caption" color="textSecondary">
                {t.roast.roastA}
              </AppText>
            </Row>
            {bId ? (
              <Row style={{ gap: Spacing.one }}>
                <View style={{ width: 14, height: 3, backgroundColor: theme.drumTemp }} />
                <AppText variant="caption" color="textSecondary">
                  {t.roast.roastB}
                </AppText>
              </Row>
            ) : null}
          </Row>
        </Card>
      ) : (
        <AppText color="textSecondary">{t.roast.pickTwo}</AppText>
      )}

      {aId ? (
        <Card>
          <CompareRow label="" a={t.roast.roastA} b={t.roast.roastB} head />
          <CompareRow label={t.roast.totalTime} a={sa.total} b={sb.total} />
          <CompareRow label={t.roast.events.first_crack} a={sa.fc} b={sb.fc} />
          <CompareRow label={t.roast.developmentRatio} a={sa.dtr} b={sb.dtr} />
          <CompareRow label={t.roast.events.drop} a={sa.drop} b={sb.drop} />
        </Card>
      ) : null}
    </ScrollView>
  );
}

function CompareRow({ label, a, b, head }: { label: string; a: string; b: string; head?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <AppText variant={head ? 'label' : 'body'} color="textSecondary" style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText variant={head ? 'label' : 'body'} style={{ width: 90, textAlign: 'right' }}>
        {a}
      </AppText>
      <AppText variant={head ? 'label' : 'body'} style={{ width: 90, textAlign: 'right' }}>
        {b}
      </AppText>
    </Row>
  );
}
