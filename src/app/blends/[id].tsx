import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable } from 'react-native';

import { BlendEditor } from '@/components/BlendEditor';
import { AppText, Screen } from '@/components/ui/kit';
import { useArchiveBlend, useBlend, useSaveBlend } from '@/db/blends';
import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

export default function BlendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const q = useBlend(id);
  const save = useSaveBlend();
  const archive = useArchiveBlend();

  const confirmDelete = () =>
    Alert.alert(t.blends.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => archive.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          title: q.data?.name ?? t.blends.title,
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
        <BlendEditor
          key={q.data.id}
          initialName={q.data.name}
          initialNote={q.data.note ?? ''}
          initialComponents={q.data.blend_components
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((c) => ({ green_bean_id: c.green_bean_id, parts: Number(c.parts) }))}
          submitting={save.isPending}
          onSubmit={(v) =>
            save.mutate(
              { id, ...v },
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
