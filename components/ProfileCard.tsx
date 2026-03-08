import { memo, useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View, Text } from 'react-native';

import type { Profile } from '@/constants/profiles';

type Props = {
  profile: Profile;
  highPriorityImage?: boolean;
};

function ProfileCardComponent({ profile, highPriorityImage = false }: Props) {
  const photo = profile.photoUrls?.[0];
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photo]);

  return (
    <View style={[styles.card, { backgroundColor: '#121826' }]}>
      {photo && !imageError ? (
        Platform.OS === 'web' ? (
          <img
            src={photo}
            alt={`${profile.name} profile photo`}
            width={320}
            height={220}
            loading={highPriorityImage ? 'eager' : 'lazy'}
            fetchPriority={highPriorityImage ? 'high' : 'auto'}
            style={styles.webHeroImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            source={{ uri: photo }}
            style={styles.heroImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )
      ) : (
        <View style={styles.heroFallback}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name.slice(0, 1)}</Text>
          </View>
          <Text style={styles.fallbackCaption}>Photo coming soon</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
          {profile.age} • {profile.city}
          {profile.distanceKm ? ` • ${profile.distanceKm} km` : ''}
          </Text>
        </View>
        <Text style={styles.bio} numberOfLines={3}>
          {profile.bio}
        </Text>
        <View style={styles.tagRow}>
          {profile.interests.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export const ProfileCard = memo(ProfileCardComponent);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 500,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(240,165,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#1A2233'
  },
  webHeroImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
    objectFit: 'cover',
    backgroundColor: '#1A2233',
    display: 'block'
  } as const,
  heroFallback: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#24304a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  content: {
    flex: 1,
    justifyContent: 'space-between'
  },
  avatarText: {
    color: '#F8F9FB',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1
  },
  fallbackCaption: {
    color: '#DCE5F5',
    fontSize: 13,
    fontWeight: '600'
  },
  headerRow: {
    gap: 4
  },
  name: {
    fontSize: 24,
    color: '#F8F9FB',
    fontWeight: '800'
  },
  meta: {
    color: '#C7CFDB',
    fontSize: 14,
    opacity: 0.8,
    fontWeight: '600'
  },
  bio: {
    color: '#E4E9F2',
    fontSize: 16,
    lineHeight: 22,
    minHeight: 66,
    marginTop: 6
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    marginTop: 6,
    minHeight: 36
  },
  tag: {
    backgroundColor: 'rgba(199,161,122,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    color: '#F8F9FB',
    fontWeight: '700',
    fontSize: 12
  }
});
