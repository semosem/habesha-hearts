import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import {
  AuthSession,
  clearStoredSession,
  createSessionTokens,
  getStoredCredentials,
  getStoredSession,
  isRefreshWindowExpired,
  isSessionExpired,
  refreshSessionTokens,
  setStoredCredentials,
  setStoredSession,
} from '@/lib/auth';
import { getJSON, setJSON, STORAGE_KEYS } from '@/lib/storage';

type AuthStatus = 'loading' | 'signed_out' | 'signed_in_unverified' | 'signed_in_onboarding' | 'signed_in_ready';

type OnboardingInput = {
  name: string;
  city: string;
  intent: string;
  photoUrl: string;
  interests: string[];
};

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  isAuthenticating: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  verifyAccount: () => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveStatus(session: AuthSession | null): AuthStatus {
  if (!session) return 'signed_out';
  if (!session.verified) return 'signed_in_unverified';
  if (!session.onboardingComplete) return 'signed_in_onboarding';
  return 'signed_in_ready';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const applySession = useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession);
    setStatus(deriveStatus(nextSession));
  }, []);

  const refreshSession = useCallback(async () => {
    const storedSession = await getStoredSession();

    if (!storedSession) {
      applySession(null);
      return;
    }

    const hasTokenState = Boolean(storedSession.accessToken && storedSession.refreshToken && storedSession.expiresAt);
    const normalizedSession = hasTokenState
      ? storedSession
      : {
          ...storedSession,
          ...createSessionTokens(),
        };

    if (!hasTokenState) {
      await setStoredSession(normalizedSession);
    }

    if (!isSessionExpired(normalizedSession)) {
      applySession(normalizedSession);
      return;
    }

    if (isRefreshWindowExpired(normalizedSession)) {
      await clearStoredSession();
      applySession(null);
      return;
    }

    const refreshedSession = refreshSessionTokens(normalizedSession);
    await setStoredSession(refreshedSession);
    applySession(refreshedSession);
  }, [applySession]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void refreshSession();
      }
    });

    return () => subscription.remove();
  }, [refreshSession]);

  const signUp = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const now = Date.now();
      const newSession: AuthSession = {
        userId: `user-${now}`,
        email: normalizedEmail,
        verified: false,
        onboardingComplete: false,
        interests: [],
        createdAt: new Date(now).toISOString(),
        ...createSessionTokens(now),
      };

      await setStoredCredentials({ email: normalizedEmail, password });
      await setStoredSession(newSession);
      applySession(newSession);
    } finally {
      setIsAuthenticating(false);
    }
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const credentials = await getStoredCredentials();
      const storedSession = await getStoredSession();

      if (!credentials || credentials.email !== normalizedEmail || credentials.password !== password || !storedSession) {
        throw new Error('Invalid credentials');
      }

      const refreshedSession = refreshSessionTokens({
        ...storedSession,
        email: normalizedEmail,
      });

      await setStoredSession(refreshedSession);
      applySession(refreshedSession);
    } finally {
      setIsAuthenticating(false);
    }
  }, [applySession]);

  const verifyAccount = useCallback(async () => {
    if (!session) return;
    const nextSession = { ...session, verified: true };
    await setStoredSession(nextSession);
    applySession(nextSession);
  }, [applySession, session]);

  const completeOnboarding = useCallback(
    async (input: OnboardingInput) => {
      if (!session) return;

      const currentUser = await getJSON(STORAGE_KEYS.currentUser, {
        name: 'You',
        city: 'Addis Ababa',
        intent: 'Dating',
        photoUrl: '',
      });

      await setJSON(STORAGE_KEYS.currentUser, {
        ...currentUser,
        name: input.name,
        city: input.city,
        intent: input.intent,
        photoUrl: input.photoUrl,
        interests: input.interests,
      });

      const nextSession = {
        ...session,
        onboardingComplete: true,
        interests: input.interests,
      };
      await setStoredSession(nextSession);
      applySession(nextSession);
    },
    [applySession, session]
  );

  const signOut = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      await clearStoredSession();
      applySession(null);
    } finally {
      setIsAuthenticating(false);
    }
  }, [applySession]);

  const value = useMemo(
    () => ({ status, session, isAuthenticating, signIn, signUp, verifyAccount, completeOnboarding, signOut, refreshSession }),
    [completeOnboarding, isAuthenticating, refreshSession, session, signIn, signOut, signUp, status, verifyAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
