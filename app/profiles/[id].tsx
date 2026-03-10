import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { profiles as seedProfiles, type Profile } from '@/constants/profiles';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { getJSON, STORAGE_KEYS } from '@/lib/storage';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLocale();
  const [profiles, setProfiles] = useState<Profile[]>(seedProfiles);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    let active = true;

    void getJSON<Profile[]>(STORAGE_KEYS.profiles, seedProfiles).then((storedProfiles) => {
      if (!active) return;
      setProfiles(storedProfiles.length ? storedProfiles : seedProfiles);
    });

    return () => {
      active = false;
    };
  }, []);

  const profile = useMemo(
    () => profiles.find((item) => item.id === id) ?? seedProfiles.find((item) => item.id === id),
    [id, profiles]
  );

  useEffect(() => {
    setPhotoIndex(0);
  }, [id]);

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missingState}>
          <Text style={styles.missingTitle}>Profile not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('backToSwipe')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const photos = profile.photoUrls?.length ? profile.photoUrls : [];
  const activePhoto = photos[photoIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.navChip} onPress={() => router.back()}>
            <Text style={styles.navChipText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('viewProfile')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          {activePhoto ? <Image source={{ uri: activePhoto }} style={styles.heroImage} resizeMode="cover" /> : null}
          <View style={styles.heroShade} />
          <View style={styles.heroText}>
            <Text style={styles.name}>
              {profile.name}, {profile.age}
            </Text>
            <Text style={styles.meta}>
              {profile.city}
              {profile.distanceKm ? ` • ${profile.distanceKm} km` : ''}
            </Text>
          </View>
        </View>

        {photos.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRail}>
            {photos.map((photo, idx) => (
              <Pressable
                key={`${profile.id}-${photo}-${idx}`}
                onPress={() => setPhotoIndex(idx)}
                style={[styles.thumbFrame, idx === photoIndex && styles.thumbFrameActive]}>
                <Image source={{ uri: photo }} style={styles.thumbImage} resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aboutMe')}</Text>
          <Text style={styles.body}>{profile.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('interestsTitle')}</Text>
          <View style={styles.chips}>
            {profile.interests.map((interest) => (
              <View key={`${profile.id}-${interest}`} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('intentTitle')}</Text>
          <Text style={styles.body}>{profile.intent ?? 'Dating'}</Text>
        </View>

        <Pressable style={styles.fullWidthBack} onPress={() => router.back()}>
          <Text style={styles.fullWidthBackText}>{t('backToSwipe')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navChip: {
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  navChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerTitle: {
    color: '#FFF5E8',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 64,
  },
  heroCard: {
    height: 440,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: palette.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 15, 0.18)',
  },
  heroText: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 3 },
  },
  meta: {
    marginTop: 6,
    color: '#F1F4FA',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
  photoRail: {
    gap: 10,
  },
  thumbFrame: {
    width: 84,
    height: 108,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: palette.surfaceLight,
  },
  thumbFrameActive: {
    borderColor: palette.accent,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    color: '#F6EBDD',
    fontSize: 16,
    fontWeight: '800',
  },
  body: {
    color: '#E8EDF5',
    fontSize: 16,
    lineHeight: 24,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(240,165,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(240,165,0,0.28)',
  },
  chipText: {
    color: '#FFE7BF',
    fontWeight: '700',
  },
  fullWidthBack: {
    marginTop: 6,
    minHeight: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  fullWidthBackText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  missingTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  backButton: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
