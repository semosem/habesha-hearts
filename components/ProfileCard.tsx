import { memo, useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { Profile } from '@/constants/profiles';

type Props = {
  profile: Profile;
  highPriorityImage?: boolean;
};

const webBackdropImageStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  objectFit: 'cover',
  backgroundColor: '#1A2233',
  width: '100%',
  height: '100%',
} as const;

type ProfileCardStyles = {
  card: ViewStyle;
  avatar: ViewStyle;
  backdropImage: ImageStyle;
  backdropFallback: ViewStyle;
  backdropShade: ViewStyle;
  photoBottomFade: ViewStyle;
  photoIndicators: ViewStyle;
  photoIndicator: ViewStyle;
  photoIndicatorActive: ViewStyle;
  photoNavLayer: ViewStyle;
  photoIdentity: ViewStyle;
  photoNavZone: ViewStyle;
  content: ViewStyle;
  name: TextStyle;
  meta: TextStyle;
  bio: TextStyle;
  avatarText: TextStyle;
  fallbackCaption: TextStyle;
};

function ProfileCardComponent({ profile, highPriorityImage = false }: Props) {
  const photos = profile.photoUrls?.length ? profile.photoUrls : [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = photos[photoIndex];
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    setPhotoIndex(0);
  }, [profile.id]);

  const canCyclePhotos = photos.length > 1;

  const showPreviousPhoto = () => {
    if (!canCyclePhotos) return;
    setImageError(false);
    setPhotoIndex((current) => (current === 0 ? photos.length - 1 : current - 1));
  };

  const showNextPhoto = () => {
    if (!canCyclePhotos) return;
    setImageError(false);
    setPhotoIndex((current) => (current === photos.length - 1 ? 0 : current + 1));
  };

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
            style={webBackdropImageStyle}
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            source={{ uri: photo }}
            style={styles.backdropImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )
      ) : (
        <View style={styles.backdropFallback}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name.slice(0, 1)}</Text>
          </View>
          <Text style={styles.fallbackCaption}>Photo coming soon</Text>
        </View>
      )}
      <View style={styles.backdropShade} />
      <View style={styles.photoBottomFade} />
      {canCyclePhotos ? (
        <View pointerEvents="none" style={styles.photoIndicators}>
          {photos.map((item, idx) => (
            <View
              key={`${profile.id}-${item}-${idx}`}
              style={[styles.photoIndicator, idx === photoIndex && styles.photoIndicatorActive]}
            />
          ))}
        </View>
      ) : null}
      {canCyclePhotos ? (
        <View style={styles.photoNavLayer}>
          <Pressable style={styles.photoNavZone} onPress={showPreviousPhoto} />
          <Pressable style={styles.photoNavZone} onPress={showNextPhoto} />
        </View>
      ) : null}
      <View style={styles.photoIdentity}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.name}, {profile.age}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {profile.city}
          {profile.distanceKm ? ` • ${profile.distanceKm} km` : ''}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.bio} numberOfLines={1} ellipsizeMode="tail">
          {profile.bio}
        </Text>
      </View>
    </View>
  );
}

export const ProfileCard = memo(ProfileCardComponent);

const styles = StyleSheet.create<ProfileCardStyles>({
  card: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'flex-end'
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
  backdropImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#1A2233',
  },
  backdropFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#24304a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  backdropShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 18, 0.16)',
  },
  photoBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '78%',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  photoIndicators: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 3,
    flexDirection: 'row',
    gap: 6,
  },
  photoIndicator: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  photoIndicatorActive: {
    backgroundColor: '#F0A500',
  },
  photoNavLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '78%',
    zIndex: 2,
    flexDirection: 'row',
  },
  photoIdentity: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 78,
    zIndex: 3,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  photoNavZone: {
    flex: 1,
  },
  content: {
    width: '100%',
    marginTop: '78%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    minHeight: 60,
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 16, 29, 0.96)',
  },
  name: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.72)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 3 },
  },
  meta: {
    color: '#F2F4F8',
    fontSize: 13,
    opacity: 0.94,
    fontWeight: '700',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.58)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
  bio: {
    color: '#E4E9F2',
    fontSize: 14,
    lineHeight: 18,
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
  }
});
