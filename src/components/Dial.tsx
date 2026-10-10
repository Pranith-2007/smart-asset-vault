import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';
import { AppText } from './AppText';

const polar = (c: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
};

interface Props { value: number; total?: number; size?: number; showValue?: boolean }

/**
 * The Vault Dial: one segment per security check, drawn like a notary's seal.
 * Filled segments are checks that are met. It is the app's single memorable element.
 */
export function Dial({ value, total = 12, size = 136, showValue = true }: Props) {
  const c = size / 2;
  const r = c - size * 0.1;
  const seg = 360 / total;
  const gap = Math.max(4, size * 0.04);
  const stroke = size * 0.075;
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${value} of ${total} security checks complete`}
    >
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={c - 1.5} stroke={colors.brass} strokeWidth={1} fill="none" />
        {Array.from({ length: total }, (_, i) => {
          const half = (gap / r) * (90 / Math.PI); // half the gap, as degrees of arc
          const start = -90 + i * seg + half;
          const end = -90 + (i + 1) * seg - half;
          const p0 = polar(c, r, start);
          const p1 = polar(c, r, end);
          return (
            <Path
              key={i}
              d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`}
              stroke={i < value ? colors.patina : colors.rule}
              strokeWidth={stroke}
              fill="none"
            />
          );
        })}
      </Svg>
      {showValue ? (
        <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
          <AppText variant="display" style={{ fontSize: size * 0.3, lineHeight: size * 0.34 }}>{value}</AppText>
          <AppText variant="small" tone="muted">{`of ${total}`}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
