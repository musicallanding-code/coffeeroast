import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SetupNotice } from '@/components/SetupNotice';
import { AppText, Card, EmptyState, ListRow, Pill, Row } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useGreenBeanStock, useRoastedStock } from '@/db/inventory';
import { t } from '@/i18n/zh-TW';
import { formatWeight } from '@/roast/roastMath';
import { useTheme } from '@/hooks/use-theme';

export default function InventoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const green = useGreenBeanStock();
  const roasted = useRoastedStock();

  const refreshing = green.isRefetching || roasted.isRefetching;
  const refetch = () => {
    green.refetch();
    roasted.refetch();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}>
        <SetupNotice />

        <Row style={{ gap: Spacing.two }}>
          <QuickLink icon="people-outline" label={t.inventory.suppliers} onPress={() => router.push('/suppliers')} />
          <QuickLink icon="git-merge-outline" label={t.inventory.blends} onPress={() => router.push('/blends')} />
          <QuickLink icon="swap-horizontal-outline" label={t.roastedMove.title} onPress={() => router.push('/stock/roasted')} />
        </Row>

        <AppText variant="heading">{t.inventory.greenStock}</AppText>
        {(green.data ?? []).length === 0 ? (
          <EmptyState text={green.isLoading ? t.common.loading : t.inventory.noStock} />
        ) : (
          <View style={{ gap: Spacing.two }}>
            {(green.data ?? []).map((s) => (
              <ListRow key={s.green_bean_id} onPress={() => router.push(`/stock/lots/${s.green_bean_id}`)}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <AppText variant="heading" numberOfLines={1} style={{ flex: 1 }}>
                    {s.name_zh}
                  </AppText>
                  <AppText variant="heading" color={s.remaining_g <= 0 ? 'danger' : 'text'}>
                    {formatWeight(s.remaining_g)}
                  </AppText>
                </Row>
                <Row style={{ justifyContent: 'space-between' }}>
                  <AppText variant="caption" color="textSecondary">
                    {t.inventory.lots} × {s.lot_count}
                  </AppText>
                  {s.remaining_g > 0 && s.remaining_g < 500 ? <Pill text={t.inventory.lowStock} tone="accent" /> : null}
                </Row>
              </ListRow>
            ))}
          </View>
        )}

        <AppText variant="heading" style={{ marginTop: Spacing.two }}>
          {t.inventory.roastedStock}
        </AppText>
        {(roasted.data ?? []).filter((r) => r.green_bean_id).length === 0 ? (
          <EmptyState text={roasted.isLoading ? t.common.loading : t.inventory.noStock} />
        ) : (
          <View style={{ gap: Spacing.two }}>
            {(roasted.data ?? [])
              .filter((r) => r.green_bean_id)
              .map((r) => (
                <Card key={r.green_bean_id}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <AppText numberOfLines={1} style={{ flex: 1 }}>
                      {r.name_zh ?? '—'}
                    </AppText>
                    <AppText variant="heading" color={r.remaining_g <= 0 ? 'danger' : 'text'}>
                      {formatWeight(r.remaining_g)}
                    </AppText>
                  </Row>
                </Card>
              ))}
          </View>
        )}
        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          alignItems: 'center',
          gap: Spacing.one,
          paddingVertical: Spacing.three,
          paddingHorizontal: Spacing.one,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.backgroundElement,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Ionicons name={icon} size={20} color={theme.tint} />
      <AppText variant="caption" style={{ textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}
