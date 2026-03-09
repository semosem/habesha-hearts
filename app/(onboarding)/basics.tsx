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
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>
        <Text style={styles.title}>{t('onboardingBasicsTitle')}</Text>
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
  primaryButton: { backgroundColor: palette.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
