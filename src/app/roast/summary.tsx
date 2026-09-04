import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { RoastChart } from '@/components/RoastChart';
import { AppText, Button, Card, Row, TextField } from '@/components/ui/kit';
import { Radius, Spacing } from '@/constants/theme';
import { useSaveRoast } from '@/db/roasts';
import { isSupabaseConfigured } from '@/lib/supabase';
import { t } from '@/i18n/zh-TW';
import { developmentTimeRatio, formatClock, weightLossPct } from '@/roast/roastMath';
import { useSessionStore } from '@/roast/sessionStore';
import { useTheme } from '@/hooks/use-theme';

export default function RoastSummaryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const save = useSaveRoast();

  const config = useSessionStore((s) => s.config);
  const points = useSessionStore((s) => s.points);
  const events = useSessionStore((s) => s.events);
  const startedAt = useSessionStore((s) => s.startedAt);
  const reset = useSessionStore((s) => s.reset);

  const [roastedWeight, setRoastedWeight] = useState('');
  const [level, setLevel] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const fc = events.find((e) => e.kind === 'first_crack')?.tSec ?? null;
  const dropSec = events.find((e) => e.kind === 'drop')?.tSec ?? points[points.length - 1]?.tSec ?? 0;
  const dtr = developmentTimeRatio(fc, dropSec);
  const loss = weightLossPct(config.greenWeightG, roastedWeight ? Number(roastedWeight) : null);

  const metrics = useMemo(
    () => [
      { label: t.roast.totalTime, value: formatClock(dropSec) },
      { label: t.roast.developmentTime, value: fc != null ? formatClock(dropSec - fc) : '–' },
      { label: t.roast.developmentRatio, value: dtr != null ? `${(dtr * 100).toFixed(0)}%` : '–' },
      { label: t.roast.weightLoss, value: loss != null ? `${loss.toFixed(1)}%` : '–' },
    ],
    [dropSec, fc, dtr, loss],
  );

  const doSave = () => {
    if (!isSupabaseConfigured) {
      Alert.alert(t.errors.missingSupabase);
      return;
    }
    save.mutate(
      {
        beanId: config.beanId,
        beanLotId: config.beanLotId,
        beanName: config.beanName,
        roasterName: config.roasterName,
        startedAt: startedAt ?? Date.now(),
        greenWeightG: config.greenWeightG,
        roastedWeightG: roastedWeight ? Number(roastedWeight) : null,
        roastLevel: level,
        notes: notes.trim() || null,
        points,
        events,
      },
      {
        onSuccess: (batch) => {
          reset();
          router.replace(`/roast/${batch.id}`);
        },
        onError: (e) => Alert.alert(t.errors.saveFailed, e instanceof Error ? e.message : ''),
      },
    );
  };

  const discard = () =>
    Alert.alert(t.roast.discardConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.confirm,
        style: 'destructive',
        onPress: () => {
          reset();
          router.replace('/(tabs)');
        },
      },
    ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three }}>
      <Card style={{ padding: Spacing.one }}>
        <RoastChart points={points} events={events} height={220} minSpanSec={dropSec} />
      </Card>

      <Row style={{ flexWrap: 'wrap', gap: Spacing.two }}>
        {metrics.map((m) => (
          <Card key={m.label} style={{ flexGrow: 1, flexBasis: '45%', gap: 2 }}>
            <AppText variant="caption" color="textSecondary">
              {m.label}
            </AppText>
            <AppText variant="heading">{m.value}</AppText>
          </Card>
        ))}
      </Row>

      <TextField
        label={`${t.roast.roastedWeight} (${t.common.grams})`}
        value={roastedWeight}
        onChangeText={(v) => setRoastedWeight(v.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
        placeholder="0"
      />

      <View style={{ gap: Spacing.one }}>
        <AppText variant="label" color="textSecondary">
          {t.roast.roastLevel}
        </AppText>
        <Row style={{ flexWrap: 'wrap', gap: Spacing.two }}>
          {t.roast.levels.map((lv) => {
            const active = lv === level;
            return (
              <Pressable
                key={lv}
                onPress={() => setLevel(active ? null : lv)}
                style={{
                  paddingHorizontal: Spacing.three,
                  paddingVertical: Spacing.one,
                  borderRadius: Radius.full,
                  borderWidth: 1,
                  borderColor: active ? theme.tint : theme.border,
                  backgroundColor: active ? theme.tint : 'transparent',
                }}>
                <AppText color={active ? 'tintText' : 'text'} variant="label">
                  {lv}
                </AppText>
              </Pressable>
            );
          })}
        </Row>
      </View>

      <TextField
        label={t.roast.notes}
        value={notes}
        onChangeText={setNotes}
        multiline
        style={{ minHeight: 90, paddingTop: Spacing.two, textAlignVertical: 'top' }}
      />

      <Button label={t.roast.saveRoast} onPress={doSave} loading={save.isPending} />
      <Button label={t.common.cancel} variant="ghost" onPress={discard} />
      <View style={{ height: Spacing.five }} />
    </ScrollView>
  );
}
