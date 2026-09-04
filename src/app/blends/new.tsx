import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { BlendEditor } from '@/components/BlendEditor';
import { SetupNotice } from '@/components/SetupNotice';
import { Screen } from '@/components/ui/kit';
import { useSaveBlend } from '@/db/blends';
import { t } from '@/i18n/zh-TW';

export default function NewBlendScreen() {
  const router = useRouter();
  const save = useSaveBlend();
  return (
    <Screen scroll>
      <Stack.Screen options={{ title: t.blends.newTitle }} />
      <SetupNotice />
      <BlendEditor
        submitting={save.isPending}
        onSubmit={(v) =>
          save.mutate(v, {
            onSuccess: (id) => router.replace(`/blends/${id}`),
            onError: (e) => Alert.alert(t.errors.saveFailed, e instanceof Error ? e.message : ''),
          })
        }
      />
    </Screen>
  );
}
