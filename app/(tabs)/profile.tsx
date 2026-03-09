import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/providers/AuthProvider';
import { getJSON, setJSON, STORAGE_KEYS } from '@/lib/storage';

const DEFAULT_USER = {
  name: 'You',
  city: 'Addis Ababa',
  intent: 'Dating',
  photoUrl: '',
};

export default function ProfileScreen() {
  const { t } = useLocale();
  const { signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [likedCount, setLikedCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);

  const loadState = useCallback(async () => {
    const storedUser = await getJSON<typeof DEFAULT_USER>(STORAGE_KEYS.currentUser, DEFAULT_USER);
    const storedLikes = await getJSON<string[]>(STORAGE_KEYS.likes, []);
    const storedPasses = await getJSON<string[]>(STORAGE_KEYS.passes, []);
    setCurrentUser(storedUser);
    setLikedCount(storedLikes.length);
    setPassedCount(storedPasses.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadState();
      return () => undefined;
    }, [loadState])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('yourProfile')}</Text>
        <TextInput
          placeholder={t('name')}
          placeholderTextColor={palette.textSecondary}
          style={styles.input}
          value={currentUser.name}
          onChangeText={(value) => setCurrentUser((prev) => ({ ...prev, name: value }))}
        />
        <TextInput
          placeholder={t('city')}
          placeholderTextColor={palette.textSecondary}
          style={styles.input}
          value={currentUser.city}
          onChangeText={(value) => setCurrentUser((prev) => ({ ...prev, city: value }))}
        />
        <TextInput
          placeholder={t('intent')}
          placeholderTextColor={palette.textSecondary}
          style={styles.input}
          value={currentUser.intent}
          onChangeText={(value) => setCurrentUser((prev) => ({ ...prev, intent: value }))}
        />
        <TextInput
          placeholder={t('photoUrl')}
          placeholderTextColor={palette.textSecondary}
          style={styles.input}
          value={currentUser.photoUrl}
          onChangeText={(value) => setCurrentUser((prev) => ({ ...prev, photoUrl: value }))}
        />

        <View style={styles.languageRow}>
          <Text style={styles.languageLabel}>{t('language')}</Text>
          <LocaleSwitch />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            await setJSON(STORAGE_KEYS.currentUser, currentUser);
          }}>
          <Text style={styles.primaryButtonText}>{t('saveProfile')}</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <Text style={styles.statChip}>Heart {t('likedLabel', { count: likedCount })}</Text>
          <Text style={styles.statChip}>Skip {t('passedLabel', { count: passedCount })}</Text>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={async () => {
            await setJSON(STORAGE_KEYS.likes, []);
            await setJSON(STORAGE_KEYS.passes, []);
            await setJSON(STORAGE_KEYS.matches, []);
            await setJSON(STORAGE_KEYS.messages, {});
            await setJSON(STORAGE_KEYS.blocked, []);
            setLikedCount(0);
            setPassedCount(0);
          }}>
          <Text style={styles.secondaryButtonText}>{t('resetLikesPasses')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={() => void signOut()}>
          <Text style={styles.signOutButtonText}>{t('signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 18,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 120,
    gap: 12,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '900',
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  languageRow: {
    gap: 10,
    paddingTop: 4,
  },
  languageLabel: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    backgroundColor: palette.surfaceLight,
    color: palette.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  signOutButton: {
    backgroundColor: 'rgba(183, 28, 28, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(183, 28, 28, 0.35)',
  },
  signOutButtonText: {
    color: '#FFB3B3',
    fontWeight: '800',
  },
});
