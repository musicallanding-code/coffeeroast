import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, View } from 'react-native';

import { SetupNotice } from '@/components/SetupNotice';
import { AppText, Button, Card, EmptyState, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useGreenBean } from '@/db/beans';
import { useDeleteLot, useGreenBeanLots } from '@/db/inventory';
import { t } from '@/i18n/zh-TW';
import { formatWeight } from '@/roast/roastMath';
import { useTheme } from '@/hooks/use-theme';

export default function BeanLotsScreen() {
  const { beanId } = useLocalSearchParams<{ beanId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const bean = useGreenBean(beanId);
  const lots = useGreenBeanLots(beanId);
  const del = useDeleteLot();

  const total = (lots.data ?? []).reduce((sum, l) => sum + Number(l.qty_remaining_g), 0);

  const confirmDelete = (id: string) =>
    Alert.alert(t.lots.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => del.mutate({ id, beanId }) },
    ]);

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: bean.data?.name_zh ?? t.lots.title }} />
      <FlatList
        data={lots.data ?? []}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.two, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ gap: Spacing.two, marginBottom: Spacing.one }}>
            <SetupNotice />
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" color="textSecondary">
                  {t.lots.totalStock}
                </AppText>
                <AppText variant="heading">{formatWeight(total)}</AppText>
              </Row>
            </Card>
            <Button
              label={t.lots.newTitle}
              variant="secondary"
              onPress={() => router.push(`/stock/new-lot?beanId=${beanId}`)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="heading">
                {item.lot_code || item.purchased_on || t.lots.title}
              </AppText>
              <Pressable onPress={() => confirmDelete(item.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
              </Pressable>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="caption" color="textSecondary">
                {t.lots.qtyRemaining} {formatWeight(Number(item.qty_remaining_g))} / {formatWeight(Number(item.qty_in_g))}
              </AppText>
              {item.suppliers ? (
                <AppText variant="caption" color="textSecondary">
                  {item.suppliers.name}
                </AppText>
              ) : null}
            </Row>
            {item.unit_price ? (
              <AppText variant="caption" color="textSecondary">
                {t.lots.unitPrice}: {item.currency} {item.unit_price}
              </AppText>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={
          lots.isLoading ? <AppText color="textSecondary">{t.common.loading}</AppText> : <EmptyState text={t.lots.empty} />
        }
      />
    </Screen>
  );
}
