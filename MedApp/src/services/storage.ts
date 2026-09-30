import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memoryFallback: Record<string, string> = {};

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryFallback[key] || null;
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn(`safeStorage.getItem(${key}) failed:`, e);
      return memoryFallback[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
        memoryFallback[key] = value;
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn(`safeStorage.setItem(${key}) failed:`, e);
      memoryFallback[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
        delete memoryFallback[key];
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`safeStorage.removeItem(${key}) failed:`, e);
      delete memoryFallback[key];
    }
  },
};
