import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabBarProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
      params?: object;
    }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        tabBarAccessibilityLabel?: string;
        tabBarButtonTestID?: string;
      };
    }
  >;
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
}

export const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();

  const getTabInfo = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return {
          label: 'หน้าหลัก',
          renderIcon: (color: string) => <Ionicons name="home-outline" size={22} color={color} />,
        };
      case 'medications':
        return {
          label: 'ยาของฉัน',
          renderIcon: (color: string) => <MaterialCommunityIcons name="pill" size={22} color={color} />,
        };
      case 'appointments':
        return {
          label: 'นัดหมาย',
          renderIcon: (color: string) => <Ionicons name="clipboard-outline" size={22} color={color} />,
        };
      case 'profile':
        return {
          label: 'โปรไฟล์',
          renderIcon: (color: string) => <Ionicons name="person-outline" size={22} color={color} />,
        };
      default:
        return {
          label: routeName,
          renderIcon: (color: string) => <Ionicons name="ellipse-outline" size={22} color={color} />,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key] || { options: {} };
        const isFocused = state.index === index;
        const tabInfo = getTabInfo(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const activeColor = '#8B95F6';
        const inactiveColor = '#94A3B8';
        const color = isFocused ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.activeTopLine} />}
            <View style={styles.iconContainer}>{tabInfo.renderIcon(color)}</View>
            <Text style={[styles.label, { color }]}>{tabInfo.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeTopLine: {
    position: 'absolute',
    top: -8,
    width: 48,
    height: 3,
    backgroundColor: '#8B95F6',
    borderRadius: 2,
  },
  iconContainer: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },
});
