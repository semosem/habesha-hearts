import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  AuthSession,
  clearStoredSession,
  getStoredCredentials,
  getStoredSession,
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  verifyAccount: () => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    const bootstrap = async () => {
      const storedSession = await getStoredSession();
      setSession(storedSession);
      setStatus(deriveStatus(storedSession));
    };
    void bootstrap();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const newSession: AuthSession = {
      userId: `user-${Date.now()}`,
      email: normalizedEmail,
      verified: false,
      onboardingComplete: false,
      interests: [],
      createdAt: new Date().toISOString(),
    };

    await setStoredCredentials({ email: normalizedEmail, password });
    await setStoredSession(newSession);
    setSession(newSession);
    setStatus(deriveStatus(newSession));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const credentials = await getStoredCredentials();
    const storedSession = await getStoredSession();

    if (!credentials || credentials.email !== normalizedEmail || credentials.password !== password || !storedSession) {
      throw new Error('Invalid credentials');
    }

    setSession(storedSession);
    setStatus(deriveStatus(storedSession));
  }, []);

  const verifyAccount = useCallback(async () => {
    if (!session) return;
    const nextSession = { ...session, verified: true };
    await setStoredSession(nextSession);
    setSession(nextSession);
    setStatus(deriveStatus(nextSession));
  }, [session]);

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
      setSession(nextSession);
      setStatus(deriveStatus(nextSession));
    },
    [session]
  );

  const signOut = useCallback(async () => {
    await clearStoredSession();
    setSession(null);
    setStatus('signed_out');
  }, []);

  const value = useMemo(
    () => ({ status, session, signIn, signUp, verifyAccount, completeOnboarding, signOut }),
    [completeOnboarding, session, signIn, signOut, signUp, status, verifyAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
