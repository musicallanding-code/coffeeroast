import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { PickerRow } from '@/components/PickerRow';
import { SetupNotice } from '@/components/SetupNotice';
import { AppText, Button, Card, Row, Screen, TextField } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useGreenBeans } from '@/db/beans';
import { useAvailableLots } from '@/db/inventory';
import { t } from '@/i18n/zh-TW';
import { formatWeight } from '@/roast/roastMath';
import { useSessionStore } from '@/roast/sessionStore';

export default function StartRoastScreen() {
  const router = useRouter();
  const beans = useGreenBeans();
  const begin = useSessionStore((s) => s.begin);

  const [beanId, setBeanId] = useState<string | null>(null);
  const [lotId, setLotId] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [roaster, setRoaster] = useState('');

  const lots = useAvailableLots(beanId);
  const selectedBean = beans.data?.find((b) => b.id === beanId) ?? null;

  useEffect(() => {
    setLotId(null);
  }, [beanId]);

  const start = () => {
    begin({
      beanId,
      beanLotId: lotId,
      beanName: selectedBean?.name_zh ?? '',
      greenWeightG: weight ? Number(weight) : null,
      roasterName: roaster.trim(),
    });
    router.replace('/roast/live');
  };

  return (
    <Screen scroll>
      <SetupNotice />

      {!beans.data?.length ? (
        <Card>
          <AppText color="textSecondary">{beans.isLoading ? t.common.loading : t.beans.empty}</AppText>
          {!beans.isLoading ? (
            <Button label={t.beans.newTitle} variant="secondary" onPress={() => router.push('/beans/new')} />
          ) : null}
        </Card>
      ) : (
        <PickerRow
          label={t.roast.pickBean}
          value={beanId}
          onChange={(v) => setBeanId(v === beanId ? null : v)}
          options={(beans.data ?? []).map((b) => ({ value: b.id, label: b.name_zh }))}
        />
      )}

      {beanId && (lots.data?.length ?? 0) > 0 ? (
        <PickerRow
          label={t.roast.pickLot}
          value={lotId}
          onChange={(v) => setLotId(v === lotId ? null : v)}
          options={[
            { value: null, label: t.roast.noLot },
            ...(lots.data ?? []).map((l) => ({
              value: l.id,
              label: l.lot_code || l.purchased_on || t.lots.title,
              sub: `${t.roast.lotRemaining} ${formatWeight(Number(l.qty_remaining_g))}`,
            })),
          ]}
        />
      ) : null}

      <TextField
        label={`${t.roast.greenWeight} (${t.common.grams})`}
        value={weight}
        onChangeText={(v) => setWeight(v.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
        placeholder="0"
      />
      <TextField
        label={t.roast.roaster}
        value={roaster}
        onChangeText={setRoaster}
        placeholder={t.roast.roasterPlaceholder}
      />

      <Row>
        <AppText variant="caption" color="textSecondary">
          {t.roast.sensorSource}：{t.roast.sensorMock}
        </AppText>
      </Row>

      <Button label={t.roast.start} onPress={start} style={{ marginTop: Spacing.two }} />
      <View style={{ height: Spacing.six }} />
    </Screen>
  );
}
