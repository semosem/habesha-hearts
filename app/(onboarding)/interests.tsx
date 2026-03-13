import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { getJSON, STORAGE_KEYS } from '@/lib/storage';

const DEFAULT_USER = {
  name: '',
  city: 'Addis Ababa',
  intent: 'Dating',
  photoUrl: '',
};

const INTERESTS = ['Buna', 'Music', 'Travel', 'Faith', 'Food', 'Film', 'Fitness', 'Books'];

export default function OnboardingInterestsScreen() {
  const { t } = useLocale();
  const { completeOnboarding } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>Step 3 of 3</Text>
          <Text style={styles.title}>{t('onboardingInterestsTitle')}</Text>
          <Text style={styles.subtitle}>Pick a few things that feel true to you. These details make your profile feel alive.</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.chips}>
            {INTERESTS.map((interest) => {
              const active = selected.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() =>
                    setSelected((current) =>
                      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
                    )
                  }>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{interest}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              const currentUser = await getJSON(STORAGE_KEYS.currentUser, DEFAULT_USER);
              await completeOnboarding({
                name: currentUser.name,
                city: currentUser.city,
                intent: currentUser.intent,
                photoUrl: currentUser.photoUrl,
                interests: selected,
              });
            }}>
            <Text style={styles.primaryText}>{t('finishSetup')}</Text>
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
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: palette.surfaceLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
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
