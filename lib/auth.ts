import { deleteSecureValue, getSecureJSON, setSecureJSON } from '@/lib/secureStorage';

export const AUTH_STORAGE_KEYS = {
  credentials: '@hh/auth/credentials',
  session: '@hh/auth/session',
} as const;

export type StoredCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  verified: boolean;
  onboardingComplete: boolean;
  interests: string[];
  createdAt: string;
};

export async function getStoredCredentials() {
  return getSecureJSON<StoredCredentials | null>(AUTH_STORAGE_KEYS.credentials, null);
}

export async function setStoredCredentials(value: StoredCredentials) {
  return setSecureJSON(AUTH_STORAGE_KEYS.credentials, value);
}

export async function getStoredSession() {
  return getSecureJSON<AuthSession | null>(AUTH_STORAGE_KEYS.session, null);
}

export async function setStoredSession(value: AuthSession) {
  return setSecureJSON(AUTH_STORAGE_KEYS.session, value);
}

export async function clearStoredSession() {
  return deleteSecureValue(AUTH_STORAGE_KEYS.session);
}
