import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { t } = useLocale();
  const { signIn, isAuthenticating } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.title}>{t('loginTitle')}</Text>
          <Text style={styles.subtitle}>Pick up where you left off and step back into Habesha Hearts.</Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={t('email')}
            placeholderTextColor={palette.textSecondary}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            placeholder={t('password')}
            placeholderTextColor={palette.textSecondary}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.primaryButton, isAuthenticating && styles.buttonDisabled]}
            disabled={isAuthenticating}
            onPress={async () => {
              try {
                setError(null);
                await signIn(email, password);
              } catch {
                setError(t('invalidCredentials'));
              }
            }}>
            <Text style={styles.primaryText}>{isAuthenticating ? 'Signing in…' : t('login')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/(auth)/signup')}>
            <Text style={styles.link}>{t('needAccount')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/welcome')}>
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -64,
    right: -54,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(166, 30, 42, 0.16)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 72,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 164, 65, 0.09)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topRow: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  heroBlock: {
    paddingTop: 72,
    gap: 8,
    maxWidth: 300,
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 288,
  },
  formCard: {
    backgroundColor: 'rgba(28, 21, 24, 0.9)',
    borderRadius: 28,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    backgroundColor: palette.surfaceLight,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  error: {
    color: '#FF9AA2',
    fontWeight: '700',
    paddingTop: 2,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 18,
  },
  linkButton: {
    alignItems: 'center',
  },
  link: {
    color: palette.accent,
    fontWeight: '700',
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    paddingTop: 2,
  },
  backText: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
});
