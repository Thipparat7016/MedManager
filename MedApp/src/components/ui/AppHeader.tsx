import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightActionText?: string;
  onRightActionPress?: () => void;
  rightActionColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightAction,
  rightActionText,
  onRightActionPress,
  rightActionColor,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, !showBack && styles.titleNoBack]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : rightActionText ? (
        <TouchableOpacity
          onPress={onRightActionPress}
          activeOpacity={0.7}
          style={styles.rightTextButton}
        >
          <Text
            style={[
              styles.rightActionText,
              rightActionColor ? { color: rightActionColor } : {},
            ]}
          >
            {rightActionText}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyRight} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  titleNoBack: {
    fontSize: 22,
    fontWeight: '800',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightTextButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  rightActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B95F6',
  },
  emptyRight: {
    width: 24,
  },
});
