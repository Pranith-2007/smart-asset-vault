import { forwardRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, space, type } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  hint?: string;
  right?: ReactNode;
}

export const Field = forwardRef<TextInput, Props>(function Field({ label, error, hint, right, multiline, style, onFocus, onBlur, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <AppText variant="label" tone="soft">{label}</AppText>
      <View
        style={[
          styles.box,
          { borderColor: error ? colors.brick : focused ? colors.patina : colors.ruleStrong },
          multiline && { minHeight: 104, alignItems: 'flex-start' },
        ]}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.patina}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && { paddingTop: 14, minHeight: 104 }, style]}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <View style={styles.msg} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" size={14} color={colors.brick} />
          <AppText variant="small" tone="brick" style={{ flex: 1 }}>{error}</AppText>
        </View>
      ) : hint ? (
        <AppText variant="small" tone="muted">{hint}</AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.field, backgroundColor: colors.folio, paddingHorizontal: 14, minHeight: 52 },
  input: { ...type.body, flex: 1, color: colors.ink, paddingVertical: 12 },
  msg: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingTop: 2 },
});

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      style={{ width: 44, height: 44, marginRight: -space.sm, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={visible ? 'eye-off' : 'eye'} size={19} color={colors.muted} />
    </Pressable>
  );
}
