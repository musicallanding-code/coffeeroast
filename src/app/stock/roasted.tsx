import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PickerRow } from '@/components/PickerRow';
import { SetupNotice } from '@/components/SetupNotice';
import { AppText, Button, Card, Row, Segmented, TextField } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useGreenBeans } from '@/db/beans';
import { useRecordRoastedMove, useRoastedMoves, useRoastedStock } from '@/db/inventory';
import { t } from '@/i18n/zh-TW';
import { formatWeight } from '@/roast/roastMath';
import { useTheme } from '@/hooks/use-theme';

export default function RoastedStockScreen() {
  const theme = useTheme();
  const stock = useRoastedStock();
  const moves = useRoastedMoves();
  const beans = useGreenBeans();
  const record = useRecordRoastedMove();

  const [beanId, setBeanId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'out' | 'in'>('out');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState<string | null>(t.roastedMove.reasonSold);

  const submit = () => {
    const grams = Number(qty);
    if (!beanId || !grams) return;
    record.mutate(
      { batch_id: null, green_bean_id: beanId, direction, qty_g: grams, reason },
      {
        onSuccess: () => {
          setQty('');
        },
        onError: (e) => Alert.alert(t.errors.saveFailed, e instanceof Error ? e.message : ''),
      },
    );
  };

  const beanName = (id: string | null) => beans.data?.find((b) => b.id === id)?.name_zh ?? '—';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ title: t.roastedMove.title }} />
      <ScrollView contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three }}>
        <SetupNotice />

        <AppText variant="heading">{t.inventory.roastedStock}</AppText>
        {(stock.data ?? []).filter((s) => s.green_bean_id).length === 0 ? (
          <AppText color="textSecondary">{t.inventory.noStock}</AppText>
        ) : (
          (stock.data ?? [])
            .filter((s) => s.green_bean_id)
            .map((s) => (
              <Card key={s.green_bean_id}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <AppText>{s.name_zh ?? '—'}</AppText>
                  <AppText variant="heading" color={s.remaining_g <= 0 ? 'danger' : 'text'}>
                    {formatWeight(s.remaining_g)}
                  </AppText>
                </Row>
              </Card>
            ))
        )}

        <Card style={{ gap: Spacing.three }}>
          <AppText variant="heading">{t.roastedMove.record}</AppText>
          <PickerRow
            label={t.tabs.beans}
            value={beanId}
            onChange={setBeanId}
            options={(beans.data ?? []).map((b) => ({ value: b.id, label: b.name_zh }))}
          />
          <Segmented
            value={direction}
            onChange={(v) => setDirection(v)}
            options={[
              { value: 'out', label: t.roastedMove.out },
              { value: 'in', label: t.roastedMove.in },
            ]}
          />
          <TextField
            label={t.roastedMove.qty}
            value={qty}
            onChangeText={(v) => setQty(v.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
          />
          <PickerRow
            label={t.roastedMove.reason}
            value={reason}
            onChange={setReason}
            options={[
              { value: t.roastedMove.reasonSold, label: t.roastedMove.reasonSold },
              { value: t.roastedMove.reasonSample, label: t.roastedMove.reasonSample },
              { value: t.roastedMove.reasonWaste, label: t.roastedMove.reasonWaste },
            ]}
          />
          <Button
            label={t.roastedMove.record}
            onPress={submit}
            disabled={!beanId || !qty || record.isPending}
            loading={record.isPending}
          />
        </Card>

        <AppText variant="heading">{t.roastedMove.recent}</AppText>
        {(moves.data ?? []).map((m) => (
          <Row key={m.id} style={{ justifyContent: 'space-between' }}>
            <AppText variant="caption" color="textSecondary">
              {m.moved_on} · {beanName(m.green_bean_id)} · {m.reason ?? ''}
            </AppText>
            <AppText variant="caption" color={m.direction === 'out' ? 'danger' : 'success'}>
              {m.direction === 'out' ? '−' : '+'}
              {formatWeight(m.qty_g)}
            </AppText>
          </Row>
        ))}
        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </SafeAreaView>
  );
}
