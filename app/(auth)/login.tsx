import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { palette } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useLocale } from '@/lib/i18n';

export default function LoginScreen() {
  const { t } = useLocale();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>
        <Text style={styles.title}>{t('loginTitle')}</Text>
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
          style={styles.primaryButton}
          onPress={async () => {
            try {
              setError(null);
              await signIn(email, password);
            } catch {
              setError(t('invalidCredentials'));
            }
          }}>
          <Text style={styles.primaryText}>{t('login')}</Text>
        </TouchableOpacity>
        <Link href="/(auth)/signup" style={styles.link}>
          {t('needAccount')}
        </Link>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 12 },
  topRow: { position: 'absolute', top: 20, right: 24 },
  title: { color: palette.textPrimary, fontSize: 32, fontWeight: '900', marginBottom: 4 },
  input: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  error: { color: '#FF7D87', fontWeight: '700' },
  primaryButton: { backgroundColor: palette.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  link: { color: palette.accent, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  backButton: { alignItems: 'center', paddingTop: 8 },
  backText: { color: palette.textSecondary, fontWeight: '700' },
});
