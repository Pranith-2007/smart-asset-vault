import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, space, type } from '@/theme';
import { Icon } from './Icon';

export function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.box}>
      <Icon name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.patina}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
          <Icon name="x" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48, marginHorizontal: space.xl, paddingHorizontal: 14, borderRadius: radius.field, borderWidth: 1.5, borderColor: colors.ruleStrong, backgroundColor: colors.folio },
  input: { ...type.body, flex: 1, paddingVertical: 10, color: colors.ink },
});
