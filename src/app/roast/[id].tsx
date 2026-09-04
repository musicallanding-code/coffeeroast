import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { RoastChart } from '@/components/RoastChart';
import { AppText, Card, Pill, Row } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useDeleteRoastBatch, useRoastBatch, useRoastCurve } from '@/db/roasts';
import { eventsFromBatch } from '@/db/types';
import { t } from '@/i18n/zh-TW';
import { developmentTimeRatio, formatClock, weightLossPct } from '@/roast/roastMath';
import { useTheme } from '@/hooks/use-theme';

export default function RoastDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const batchQ = useRoastBatch(id);
  const curveQ = useRoastCurve(id);
  const del = useDeleteRoastBatch();

  const batch = batchQ.data;
  const events = batch ? eventsFromBatch(batch) : [];
  const name = batch?.green_beans?.name_zh ?? batch?.bean_name_snapshot ?? t.roast.detailTitle;

  const confirmDelete = () =>
    Alert.alert(t.common.delete, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => del.mutate(id, { onSuccess: () => router.replace('/(tabs)/roasts') }),
      },
    ]);

  if (!batch) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Spacing.three }}>
        <AppText color="textSecondary">{batchQ.isLoading ? t.common.loading : t.errors.loadFailed}</AppText>
      </ScrollView>
    );
  }

  const fc = batch.first_crack_sec;
  const dtr = developmentTimeRatio(fc, batch.drop_sec);
  const loss = weightLossPct(batch.weight_green_g, batch.weight_roasted_g);
  const started = new Date(batch.started_at);

  const rows: { label: string; value: string }[] = [
    { label: t.roast.totalTime, value: batch.drop_sec != null ? formatClock(batch.drop_sec) : '–' },
    {
      label: t.roast.developmentRatio,
      value: dtr != null ? `${(dtr * 100).toFixed(0)}%` : '–',
    },
    { label: t.roast.weightLoss, value: loss != null ? `${loss.toFixed(1)}%` : '–' },
    {
      label: t.roast.greenWeight,
      value: batch.weight_green_g != null ? `${batch.weight_green_g} ${t.common.grams}` : '–',
    },
    {
      label: t.roast.roastedWeight,
      value: batch.weight_roasted_g != null ? `${batch.weight_roasted_g} ${t.common.grams}` : '–',
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three }}>
      <Stack.Screen
        options={{
          title: name,
          headerRight: () => (
            <Pressable onPress={confirmDelete} hitSlop={10}>
              <Ionicons name="trash-outline" size={22} color={theme.danger} />
            </Pressable>
          ),
        }}
      />

      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="caption" color="textSecondary">
          {started.toLocaleString()} · {batch.batch_no}
        </AppText>
        {batch.roast_level ? <Pill text={batch.roast_level} tone="accent" /> : null}
      </Row>

      <Card style={{ padding: Spacing.one }}>
        {curveQ.data && curveQ.data.length > 1 ? (
          <RoastChart points={curveQ.data} events={events} height={230} minSpanSec={batch.drop_sec ?? 600} />
        ) : (
          <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
            <AppText color="textSecondary">{curveQ.isLoading ? t.common.loading : '—'}</AppText>
          </View>
        )}
      </Card>

      <Card>
        {events.map((ev) => (
          <Row key={ev.kind} style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color="textSecondary">
              {t.roast.events[ev.kind]}
            </AppText>
            <AppText>
              {formatClock(ev.tSec)} · {ev.temp != null ? `${ev.temp.toFixed(0)}°C` : '–'}
            </AppText>
          </Row>
        ))}
      </Card>

      <Card>
        {rows.map((r) => (
          <Row key={r.label} style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color="textSecondary">
              {r.label}
            </AppText>
            <AppText>{r.value}</AppText>
          </Row>
        ))}
      </Card>

      {batch.notes ? (
        <Card>
          <AppText variant="label" color="textSecondary">
            {t.roast.notes}
          </AppText>
          <AppText>{batch.notes}</AppText>
        </Card>
      ) : null}
      <View style={{ height: Spacing.five }} />
    </ScrollView>
  );
}
