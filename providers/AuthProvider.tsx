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
import { DEFAULT_CURRENT_USER, getJSON, resetUserScopedState, setJSON, STORAGE_KEYS } from '@/lib/storage';

type AuthStatus = 'loading' | 'signed_out' | 'signed_in_unverified' | 'signed_in_onboarding' | 'signed_in_ready';

type OnboardingInput = {
  name: string;
  city: string;
  intent: string;
  photoUrl: string;
  interests: string[];
};

type OnboardingDraft = {
  name: string;
  city: string;
  intent: string;
  photoUrl: string;
  interests: string[];
};

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  onboardingDraft: OnboardingDraft;
  isAuthenticating: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  verifyAccount: () => Promise<void>;
  updateOnboardingDraft: (patch: Partial<OnboardingDraft>) => void;
  completeOnboarding: (input?: Partial<OnboardingInput>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  name: '',
  city: 'Addis Ababa',
  intent: 'Dating',
  photoUrl: '',
  interests: [],
};

function deriveStatus(session: AuthSession | null): AuthStatus {
  if (!session) return 'signed_out';
  if (!session.verified) return 'signed_in_unverified';
  if (!session.onboardingComplete) return 'signed_in_onboarding';
  return 'signed_in_ready';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const applySession = useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession);
    setStatus(deriveStatus(nextSession));
  }, []);

  const updateOnboardingDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setOnboardingDraft((current) => ({ ...current, ...patch }));
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
      await resetUserScopedState();
      setOnboardingDraft(DEFAULT_ONBOARDING_DRAFT);
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

      await resetUserScopedState();
      setOnboardingDraft(DEFAULT_ONBOARDING_DRAFT);
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

      await resetUserScopedState();
      setOnboardingDraft(DEFAULT_ONBOARDING_DRAFT);
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
    async (input?: Partial<OnboardingInput>) => {
      if (!session) return;

      const finalDraft = {
        ...onboardingDraft,
        ...input,
      };

      const currentUser = await getJSON(STORAGE_KEYS.currentUser, DEFAULT_CURRENT_USER);

      await setJSON(STORAGE_KEYS.currentUser, {
        ...currentUser,
        name: finalDraft.name,
        city: finalDraft.city,
        intent: finalDraft.intent,
        photoUrl: finalDraft.photoUrl,
        interests: finalDraft.interests,
      });

      const nextSession = {
        ...session,
        onboardingComplete: true,
        interests: finalDraft.interests,
      };
      await setStoredSession(nextSession);
      setOnboardingDraft(DEFAULT_ONBOARDING_DRAFT);
      applySession(nextSession);
    },
    [applySession, onboardingDraft, session]
  );

  const signOut = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      await clearStoredSession();
      await resetUserScopedState();
      setOnboardingDraft(DEFAULT_ONBOARDING_DRAFT);
      applySession(null);
    } finally {
      setIsAuthenticating(false);
    }
  }, [applySession]);

  const value = useMemo(
    () => ({
      status,
      session,
      onboardingDraft,
      isAuthenticating,
      signIn,
      signUp,
      verifyAccount,
      updateOnboardingDraft,
      completeOnboarding,
      signOut,
      refreshSession,
    }),
    [completeOnboarding, isAuthenticating, onboardingDraft, refreshSession, session, signIn, signOut, signUp, status, updateOnboardingDraft, verifyAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
