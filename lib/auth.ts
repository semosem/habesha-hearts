import { deleteSecureValue, getSecureJSON, setSecureJSON } from '@/lib/secureStorage';

export const AUTH_STORAGE_KEYS = {
  credentials: '@hh/auth/credentials',
  session: '@hh/auth/session',
} as const;

const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 30;
const REFRESH_GRACE_TTL_MS = 1000 * 60 * 60 * 24 * 14;

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
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  lastAuthenticatedAt: string;
};

function createOpaqueToken(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function createSessionTokens(now = Date.now()) {
  return {
    accessToken: createOpaqueToken('hh_at'),
    refreshToken: createOpaqueToken('hh_rt'),
    expiresAt: new Date(now + ACCESS_TOKEN_TTL_MS).toISOString(),
    lastAuthenticatedAt: new Date(now).toISOString(),
  };
}

export function isSessionExpired(session: AuthSession, now = Date.now()) {
  return new Date(session.expiresAt).getTime() <= now;
}

export function isRefreshWindowExpired(session: AuthSession, now = Date.now()) {
  return new Date(session.lastAuthenticatedAt).getTime() + REFRESH_GRACE_TTL_MS <= now;
}

export function refreshSessionTokens(session: AuthSession, now = Date.now()): AuthSession {
  const nextTokens = createSessionTokens(now);
  return {
    ...session,
    ...nextTokens,
    refreshToken: session.refreshToken || nextTokens.refreshToken,
  };
}

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
