import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStoredJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setStoredJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort
  }
}

export async function deleteStoredValue(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // best effort
  }
}
