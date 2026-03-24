import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-aware storage: uses localStorage on web, AsyncStorage on native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Use AsyncStorage for iOS/Android native apps
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      // Fallback for web or when AsyncStorage is not available
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`Storage error reading ${key}:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Storage error writing ${key}:`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Storage error removing ${key}:`, error);
    }
  },
};

export default storage;
