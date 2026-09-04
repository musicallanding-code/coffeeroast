import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable } from 'react-native';

import { SupplierForm } from '@/components/SupplierForm';
import { AppText, Screen } from '@/components/ui/kit';
import { useDeleteSupplier, useSupplier, useUpdateSupplier } from '@/db/suppliers';
import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const q = useSupplier(id);
  const update = useUpdateSupplier();
  const del = useDeleteSupplier();

  const confirmDelete = () =>
    Alert.alert(t.suppliers.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => del.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          title: q.data?.name ?? t.suppliers.title,
          headerRight: () => (
            <Pressable onPress={confirmDelete} hitSlop={10}>
              <Ionicons name="trash-outline" size={22} color={theme.danger} />
            </Pressable>
          ),
        }}
      />
      {!q.data ? (
        <AppText color="textSecondary">{q.isLoading ? t.common.loading : t.errors.loadFailed}</AppText>
      ) : (
        <SupplierForm
          initial={q.data}
          submitting={update.isPending}
          onSubmit={(input) =>
            update.mutate(
              { id, input },
              {
                onSuccess: () => router.back(),
                onError: (e) => Alert.alert(t.errors.saveFailed, e instanceof Error ? e.message : ''),
              },
            )
          }
        />
      )}
    </Screen>
  );
}
