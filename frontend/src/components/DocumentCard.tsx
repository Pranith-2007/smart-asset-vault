
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, docTints, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface CardProps {
  title: string;
  statement: string;
  icon: IconName;
  tint: keyof typeof docTints;
  width: number;
  actionLabel: string;
  actionIcon: IconName;
  onOpen: () => void;
  onAction: () => void;
}

/** Document card with separate open and action buttons. */
export function DocumentCard({
  title,
  statement,
  icon,
  tint,
  width,
  actionLabel,
  actionIcon,
  onOpen,
  onAction,
}: CardProps) {
  const t = docTints[tint];

  return (
    <View
      style={[
        styles.card,
        {
          width,
          backgroundColor: colors.folio,
          borderColor: t.bg,
        },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.iconCircle, { backgroundColor: t.bg }]}>
            <Icon name={icon} size={25} color={t.fg} />
          </View>

          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={`${actionLabel} ${title}`}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: t.fg },
              pressed && styles.actionPressed,
            ]}
          >
            <Icon name={actionIcon} size={16} color="#FFFFFF" />
            <AppText
              variant="label"
              style={styles.actionText}
            >
              {actionLabel}
            </AppText>
          </Pressable>
        </View>

        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={`Open ${title}. ${statement}`}
          android_ripple={{ color: t.bg }}
          style={styles.description}
        >
          <AppText variant="cardTitle" numberOfLines={2}>
            {title}
          </AppText>

          <AppText
            variant="small"
            tone="soft"
            numberOfLines={3}
            style={styles.statement}
          >
            {statement}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

/** Opens the complete document and asset collection. */
export function AllDocumentsCard({
  statement,
  width,
  onOpen,
}: {
  statement: string;
  width: number;
  onOpen: () => void;
}) {
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`All Documents. ${statement}`}
      android_ripple={{ color: colors.blueTint }}
      style={({ pressed }) => [
        styles.card,
        styles.allCard,
        { width },
        pressed && styles.allCardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.blueTint },
          ]}
        >
          <Icon name="folder" size={25} color={colors.blue} />
        </View>

        <Icon name="arrow-up-right" size={22} color={colors.blue} />
      </View>

      <View style={styles.description}>
        <AppText variant="cardTitle">
          All Documents
        </AppText>

        <AppText
          variant="small"
          tone="soft"
          style={styles.statement}
        >
          {statement}
        </AppText>
      </View>

      <View style={styles.open}>
        <AppText
          variant="label"
          style={styles.openLabel}
        >
          Open documents
        </AppText>

        <Icon name="arrow-right" size={16} color={colors.blue} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 190,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
  },
  body: {
    flex: 1,
    padding: space.lg,
    gap: space.lg,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    gap: space.xs,
    paddingVertical: 2,
  },
  statement: {
    fontSize: 15,
    lineHeight: 21,
  },
  action: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: radius.round,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPressed: {
    opacity: 0.82,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  allCard: {
    padding: space.lg,
    gap: space.md,
    justifyContent: 'space-between',
    backgroundColor: colors.folio,
    borderColor: colors.rule,
  },
  allCardPressed: {
    backgroundColor: colors.blueSoft,
  },
  open: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
  },
  openLabel: {
    color: colors.blue,
    fontSize: 15,
  },
});
