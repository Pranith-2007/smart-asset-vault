import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, radius } from '@/theme';
import { formatDate } from '@/utils/format';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  error?: string | null;
  minimumDate?: Date;
  maximumDate?: Date;
}

/** Uses the native Android date dialog. */
export function DateField({ label, value, onChange, placeholder = 'Choose a date', error, minimumDate, maximumDate }: Props) {
  const open = () => {
    if (Platform.OS !== 'android') return;
    DateTimePickerAndroid.open({
      value: value ?? new Date(),
      mode: 'date',
      minimumDate,
      maximumDate,
      onValueChange: (_e, d) => onChange(d),
    });
  };
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label" tone="soft">{label}</AppText>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value ? formatDate(value) : 'not set'}`}
        style={[styles.box, { borderColor: error ? colors.brick : colors.ruleStrong }]}
      >
        <AppText tone={value ? 'ink' : 'muted'} style={{ flex: 1, color: value ? colors.ink : colors.placeholder }}>
          {value ? formatDate(value) : placeholder}
        </AppText>
        <Icon name="calendar" size={18} color={colors.muted} />
      </Pressable>
      {error ? (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Icon name="alert-circle" size={14} color={colors.brick} />
          <AppText variant="small" tone="brick" style={{ flex: 1 }}>{error}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.field, backgroundColor: colors.folio, paddingHorizontal: 14, minHeight: 52 },
});
