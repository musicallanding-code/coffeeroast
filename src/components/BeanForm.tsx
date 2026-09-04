import { useState } from 'react';
import { View } from 'react-native';

import { Button, TextField } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import type { GreenBeanInput, GreenBeanRow } from '@/db/types';
import { t } from '@/i18n/zh-TW';

export function BeanForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: GreenBeanRow | null;
  submitting?: boolean;
  onSubmit: (input: GreenBeanInput) => void;
}) {
  const [nameZh, setNameZh] = useState(initial?.name_zh ?? '');
  const [nameEn, setNameEn] = useState(initial?.name_en ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [region, setRegion] = useState(initial?.region ?? '');
  const [farm, setFarm] = useState(initial?.farm ?? '');
  const [process, setProcess] = useState(initial?.process ?? '');
  const [variety, setVariety] = useState(initial?.variety ?? '');
  const [altitude, setAltitude] = useState(initial?.altitude ?? '');
  const [flavor, setFlavor] = useState(initial?.flavor_notes ?? '');

  const canSave = nameZh.trim().length > 0 && !submitting;

  const submit = () =>
    onSubmit({
      name_zh: nameZh.trim(),
      name_en: nameEn.trim() || null,
      code: code.trim() || null,
      region: region.trim() || null,
      farm: farm.trim() || null,
      process: process.trim() || null,
      variety: variety.trim() || null,
      altitude: altitude.trim() || null,
      flavor_notes: flavor.trim() || null,
    });

  return (
    <View style={{ gap: Spacing.three }}>
      <TextField label={`${t.beans.nameZh} (${t.common.required})`} value={nameZh} onChangeText={setNameZh} />
      <TextField label={t.beans.nameEn} value={nameEn} onChangeText={setNameEn} autoCapitalize="words" />
      <TextField label={t.beans.code} value={code} onChangeText={setCode} autoCapitalize="none" />
      <TextField label={t.beans.country} value={region} onChangeText={setRegion} />
      <TextField label={t.beans.farm} value={farm} onChangeText={setFarm} />
      <TextField label={t.beans.process} value={process} onChangeText={setProcess} />
      <TextField label={t.beans.variety} value={variety} onChangeText={setVariety} />
      <TextField label={t.beans.altitude} value={altitude} onChangeText={setAltitude} />
      <TextField
        label={t.beans.flavorNotes}
        value={flavor}
        onChangeText={setFlavor}
        multiline
        numberOfLines={4}
        style={{ minHeight: 96, paddingTop: Spacing.two, textAlignVertical: 'top' }}
      />
      <Button label={t.beans.save} onPress={submit} disabled={!canSave} loading={submitting} />
    </View>
  );
}
