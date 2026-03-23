import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Detect if we're in a browser environment
const isWeb = typeof window !== 'undefined' && Platform.OS !== 'ios' && Platform.OS !== 'android';

// Platform-aware storage: uses localStorage on web, AsyncStorage on native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Storage error reading ${key}:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Storage error writing ${key}:`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Storage error removing ${key}:`, error);
    }
  },
};

export default storage;
