import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LocaleSwitch } from '@/components/LocaleSwitch';
import { profiles } from '@/constants/profiles';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';

export default function WelcomeScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const heroPhotos = useMemo(
    () => profiles.map((profile) => profile.photoUrls?.[0]).filter((photo): photo is string => Boolean(photo)),
    []
  );
  const [photoIndex, setPhotoIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (heroPhotos.length < 2) return;

    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.22, duration: 900, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]).start();
      setPhotoIndex((current) => (current + 1) % heroPhotos.length);
    }, 6200);

    return () => clearInterval(timer);
  }, [fade, heroPhotos.length]);

  return (
    <SafeAreaView style={styles.safe}>
      {heroPhotos[photoIndex] ? (
        <Animated.Image source={{ uri: heroPhotos[photoIndex] }} style={[styles.heroImage, { opacity: fade }]} />
      ) : null}
      <View style={styles.scrim} />
      <View style={styles.meshGlowTop} />
      <View style={styles.meshGlowBottom} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocaleSwitch />
        </View>
        <View style={styles.heroColumn}>
          <View style={styles.brandLockup}>
            <Text style={styles.eyebrow}>Habesha Hearts</Text>
            <Text style={styles.title}>{t('welcomeTitle')}</Text>
          </View>
        </View>

        <View style={styles.ctaPanel}>
          <View style={styles.ctaStack}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.primaryText}>{t('createAccount')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.secondaryText}>{t('alreadyHaveAccount')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.legalText}>
            By signing up, you agree to our Terms. See how we use your data in our Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 12, 16, 0.46)',
  },
  meshGlowTop: {
    position: 'absolute',
    top: -52,
    right: -46,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(166, 30, 42, 0.18)',
  },
  meshGlowBottom: {
    position: 'absolute',
    bottom: 112,
    left: -76,
    width: 244,
    height: 244,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 164, 65, 0.10)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 72,
    paddingBottom: 24,
  },
  topRow: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  heroColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 88,
    paddingBottom: 48,
  },
  brandLockup: {
    gap: 8,
    maxWidth: 296,
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 39,
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 3 },
  },
  subtitle: {
    color: 'rgba(248,249,251,0.88)',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 312,
  },
  ctaPanel: {
    gap: 16,
    paddingTop: 8,
  },
  ctaStack: {
    gap: 14,
  },
  button: {
    width: '100%',
    minHeight: 68,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#F6F4EE',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  primaryText: {
    color: '#16130F',
    fontWeight: '600',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.82)',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  legalText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
});
