import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { BeanForm } from '@/components/BeanForm';
import { SetupNotice } from '@/components/SetupNotice';
import { Screen } from '@/components/ui/kit';
import { useCreateGreenBean } from '@/db/beans';
import { t } from '@/i18n/zh-TW';

export default function NewBeanScreen() {
  const router = useRouter();
  const create = useCreateGreenBean();

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: t.beans.newTitle }} />
      <SetupNotice />
      <BeanForm
        submitting={create.isPending}
        onSubmit={(input) =>
          create.mutate(input, {
            onSuccess: () => router.back(),
            onError: (e) => Alert.alert(t.errors.saveFailed, e instanceof Error ? e.message : ''),
          })
        }
      />
    </Screen>
  );
}
