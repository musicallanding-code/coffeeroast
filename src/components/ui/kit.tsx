import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Screen({
  children,
  scroll = false,
  padded = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const inner = (
    <View style={[padded && styles.screenPad, { flexGrow: 1 }, style]}>{children}</View>
  );
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing.six }}>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        style,
      ]}>
      {children}
    </View>
  );
}

export function AppText({
  children,
  variant = 'body',
  color = 'text',
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  variant?: 'display' | 'title' | 'heading' | 'body' | 'label' | 'mono' | 'caption';
  color?: ThemeColor;
  style?: StyleProp<any>;
  numberOfLines?: number;
}) {
  const theme = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[styles.text, textVariants[variant], { color: theme[color] }, style]}>
      {children}
    </Text>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const bg =
    variant === 'primary'
      ? theme.tint
      : variant === 'danger'
        ? theme.danger
        : variant === 'secondary'
          ? theme.backgroundSelected
          : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger'
      ? theme.tintText
      : variant === 'ghost'
        ? theme.tint
        : theme.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { paddingVertical: Spacing.two },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export const TextField = forwardRef<TextInput, TextInputProps & { label?: string; hint?: string }>(
  function TextField({ label, hint, style, ...props }, ref) {
    const theme = useTheme();
    return (
      <View style={{ gap: Spacing.one }}>
        {label ? <AppText variant="label" color="textSecondary">{label}</AppText> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
            style,
          ]}
          {...props}
        />
        {hint ? <AppText variant="caption" color="textSecondary">{hint}</AppText> : null}
      </View>
    );
  },
);

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.segmented, { borderColor: theme.border }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              { backgroundColor: active ? theme.tint : 'transparent' },
            ]}>
            <Text style={{ color: active ? theme.tintText : theme.text, fontWeight: '600', fontSize: 13 }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ListRow({ onPress, children }: { onPress?: () => void; children: React.ReactNode } & Pick<PressableProps, 'onPress'>) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.listRow,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      {children}
    </Pressable>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <AppText variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
        {text}
      </AppText>
    </View>
  );
}

export function Pill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'accent' | 'success' }) {
  const theme = useTheme();
  const bg = tone === 'accent' ? theme.accent : tone === 'success' ? theme.success : theme.backgroundSelected;
  const fg = tone === 'neutral' ? theme.text : theme.tintText;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, style]}>{children}</View>;
}

const textVariants = StyleSheet.create({
  display: { fontSize: 34, fontWeight: '700', lineHeight: 40 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  heading: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  mono: { fontSize: 15, fontWeight: '500', fontVariant: ['tabular-nums'] },
});

const styles = StyleSheet.create({
  screenPad: { padding: Spacing.three, gap: Spacing.three },
  text: {},
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  button: {
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  input: {
    minHeight: 46,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  segment: { flex: 1, paddingVertical: Spacing.two, alignItems: 'center' },
  listRow: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.five, minHeight: 200 },
  pill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
});

export { Colors };
