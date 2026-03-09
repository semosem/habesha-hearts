import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ProfileCard } from '@/components/ProfileCard';
import { profiles as seedProfiles, type Profile } from '@/constants/profiles';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { getJSON, Match, Message, MessageMap, setJSON, STORAGE_KEYS } from '@/lib/storage';

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 180;
const DEFAULT_USER = {
  name: 'You',
  city: 'Addis Ababa',
  intent: 'Dating',
  photoUrl: '',
};

export default function SwipeScreen() {
  const { t } = useLocale();
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>(seedProfiles);
  const [liked, setLiked] = useState<Profile[]>([]);
  const [passed, setPassed] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messageMap, setMessageMap] = useState<MessageMap>({});
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const pan = useRef(new Animated.ValueXY()).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const loadState = useCallback(async () => {
    setLoading(true);
    const storedProfiles = await getJSON<Profile[]>(STORAGE_KEYS.profiles, seedProfiles);
    const storedLikes = await getJSON<string[]>(STORAGE_KEYS.likes, []);
    const storedPasses = await getJSON<string[]>(STORAGE_KEYS.passes, []);
    const storedMatches = await getJSON<Match[]>(STORAGE_KEYS.matches, []);
    const storedMessages = await getJSON<MessageMap>(STORAGE_KEYS.messages, {});
    const storedBlocked = await getJSON<string[]>(STORAGE_KEYS.blocked, []);
    const storedUser = await getJSON<typeof DEFAULT_USER>(STORAGE_KEYS.currentUser, DEFAULT_USER);

    const normalizedProfiles = (storedProfiles.length ? storedProfiles : seedProfiles).map((profile) => {
      const fallback = seedProfiles.find((item) => item.id === profile.id);
      return {
        ...fallback,
        ...profile,
        photoUrls: profile.photoUrls?.length ? profile.photoUrls : fallback?.photoUrls || [],
      } as Profile;
    });

    setLiked(normalizedProfiles.filter((profile) => storedLikes.includes(profile.id)));
    setPassed(normalizedProfiles.filter((profile) => storedPasses.includes(profile.id)));
    setMatches(storedMatches);
    setMessageMap(storedMessages);
    setCurrentUser(storedUser);
    setAvailableProfiles(
      normalizedProfiles.filter(
        (profile) => !storedPasses.includes(profile.id) && !storedBlocked.includes(profile.id)
      )
    );
    setIndex(0);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadState();
      return () => undefined;
    }, [loadState])
  );

  const pingToast = useCallback((text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(text);
    toastTimerRef.current = setTimeout(() => setToast(null), 1200);
  }, []);

  const maybeCreateMatch = useCallback(
    (profile: Profile, nextMatches: Match[], nextMessageMap: MessageMap) => {
      if (nextMatches.some((match) => match.profileId === profile.id)) {
        return { matches: nextMatches, messageMap: nextMessageMap };
      }

      const match: Match = {
        id: `match-${profile.id}`,
        profileId: profile.id,
        createdAt: new Date().toISOString(),
      };
      const intro: Message = {
        matchId: match.id,
        from: 'them',
        text: t('introMessage', { name: currentUser.name }),
        createdAt: new Date().toISOString(),
      };

      return {
        matches: [...nextMatches, match],
        messageMap: { ...nextMessageMap, [match.id]: [intro] },
      };
    },
    [currentUser.name, t]
  );

  const onSwipeComplete = useCallback(
    async (direction: 'left' | 'right') => {
      if (!availableProfiles.length) return;

      const profile = availableProfiles[index % availableProfiles.length];
      let nextLiked = liked;
      let nextPassed = passed;
      let nextMatches = matches;
      let nextMessageMap = messageMap;

      if (direction === 'right' && !liked.some((item) => item.id === profile.id)) {
        nextLiked = [...liked, profile];
        const matchResult = maybeCreateMatch(profile, matches, messageMap);
        nextMatches = matchResult.matches;
        nextMessageMap = matchResult.messageMap;
        setLiked(nextLiked);
        setMatches(nextMatches);
        setMessageMap(nextMessageMap);
        await setJSON(STORAGE_KEYS.likes, nextLiked.map((item) => item.id));
        await setJSON(STORAGE_KEYS.matches, nextMatches);
        await setJSON(STORAGE_KEYS.messages, nextMessageMap);
        pingToast(t('toastLiked', { name: profile.name }));
      }

      if (direction === 'left' && !passed.some((item) => item.id === profile.id)) {
        nextPassed = [...passed, profile];
        setPassed(nextPassed);
        await setJSON(STORAGE_KEYS.passes, nextPassed.map((item) => item.id));
      }

      const nextAvailable = availableProfiles.filter((item) => item.id !== profile.id);
      setAvailableProfiles(nextAvailable);
      pan.setValue({ x: 0, y: 0 });
      setIndex(0);
    },
    [availableProfiles, index, liked, matches, maybeCreateMatch, messageMap, pan, passed, pingToast, t]
  );

  const forceSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const x = direction === 'right' ? 500 : -500;
      Animated.timing(pan, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }).start(() => {
        void onSwipeComplete(direction);
      });
    },
    [onSwipeComplete, pan]
  );

  const resetPosition = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
          return;
        }
        if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
          return;
        }
        resetPosition();
      },
    })
  ).current;

  const renderCard = () => {
    if (loading) {
      return <View style={[styles.cardContainer, styles.loadingCard]} />;
    }

    if (!availableProfiles.length) {
      return (
        <View style={[styles.cardContainer, styles.emptyCard]}>
          <Text style={styles.emptyTitle}>{t('caughtUpTitle')}</Text>
          <Text style={styles.emptyHint}>{t('caughtUpHint')}</Text>
        </View>
      );
    }

    const profile = availableProfiles[index];
    return (
      <Animated.View
        style={[styles.cardContainer, { transform: [...pan.getTranslateTransform(), { rotate }] }]}
        {...panResponder.panHandlers}>
        <ProfileCard profile={profile} highPriorityImage />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.deck}>
        <View style={styles.cardStage}>{renderCard()}</View>
      </View>
      <View style={styles.actionDock}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.glassAction,
              styles.skipGlass,
              !availableProfiles.length && styles.glassActionDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!availableProfiles.length}
            onPress={() => forceSwipe('left')}>
            <View style={styles.glassTopShine} />
            <Text style={[styles.glassIcon, styles.skipIcon]}>X</Text>
            <Text style={styles.glassLabel}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.glassAction,
              styles.likeGlass,
              !availableProfiles.length && styles.glassActionDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!availableProfiles.length}
            onPress={() => forceSwipe('right')}>
            <View style={styles.glassTopShine} />
            <Text style={[styles.glassIcon, styles.likeIcon]}>♥</Text>
            <Text style={styles.glassLabel}>Like</Text>
          </TouchableOpacity>
        </View>
      </View>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 18,
    paddingTop: 0,
  },
  deck: {
    flex: 1,
    paddingTop: 4,
  },
  cardStage: {
    flex: 1,
    minHeight: 560,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  loadingCard: {
    backgroundColor: '#0F1626',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    color: '#FFF2DF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyHint: {
    color: '#E7EDF8',
    fontSize: 16,
    textAlign: 'center',
  },
  actionDock: {
    marginTop: -1,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: palette.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderTopColor: 'rgba(255,255,255,0.04)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  glassAction: {
    flex: 1,
    height: 72,
    borderRadius: 12,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glassActionDisabled: {
    opacity: 0.45,
  },
  glassTopShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  skipGlass: {
    backgroundColor: 'rgba(12, 18, 28, 0.9)',
    borderColor: 'rgba(255, 102, 117, 0.72)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  likeGlass: {
    backgroundColor: 'rgba(12, 18, 28, 0.9)',
    borderColor: 'rgba(97, 255, 173, 0.72)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  glassIcon: {
    fontSize: 30,
    fontWeight: '900',
  },
  skipIcon: {
    color: '#FF4150',
  },
  likeIcon: {
    color: '#70FFBD',
  },
  glassLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    color: '#F4F7FF',
  },
  toast: {
    position: 'absolute',
    bottom: 96,
    left: 24,
    right: 24,
    backgroundColor: palette.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
