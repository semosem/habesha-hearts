import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { setJSON, STORAGE_KEYS } from '@/lib/storage';

export default function SettingsScreen() {
  const { t } = useLocale();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <View style={styles.heroBlock}>
            <Text style={styles.eyebrow}>Controls</Text>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage language and account actions without crowding your profile.</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="xmark" size={16} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>{t('language')}</Text>
          <Text style={styles.helperText}>Choose the language you want to use throughout the app.</Text>
          <LocaleSwitch />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Account actions</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={async () => {
              await setJSON(STORAGE_KEYS.likes, []);
              await setJSON(STORAGE_KEYS.passes, []);
              await setJSON(STORAGE_KEYS.matches, []);
              await setJSON(STORAGE_KEYS.messages, {});
              await setJSON(STORAGE_KEYS.blocked, []);
            }}>
            <Text style={styles.secondaryButtonText}>{t('resetLikesPasses')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={() => void signOut()}>
            <Text style={styles.signOutButtonText}>{t('signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    top: -70,
    right: -60,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: 'rgba(166, 30, 42, 0.12)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 120,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 164, 65, 0.06)',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 132,
    gap: 12,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroBlock: {
    flex: 1,
    gap: 2,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.25,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: 'rgba(28, 21, 24, 0.92)',
    borderRadius: 22,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionEyebrow: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  helperText: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgba(166, 30, 42, 0.12)',
    borderRadius: 999,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(166, 30, 42, 0.28)',
  },
  signOutButtonText: {
    color: '#F4BCBC',
    fontWeight: '800',
    fontSize: 14,
  },
});
