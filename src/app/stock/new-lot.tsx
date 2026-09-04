import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { PickerRow } from '@/components/PickerRow';
import { SetupNotice } from '@/components/SetupNotice';
import { Button, Screen, TextField } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useCreateLot } from '@/db/inventory';
import { useSuppliers } from '@/db/suppliers';
import { t } from '@/i18n/zh-TW';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewLotScreen() {
  const { beanId } = useLocalSearchParams<{ beanId: string }>();
  const router = useRouter();
  const create = useCreateLot();
  const suppliers = useSuppliers();

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [lotCode, setLotCode] = useState('');
  const [purchasedOn, setPurchasedOn] = useState(today());
  const [qtyKg, setQtyKg] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [note, setNote] = useState('');

  const grams = qtyKg ? Math.round(Number(qtyKg) * 1000) : 0;
  const canSave = grams > 0 && !create.isPending;

  const submit = () =>
    create.mutate(
      {
        green_bean_id: beanId,
        supplier_id: supplierId,
        lot_code: lotCode.trim() || null,
        purchased_on: /^\d{4}-\d{2}-\d{2}$/.test(purchasedOn) ? purchasedOn : null,
        qty_in_g: grams,
        unit_price: unitPrice ? Number(unitPrice) : null,
        note: note.trim() || null,
      },
      {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert(t.errors.saveFailed, e instanceof Error ? e.message : ''),
      },
    );

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: t.lots.newTitle, presentation: 'modal' }} />
      <SetupNotice />

      <View style={{ gap: Spacing.one }}>
        <PickerRow
          label={t.lots.supplier}
          value={supplierId}
          onChange={setSupplierId}
          options={[
            { value: null, label: t.roast.noLot },
            ...(suppliers.data ?? []).map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </View>

      <TextField label={t.lots.lotCode} value={lotCode} onChangeText={setLotCode} autoCapitalize="none" />
      <TextField label={t.lots.purchasedOn} value={purchasedOn} onChangeText={setPurchasedOn} placeholder="YYYY-MM-DD" autoCapitalize="none" />
      <TextField
        label={`${t.lots.qtyIn} (kg)`}
        value={qtyKg}
        onChangeText={(v) => setQtyKg(v.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
        placeholder="0"
      />
      <TextField
        label={t.lots.unitPrice}
        value={unitPrice}
        onChangeText={(v) => setUnitPrice(v.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
      />
      <TextField
        label={t.lots.note}
        value={note}
        onChangeText={setNote}
        multiline
        style={{ minHeight: 70, paddingTop: Spacing.two, textAlignVertical: 'top' }}
      />

      <Button label={t.lots.save} onPress={submit} disabled={!canSave} loading={create.isPending} />
      <View style={{ height: Spacing.five }} />
    </Screen>
  );
}
