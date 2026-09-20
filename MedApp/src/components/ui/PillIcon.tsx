import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface PillIconProps {
  type?: 'เม็ด' | 'อาหารเสริม' | 'แคปซูล' | 'ยาน้ำ' | string;
  size?: number;
  containerSize?: number;
  bg?: string;
  color?: string;
  disabled?: boolean;
}

export const PillIcon: React.FC<PillIconProps> = ({
  type = 'เม็ด',
  size = 20,
  containerSize = 44,
  bg,
  color,
  disabled = false,
}) => {
  let defaultBg = '#EEF0FF';
  let defaultColor = '#8B95F6';
  let iconName: any = 'pill';

  if (disabled) {
    defaultBg = '#F1F5F9';
    defaultColor = '#94A3B8';
  } else if (type === 'แคปซูล') {
    defaultBg = '#EEF0FF';
    defaultColor = '#8B95F6';
    iconName = 'pill';
  } else if (type === 'อาหารเสริม' || type === 'วิตามินซี') {
    defaultBg = '#E6F7ED';
    defaultColor = '#10B981';
    iconName = 'bottle-tonic-plus';
  } else if (type === 'ยาน้ำ') {
    defaultBg = '#EBF4FE';
    defaultColor = '#3B82F6';
    iconName = 'cup-water';
  } else if (type === 'วิตามินดี' || type === 'โอเมก้า-3') {
    defaultBg = '#E8F8EE';
    defaultColor = '#10B981';
    iconName = 'pill';
  }

  const backgroundColor = bg || defaultBg;
  const iconColor = color || defaultColor;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 3.5,
          backgroundColor,
        },
      ]}
    >
      <MaterialCommunityIcons name={iconName} size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
