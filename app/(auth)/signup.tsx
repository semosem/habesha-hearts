import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/providers/AuthProvider';

export default function SignupScreen() {
  const { t } = useLocale();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>
        <Text style={styles.title}>{t('signupTitle')}</Text>
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
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          placeholder={t('confirmPassword')}
          placeholderTextColor={palette.textSecondary}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            if (!email.trim() || !password.trim()) {
              setError(t('fillRequired'));
              return;
            }
            if (password !== confirmPassword) {
              setError(t('passwordsDoNotMatch'));
              return;
            }
            setError(null);
            await signUp(email, password);
          }}>
          <Text style={styles.primaryText}>{t('createAccount')}</Text>
        </TouchableOpacity>
        <Link href="/(auth)/login" style={styles.link}>
          {t('alreadyHaveAccount')}
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
