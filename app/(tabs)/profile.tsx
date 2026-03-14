import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { getJSON, setJSON, STORAGE_KEYS } from '@/lib/storage';

const DEFAULT_USER = {
  name: 'You',
  city: 'Addis Ababa',
  intent: 'Dating',
  photoUrl: '',
};

export default function ProfileScreen() {
  const { t } = useLocale();
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <View style={styles.heroBlock}>
            <Text style={styles.eyebrow}>Your space</Text>
            <Text style={styles.title}>{t('yourProfile')}</Text>
            <Text style={styles.subtitle}>Shape how people first see you.</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <IconSymbol name="gearshape.fill" size={18} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{currentUser.name.trim().slice(0, 1).toUpperCase() || 'Y'}</Text>
          </View>
          <View style={styles.summaryTextBlock}>
            <Text style={styles.summaryName}>{currentUser.name || 'You'}</Text>
            <Text style={styles.summaryMeta}>{[currentUser.city, currentUser.intent].filter(Boolean).join(' · ')}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{likedCount}</Text>
            <Text style={styles.statLabel}>Hearts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{passedCount}</Text>
            <Text style={styles.statLabel}>Passes</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Profile details</Text>
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
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              await setJSON(STORAGE_KEYS.currentUser, currentUser);
            }}>
            <Text style={styles.primaryButtonText}>{t('saveProfile')}</Text>
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
    top: -76,
    right: -64,
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
    paddingTop: 12,
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
  settingsButton: {
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(28, 21, 24, 0.92)',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  summaryTextBlock: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryMeta: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(42, 30, 34, 0.9)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 2,
  },
  statValue: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: 'rgba(28, 21, 24, 0.92)',
    borderRadius: 22,
    padding: 14,
    gap: 8,
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
  input: {
    backgroundColor: palette.surfaceLight,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
