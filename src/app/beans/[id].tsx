import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { BeanForm } from '@/components/BeanForm';
import { AppText, Card, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useArchiveGreenBean, useGreenBean, useUpdateGreenBean } from '@/db/beans';
import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

export default function BeanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const q = useGreenBean(id);
  const update = useUpdateGreenBean();
  const archive = useArchiveGreenBean();
  const [editing, setEditing] = useState(false);

  const bean = q.data;

  const confirmDelete = () =>
    Alert.alert(t.beans.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () =>
          archive.mutate(id, {
            onSuccess: () => router.back(),
          }),
      },
    ]);

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          title: bean?.name_zh ?? t.beans.title,
          headerRight: () =>
            bean ? (
              <Row>
                <Pressable onPress={() => setEditing((e) => !e)} hitSlop={10}>
                  <Ionicons name={editing ? 'close' : 'create-outline'} size={22} color={theme.tint} />
                </Pressable>
                <Pressable onPress={confirmDelete} hitSlop={10}>
                  <Ionicons name="trash-outline" size={22} color={theme.danger} />
                </Pressable>
              </Row>
            ) : null,
        }}
      />

      {!bean ? (
        <AppText color="textSecondary">{q.isLoading ? t.common.loading : t.errors.loadFailed}</AppText>
      ) : editing ? (
        <BeanForm
          initial={bean}
          submitting={update.isPending}
          onSubmit={(input) =>
            update.mutate(
              { id, input },
              {
                onSuccess: () => setEditing(false),
                onError: (e) => Alert.alert(t.errors.saveFailed, e instanceof Error ? e.message : ''),
              },
            )
          }
        />
      ) : (
        <View style={{ gap: Spacing.two }}>
          {bean.name_en ? <AppText color="textSecondary">{bean.name_en}</AppText> : null}
          <Card>
            <Field label={t.beans.code} value={bean.code} />
            <Field label={t.beans.country} value={bean.region} />
            <Field label={t.beans.farm} value={bean.farm} />
            <Field label={t.beans.process} value={bean.process} />
            <Field label={t.beans.variety} value={bean.variety} />
            <Field label={t.beans.altitude} value={bean.altitude} />
          </Card>
          {bean.flavor_notes ? (
            <Card>
              <AppText variant="label" color="textSecondary">
                {t.beans.flavorNotes}
              </AppText>
              <AppText>{bean.flavor_notes}</AppText>
            </Card>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <AppText variant="label" color="textSecondary">
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </Row>
  );
}
