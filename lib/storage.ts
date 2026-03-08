import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  profiles: '@hh/profiles',
  currentUser: '@hh/currentUser',
  likes: '@hh/likes',
  passes: '@hh/passes',
  matches: '@hh/matches',
  messages: '@hh/messages',
  blocked: '@hh/blocked'
} as const;

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // swallow; best effort
  }
}

export type Match = {
  id: string;
  profileId: string;
  createdAt: string;
};

export type Message = {
  matchId: string;
  from: 'me' | 'them';
  text: string;
  createdAt: string;
};

export type MessageMap = Record<string, Message[]>;
