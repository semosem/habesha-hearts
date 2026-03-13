import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/providers/AuthProvider';

export default function VerifyScreen() {
  const { t } = useLocale();
  const { session, verifyAccount, signOut, isAuthenticating } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>
        <Text style={styles.title}>{t('verifyTitle')}</Text>
        <Text style={styles.subtitle}>{t('verifyHint', { email: session?.email || '' })}</Text>
        <TouchableOpacity
          style={[styles.primaryButton, isAuthenticating && styles.buttonDisabled]}
          disabled={isAuthenticating}
          onPress={() => void verifyAccount()}>
          <Text style={styles.primaryText}>{t('verifyNow')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, isAuthenticating && styles.buttonDisabled]}
          disabled={isAuthenticating}
          onPress={() => void signOut()}>
          <Text style={styles.secondaryText}>{isAuthenticating ? 'Signing out…' : t('signOut')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 14 },
  topRow: { position: 'absolute', top: 20, right: 24 },
  title: { color: palette.textPrimary, fontSize: 32, fontWeight: '900' },
  subtitle: { color: palette.textSecondary, fontSize: 16, lineHeight: 24 },
  primaryButton: { backgroundColor: palette.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryText: { color: palette.textPrimary, fontWeight: '800', fontSize: 16 },
});
