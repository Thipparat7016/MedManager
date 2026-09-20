import { View, type ViewProps } from 'react-native';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const bgVal = type ? (theme as any)[type] : theme.background;
  const finalBg = typeof bgVal === 'string' ? bgVal : theme.background;

  return <View style={[{ backgroundColor: finalBg }, style]} {...otherProps} />;
}
