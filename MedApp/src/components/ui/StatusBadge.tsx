import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type BadgeVariant =
  | 'high'
  | 'medium'
  | 'low'
  | 'low_stock'
  | 'confirmed'
  | 'pending'
  | 'passed'
  | 'primary'
  | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
}) => {
  const getStyle = () => {
    switch (variant) {
      case 'high':
      case 'low_stock':
        return {
          bg: '#FEE2E2',
          text: '#EF4444',
          border: '#FECACA',
        };
      case 'medium':
        return {
          bg: '#FFEDD5',
          text: '#F97316',
          border: '#FED7AA',
        };
      case 'low':
      case 'pending':
        return {
          bg: '#FEF9C3',
          text: '#D97706',
          border: '#FEF08A',
        };
      case 'confirmed':
        return {
          bg: '#DCFCE7',
          text: '#16A34A',
          border: '#BBF7D0',
        };
      case 'passed':
        return {
          bg: '#F1F5F9',
          text: '#94A3B8',
          border: '#E2E8F0',
        };
      case 'primary':
        return {
          bg: '#EEF0FF',
          text: '#6366F1',
          border: '#C7D2FE',
        };
      default:
        return {
          bg: '#F8FAFC',
          text: '#64748B',
          border: '#E2E8F0',
        };
    }
  };

  const styleConfig = getStyle();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: styleConfig.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '700',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 12,
  },
});
