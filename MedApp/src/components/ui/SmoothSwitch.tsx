import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';

export interface SmoothSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
}

/** Animated capsule toggle switch matching MedApp profile notification settings styling. */
export function SmoothSwitch({ value, onValueChange }: SmoothSwitchProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', '#8B95F6'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      style={styles.switchTouchContainer}
    >
      <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.switchThumb,
            { transform: [{ translateX }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switchTouchContainer: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
});
