import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { SetupNotice } from '@/components/SetupNotice';
import { AppText, Button, Card, Row, Screen, TextField } from '@/components/ui/kit';
import { Radius, Spacing } from '@/constants/theme';
import { useGreenBeans } from '@/db/beans';
import { t } from '@/i18n/zh-TW';
import { useSessionStore } from '@/roast/sessionStore';
import { useTheme } from '@/hooks/use-theme';

export default function StartRoastScreen() {
  const router = useRouter();
  const theme = useTheme();
  const beans = useGreenBeans();
  const begin = useSessionStore((s) => s.begin);

  const [beanId, setBeanId] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [roaster, setRoaster] = useState('');

  const selectedBean = beans.data?.find((b) => b.id === beanId) ?? null;

  const start = () => {
    begin({
      beanId,
      beanName: selectedBean?.name_zh ?? '',
      greenWeightG: weight ? Number(weight) : null,
      roasterName: roaster.trim(),
    });
    router.replace('/roast/live');
  };

  return (
    <Screen scroll>
      <SetupNotice />

      <AppText variant="label" color="textSecondary">
        {t.roast.pickBean}
      </AppText>
      {!beans.data?.length ? (
        <Card>
          <AppText color="textSecondary">{beans.isLoading ? t.common.loading : t.beans.empty}</AppText>
          {!beans.isLoading ? (
            <Button label={t.beans.newTitle} variant="secondary" onPress={() => router.push('/beans/new')} />
          ) : null}
        </Card>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: Spacing.two, paddingVertical: Spacing.one }}>
          {(beans.data ?? []).map((b) => {
            const active = b.id === beanId;
            return (
              <Pressable
                key={b.id}
                onPress={() => setBeanId(active ? null : b.id)}
                style={{
                  paddingHorizontal: Spacing.three,
                  paddingVertical: Spacing.two,
                  borderRadius: Radius.md,
                  borderWidth: 1,
                  borderColor: active ? theme.tint : theme.border,
                  backgroundColor: active ? theme.tint : theme.backgroundElement,
                  maxWidth: 220,
                }}>
                <AppText numberOfLines={1} color={active ? 'tintText' : 'text'}>
                  {b.name_zh}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

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
