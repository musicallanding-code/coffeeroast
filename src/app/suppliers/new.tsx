import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { SetupNotice } from '@/components/SetupNotice';
import { SupplierForm } from '@/components/SupplierForm';
import { Screen } from '@/components/ui/kit';
import { useCreateSupplier } from '@/db/suppliers';
import { t } from '@/i18n/zh-TW';

export default function NewSupplierScreen() {
  const router = useRouter();
  const create = useCreateSupplier();
  return (
    <Screen scroll>
      <Stack.Screen options={{ title: t.suppliers.newTitle }} />
      <SetupNotice />
      <SupplierForm
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
