import type { ReactElement, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme';

interface Props {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  /** Add the bottom safe-area inset. Tab screens pass false because the tab bar already covers it. */
  padBottom?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
}

export function Screen({ children, header, footer, scroll = true, padBottom = true, refreshControl }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = padBottom ? insets.bottom : 0;
  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: footer ? space.xxl : bottom + space.x3 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  footer: { backgroundColor: colors.folio, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.rule, paddingTop: space.lg, paddingHorizontal: space.xl, gap: space.sm },
});
