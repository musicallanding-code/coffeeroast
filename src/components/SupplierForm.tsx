import { useState } from 'react';
import { View } from 'react-native';

import { Button, TextField } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import type { SupplierInput, SupplierRow } from '@/db/types';
import { t } from '@/i18n/zh-TW';

export function SupplierForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: SupplierRow | null;
  submitting?: boolean;
  onSubmit: (input: SupplierInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [contact, setContact] = useState(initial?.contact ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [note, setNote] = useState(initial?.note ?? '');

  return (
    <View style={{ gap: Spacing.three }}>
      <TextField label={`${t.suppliers.name} (${t.common.required})`} value={name} onChangeText={setName} />
      <TextField label={t.suppliers.contact} value={contact} onChangeText={setContact} />
      <TextField label={t.suppliers.phone} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextField label={t.suppliers.address} value={address} onChangeText={setAddress} />
      <TextField
        label={t.suppliers.note}
        value={note}
        onChangeText={setNote}
        multiline
        style={{ minHeight: 80, paddingTop: Spacing.two, textAlignVertical: 'top' }}
      />
      <Button
        label={t.suppliers.save}
        disabled={!name.trim() || submitting}
        loading={submitting}
        onPress={() =>
          onSubmit({
            name: name.trim(),
            contact: contact.trim() || null,
            phone: phone.trim() || null,
            address: address.trim() || null,
            note: note.trim() || null,
          })
        }
      />
    </View>
  );
}
