import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { LocaleProvider } from '@/lib/i18n';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { palette } from '@/constants/theme';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => undefined);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, []);

  return (
    <LocaleProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const { status } = useAuth();
  const inAuthGroup = segments[0] === '(auth)';
  const inOnboardingGroup = segments[0] === '(onboarding)';
  const inTabsGroup = segments[0] === '(tabs)';
  const inProfileDetail = segments[0] === 'profiles';
  const navigationReady = !!rootNavigationState?.key;

  useEffect(() => {
    if (!navigationReady || status === 'loading') return;

    if (status === 'signed_out' && !inAuthGroup) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (status === 'signed_in_unverified' && !inAuthGroup) {
      router.replace('/(auth)/verify');
      return;
    }

    if (status === 'signed_in_onboarding' && !inOnboardingGroup) {
      router.replace('/(onboarding)/basics');
      return;
    }

    if (status === 'signed_in_ready' && !inTabsGroup && !inProfileDetail) {
      router.replace('/(tabs)');
    }
  }, [inAuthGroup, inOnboardingGroup, inProfileDetail, inTabsGroup, navigationReady, router, status]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profiles/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {status === 'loading' ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: palette.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : null}
    </>
  );
}
