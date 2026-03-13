import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { getJSON, setJSON, STORAGE_KEYS } from '@/lib/storage';

const DEFAULT_USER = {
  name: '',
  city: 'Addis Ababa',
  intent: 'Dating',
  photoUrl: '',
};

export default function OnboardingBasicsScreen() {
  const { t } = useLocale();
  const [user, setUser] = useState(DEFAULT_USER);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>Step 1 of 3</Text>
          <Text style={styles.title}>{t('onboardingBasicsTitle')}</Text>
          <Text style={styles.subtitle}>Tell people the essentials first — who you are, where you are, and what you’re here for.</Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            value={user.name}
            onChangeText={(value) => setUser((prev) => ({ ...prev, name: value }))}
            style={styles.input}
            placeholder={t('name')}
            placeholderTextColor={palette.textSecondary}
          />
          <TextInput
            value={user.city}
            onChangeText={(value) => setUser((prev) => ({ ...prev, city: value }))}
            style={styles.input}
            placeholder={t('city')}
            placeholderTextColor={palette.textSecondary}
          />
          <TextInput
            value={user.intent}
            onChangeText={(value) => setUser((prev) => ({ ...prev, intent: value }))}
            style={styles.input}
            placeholder={t('intent')}
            placeholderTextColor={palette.textSecondary}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              const currentUser = await getJSON(STORAGE_KEYS.currentUser, DEFAULT_USER);
              await setJSON(STORAGE_KEYS.currentUser, { ...currentUser, ...user });
              router.push('/(onboarding)/photos');
            }}>
            <Text style={styles.primaryText}>{t('continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
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
    maxWidth: 308,
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
    maxWidth: 296,
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
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
});
