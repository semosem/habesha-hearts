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
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>
        <Text style={styles.title}>{t('onboardingInterestsTitle')}</Text>
        <View style={styles.chips}>
          {INTERESTS.map((interest) => {
            const active = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() =>
                  setSelected((current) =>
                    current.includes(interest)
                      ? current.filter((item) => item !== interest)
                      : [...current, interest]
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 14 },
  topRow: { position: 'absolute', top: 20, right: 24 },
  title: { color: palette.textPrimary, fontSize: 32, fontWeight: '900', marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    backgroundColor: palette.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  chipText: { color: palette.textPrimary, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  primaryButton: { backgroundColor: palette.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
