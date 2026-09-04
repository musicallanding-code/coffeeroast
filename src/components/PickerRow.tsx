import { Pressable, ScrollView } from 'react-native';

import { AppText } from '@/components/ui/kit';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type PickerOption = { value: string | null; label: string; sub?: string };

/** Horizontal chip picker. */
export function PickerRow({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: PickerOption[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const theme = useTheme();
  return (
    <>
      {label ? (
        <AppText variant="label" color="textSecondary">
          {label}
        </AppText>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: Spacing.two, paddingVertical: 2 }}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value ?? '__none__'}
              onPress={() => onChange(opt.value)}
              style={{
                paddingHorizontal: Spacing.three,
                paddingVertical: Spacing.two,
                borderRadius: Radius.md,
                borderWidth: 1,
                borderColor: active ? theme.tint : theme.border,
                backgroundColor: active ? theme.tint : theme.backgroundElement,
                maxWidth: 240,
              }}>
              <AppText numberOfLines={1} color={active ? 'tintText' : 'text'}>
                {opt.label}
              </AppText>
              {opt.sub ? (
                <AppText variant="caption" color={active ? 'tintText' : 'textSecondary'} numberOfLines={1}>
                  {opt.sub}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}
