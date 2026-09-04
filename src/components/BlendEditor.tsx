import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { PickerRow } from '@/components/PickerRow';
import { AppText, Button, Card, Row, TextField } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { useGreenBeans } from '@/db/beans';
import type { BlendComponentInput } from '@/db/blends';
import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';

type Draft = { key: string; green_bean_id: string; parts: string };

export function BlendEditor({
  initialName = '',
  initialNote = '',
  initialComponents = [],
  submitting,
  onSubmit,
}: {
  initialName?: string;
  initialNote?: string;
  initialComponents?: BlendComponentInput[];
  submitting?: boolean;
  onSubmit: (v: { name: string; note: string | null; components: BlendComponentInput[] }) => void;
}) {
  const theme = useTheme();
  const beans = useGreenBeans();
  const [name, setName] = useState(initialName);
  const [note, setNote] = useState(initialNote);
  const [rows, setRows] = useState<Draft[]>(
    initialComponents.map((c, i) => ({ key: `c${i}`, green_bean_id: c.green_bean_id, parts: String(c.parts) })),
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const totalParts = rows.reduce((s, r) => s + (Number(r.parts) || 0), 0);
  const beanName = (id: string) => beans.data?.find((b) => b.id === id)?.name_zh ?? id;

  const options = useMemo(
    () =>
      (beans.data ?? [])
        .filter((b) => !rows.some((r) => r.green_bean_id === b.id))
        .map((b) => ({ value: b.id, label: b.name_zh })),
    [beans.data, rows],
  );

  const addRow = (beanId: string | null) => {
    if (!beanId) return;
    setRows((prev) => [...prev, { key: `c${Date.now()}`, green_bean_id: beanId, parts: '1' }]);
    setPickerOpen(false);
  };

  const submit = () => {
    const components = rows
      .filter((r) => r.green_bean_id && Number(r.parts) > 0)
      .map((r) => ({ green_bean_id: r.green_bean_id, parts: Number(r.parts) }));
    if (!name.trim() || components.length === 0) {
      Alert.alert(t.blends.needTwo);
      return;
    }
    onSubmit({ name: name.trim(), note: note.trim() || null, components });
  };

  return (
    <View style={{ gap: Spacing.three }}>
      <TextField label={`${t.blends.name} (${t.common.required})`} value={name} onChangeText={setName} />

      <AppText variant="label" color="textSecondary">
        {t.blends.components}
      </AppText>
      {rows.map((r) => {
        const pct = totalParts > 0 ? Math.round(((Number(r.parts) || 0) / totalParts) * 100) : 0;
        return (
          <Card key={r.key}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText numberOfLines={1} style={{ flex: 1 }}>
                {beanName(r.green_bean_id)}
              </AppText>
              <Pressable onPress={() => setRows((prev) => prev.filter((x) => x.key !== r.key))} hitSlop={8}>
                <Ionicons name="close" size={18} color={theme.danger} />
              </Pressable>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ gap: Spacing.two }}>
                <AppText variant="caption" color="textSecondary">
                  {t.blends.parts}
                </AppText>
                <TextField
                  value={r.parts}
                  onChangeText={(v) =>
                    setRows((prev) => prev.map((x) => (x.key === r.key ? { ...x, parts: v.replace(/[^0-9.]/g, '') } : x)))
                  }
                  keyboardType="numeric"
                  style={{ width: 70, minHeight: 38 }}
                />
              </Row>
              <AppText variant="caption" color="textSecondary">
                {t.blends.ratio} {pct}%
              </AppText>
            </Row>
          </Card>
        );
      })}

      {pickerOpen ? (
        <PickerRow value={null} onChange={addRow} options={options} />
      ) : (
        <Button
          label={t.blends.addComponent}
          variant="secondary"
          onPress={() => setPickerOpen(true)}
          disabled={options.length === 0}
        />
      )}

      <TextField
        label={t.blends.note}
        value={note}
        onChangeText={setNote}
        multiline
        style={{ minHeight: 70, paddingTop: Spacing.two, textAlignVertical: 'top' }}
      />

      <Button label={t.blends.save} onPress={submit} loading={submitting} />
    </View>
  );
}
