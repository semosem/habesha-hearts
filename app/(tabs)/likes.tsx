import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { profiles as seedProfiles, type Profile } from '@/constants/profiles';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { toThumbnailUrl, toWebOptimizedUrl } from '@/lib/profileImages';
import { getJSON, STORAGE_KEYS } from '@/lib/storage';

export default function LikesScreen() {
  const { t } = useLocale();
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const storedProfiles = await getJSON<Profile[]>(STORAGE_KEYS.profiles, seedProfiles);
        const storedLikes = await getJSON<string[]>(STORAGE_KEYS.likes, []);
        const profiles = storedProfiles.length ? storedProfiles : seedProfiles;
        setLikedProfiles(profiles.filter((profile) => storedLikes.includes(profile.id)));
      })();
      return () => undefined;
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('likesTitle')}</Text>
        {!likedProfiles.length ? <Text style={styles.empty}>{t('likesEmpty')}</Text> : null}
        {likedProfiles.map((profile) => (
          <View key={profile.id} style={styles.row}>
            <Image
              source={{ uri: toWebOptimizedUrl(toThumbnailUrl(profile.photoUrls?.[0] || '')) }}
              style={styles.photo}
            />
            <View style={styles.copy}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.meta}>
                {profile.age} • {profile.city}
              </Text>
              <Text style={styles.bio} numberOfLines={2}>
                {profile.bio}
              </Text>
            </View>
          </View>
        ))}
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
  empty: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  photo: {
    width: 90,
    height: 110,
    borderRadius: 16,
    backgroundColor: palette.surfaceLight,
  },
  copy: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  name: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  bio: {
    color: '#E4E9F2',
    fontSize: 15,
    lineHeight: 21,
  },
});
