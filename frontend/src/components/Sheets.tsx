import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>{children}</View>
      </View>
    </Modal>
  );
}

interface Option<T extends string> { value: T; label: string; sublabel?: string }

export function OptionSheet<T extends string>({ visible, title, options, selected, onSelect, onClose }: {
  visible: boolean; title: string; options: Option<T>[]; selected: T | null; onSelect: (v: T) => void; onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <AppText variant="heading" style={{ paddingHorizontal: space.xl, paddingBottom: space.sm }}>{title}</AppText>
      {options.map((o) => (
        <Pressable
          key={o.value}
          onPress={() => { onSelect(o.value); onClose(); }}
          accessibilityRole="radio"
          accessibilityState={{ selected: o.value === selected }}
          android_ripple={{ color: colors.patinaTint }}
          style={styles.option}
        >
          <View style={{ flex: 1 }}>
            <AppText variant="bodyMedium">{o.label}</AppText>
            {o.sublabel ? <AppText variant="small" tone="muted">{o.sublabel}</AppText> : null}
          </View>
          {o.value === selected ? <Icon name="check" size={20} color={colors.patina} /> : null}
        </Pressable>
      ))}
    </Sheet>
  );
}

export function ConfirmSheet({ visible, title, body, confirmLabel, danger, loading, error, onConfirm, onCancel }: {
  visible: boolean; title: string; body: string; confirmLabel: string; danger?: boolean; loading?: boolean; error?: string | null;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={loading ? () => {} : onCancel}>
      <View style={{ paddingHorizontal: space.xl, gap: space.sm }}>
        <AppText variant="heading">{title}</AppText>
        <AppText tone="soft">{body}</AppText>
        {error ? (
          <View style={{ flexDirection: 'row', gap: 6, paddingTop: 4 }} accessibilityLiveRegion="polite">
            <Icon name="alert-circle" size={16} color={colors.brick} />
            <AppText variant="small" tone="brick" style={{ flex: 1 }}>{error}</AppText>
          </View>
        ) : null}
        <View style={{ gap: space.sm, paddingTop: space.lg }}>
          <Button title={confirmLabel} variant={danger ? 'danger' : 'primary'} loading={loading} onPress={onConfirm} />
          <Button title="Cancel" variant="quiet" disabled={loading} onPress={onCancel} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.folio, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingTop: space.xxl },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 58, paddingHorizontal: space.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.rule },
});
