import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ProfileCard } from '@/components/ProfileCard';
import { profiles as seedProfiles, type Profile } from '@/constants/profiles';
import { useLocale } from '@/lib/i18n';
import { getJSON, Match, Message, MessageMap, setJSON, STORAGE_KEYS } from '@/lib/storage';

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 180;
const CARD_STAGE_HEIGHT = 520;
const DEFAULT_USER = {
  name: 'You',
  city: 'Addis Ababa',
  intent: 'Dating',
  photoUrl: ''
};

function toThumbnailUrl(url: string) {
  if (!url.includes('/randomuser.me/api/portraits/')) return url;
  if (url.includes('/api/portraits/thumb/')) return url;
  return url.replace('/api/portraits/', '/api/portraits/thumb/');
}

function toWebOptimizedUrl(url: string) {
  if (Platform.OS !== 'web') return url;
  try {
    const parsed = new URL(url);
    const source = `${parsed.host}${parsed.pathname}${parsed.search}`;
    return `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=96&h=96&fit=cover&output=webp&q=70`;
  } catch {
    return url;
  }
}

const palette = {
  primary: '#B71C1C', // buna roast red
  primaryDark: '#7F0000',
  accent: '#F0A500', // honey/amber
  background: '#0D111A', // near-black lounge
  surface: '#121826', // card surface
  surfaceLight: '#1A2233',
  textPrimary: '#F8F9FB',
  textSecondary: '#C7CFDB',
  chip: '#C7A17A' // warm tan for interest chips
};

export default function SwipeScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { locale, setLocale, t } = useLocale();
  const [index, setIndex] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>(seedProfiles);
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>(seedProfiles);
  const [liked, setLiked] = useState<Profile[]>([]);
  const [passed, setPassed] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'find' | 'messages' | 'profile'>('find');
  const [toast, setToast] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messageMap, setMessageMap] = useState<MessageMap>({});
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; city: string; intent: string; photoUrl: string }>(DEFAULT_USER);
  const [thumbImageError, setThumbImageError] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const pan = useRef(new Animated.ValueXY()).current;

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-12deg', '0deg', '12deg']
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  useEffect(() => {
    const load = async () => {
      const storedProfiles = await getJSON<Profile[]>(STORAGE_KEYS.profiles, seedProfiles);
      const storedLikes = await getJSON<string[]>(STORAGE_KEYS.likes, []);
      const storedPasses = await getJSON<string[]>(STORAGE_KEYS.passes, []);
      const storedMatches = await getJSON<Match[]>(STORAGE_KEYS.matches, []);
      const storedMessages = await getJSON<MessageMap>(STORAGE_KEYS.messages, {});
      const storedBlocked = await getJSON<string[]>(STORAGE_KEYS.blocked, []);
      const storedUser = await getJSON<typeof DEFAULT_USER>(STORAGE_KEYS.currentUser, DEFAULT_USER);
      const baseProfiles = storedProfiles.length ? storedProfiles : seedProfiles;
      const normalizedProfiles = baseProfiles.map((profile) => {
        const seed = seedProfiles.find((p) => p.id === profile.id);
        return {
          ...seed,
          ...profile,
          photoUrls: profile.photoUrls?.length ? profile.photoUrls : seed?.photoUrls || []
        } as Profile;
      });
      if (!storedProfiles.length || JSON.stringify(baseProfiles) !== JSON.stringify(normalizedProfiles)) {
        await setJSON(STORAGE_KEYS.profiles, normalizedProfiles);
      }
      setProfiles(normalizedProfiles);
      setAvailableProfiles(
        normalizedProfiles.filter(
          (p) => !storedPasses.includes(p.id) && !storedBlocked.includes(p.id)
        )
      );
      setLiked(normalizedProfiles.filter((p) => storedLikes.includes(p.id)));
      setPassed(normalizedProfiles.filter((p) => storedPasses.includes(p.id)));
      setMatches(storedMatches);
      setMessageMap(storedMessages);
      setBlockedIds(storedBlocked);
      setCurrentUser(storedUser);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    setAvailableProfiles(
      profiles.filter(
        (p) =>
          !passed.some((x) => x.id === p.id) &&
          !blockedIds.includes(p.id)
      )
    );
  }, [profiles, passed, blockedIds]);

  useEffect(() => {
    if (selectedMatchId && !matches.some((m) => m.id === selectedMatchId)) {
      setSelectedMatchId(null);
    }
  }, [matches, selectedMatchId]);

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? 500 : -500;
    Animated.timing(pan, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    if (!availableProfiles.length) return;
    const profile = availableProfiles[index % availableProfiles.length];
    if (direction === 'right') {
      if (!liked.some((x) => x.id === profile.id)) {
        const nextLiked = [...liked, profile];
        setLiked(nextLiked);
        setJSON(STORAGE_KEYS.likes, nextLiked.map((p) => p.id));
        maybeCreateMatch(profile);
        pingToast(t('toastLiked', { name: profile.name }));
      }
    } else {
      if (!passed.some((x) => x.id === profile.id)) {
        const nextPassed = [...passed, profile];
        setPassed(nextPassed);
        setJSON(STORAGE_KEYS.passes, nextPassed.map((p) => p.id));
      }
    }
    pan.setValue({ x: 0, y: 0 });
    setIndex((prev) => prev + 1);
  };

  const maybeCreateMatch = (profile: Profile) => {
    const already = matches.find((m) => m.profileId === profile.id);
    if (already) return;
    const match: Match = {
      id: `match-${profile.id}`,
      profileId: profile.id,
      createdAt: new Date().toISOString()
    };
    const nextMatches = [...matches, match];
    setMatches(nextMatches);
    setJSON(STORAGE_KEYS.matches, nextMatches);
    const intro: Message = {
      matchId: match.id,
      from: 'them',
      text: t('introMessage', { name: currentUser.name }),
      createdAt: new Date().toISOString()
    };
    const nextMessages = { ...messageMap, [match.id]: [intro] };
    setMessageMap(nextMessages);
    setJSON(STORAGE_KEYS.messages, nextMessages);
  };

  const blockProfile = (profile: Profile) => {
    const dedupBlocked = Array.from(new Set([...blockedIds, profile.id]));
    const nextLiked = liked.filter((p) => p.id !== profile.id);
    const nextPassed = passed.filter((p) => p.id !== profile.id);
    const removedMatchIds = matches.filter((m) => m.profileId === profile.id).map((m) => m.id);
    const nextMatches = matches.filter((m) => m.profileId !== profile.id);
    const nextMessageMap: MessageMap = { ...messageMap };
    removedMatchIds.forEach((id) => {
      delete nextMessageMap[id];
    });

    setBlockedIds(dedupBlocked);
    setLiked(nextLiked);
    setPassed(nextPassed);
    setMatches(nextMatches);
    setMessageMap(nextMessageMap);
    setJSON(STORAGE_KEYS.blocked, dedupBlocked);
    setJSON(STORAGE_KEYS.likes, nextLiked.map((p) => p.id));
    setJSON(STORAGE_KEYS.passes, nextPassed.map((p) => p.id));
    setJSON(STORAGE_KEYS.matches, nextMatches);
    setJSON(STORAGE_KEYS.messages, nextMessageMap);
    pingToast(t('toastBlocked', { name: profile.name }));
  };

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: true
    }).start();
  };

  const pingToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 1200);
  };

  const messages = useMemo(
    () =>
      matches
        .map((m) => {
          const profile = profiles.find((p) => p.id === m.profileId);
          const thread = messageMap[m.id] || [];
          const last = thread[thread.length - 1];
          return profile
            ? {
                matchId: m.id,
                from: profile.name,
                preview: last?.text || t('sayHi'),
                time: new Date(last?.createdAt || m.createdAt).toLocaleDateString()
              }
            : null;
        })
        .filter(Boolean) as { matchId: string; from: string; preview: string; time: string }[],
    [matches, profiles, messageMap, t]
  );

  const renderTopCard = () => {
    if (loading) return <View style={[styles.cardContainer, styles.loadingCard]} />;
    if (!availableProfiles.length) {
      return (
        <View style={[styles.cardContainer, styles.emptyCard]}>
          <Text style={styles.emptyTitle}>{t('caughtUpTitle')}</Text>
          <Text style={styles.emptyHint}>{t('caughtUpHint')}</Text>
        </View>
      );
    }
    const profile = availableProfiles[index % availableProfiles.length];
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          { transform: [...pan.getTranslateTransform(), { rotate }] }
        ]}
        {...panResponder.panHandlers}>
        <View style={styles.cardStripe} />
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => blockProfile(profile)}>
          <Text style={styles.moreBtnText}>...</Text>
        </TouchableOpacity>
        <ProfileCard profile={profile} highPriorityImage />
        <View style={styles.badgeRow}>
          <Animated.Text
            style={[
              styles.badge,
              styles.like,
              {
                opacity: pan.x.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, 1],
                  extrapolate: 'clamp'
                })
              }
            ]}>
            {t('likeBadge')}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.badge,
              styles.nope,
              {
                opacity: pan.x.interpolate({
                  inputRange: [-80, 0],
                  outputRange: [1, 0],
                  extrapolate: 'clamp'
                })
              }
            ]}>
            {t('nopeBadge')}
          </Animated.Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundPattern} />
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBrand}>
            <Text style={styles.logoIcon}>❤️</Text>
            <Text style={styles.logoText}>{t('appName')}</Text>
          </View>
          <TouchableOpacity
            style={styles.localeBtn}
            onPress={() => setLocale(locale === 'en' ? 'am' : 'en')}>
            <Text style={styles.localeBtnText}>{t('switchLanguage')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.navRow}>
          {(['find', 'messages', 'profile'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.navBtn, activeTab === tab && styles.navBtnActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.navText, activeTab === tab && styles.navTextActive]}>
                {tab === 'find' ? t('findLove') : tab === 'messages' ? t('messages') : t('profile')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {activeTab === 'find' && (
        <View style={[styles.findContent, { paddingBottom: tabBarHeight + 8 }]}>
          <View style={styles.deck}>
            <View style={styles.cardStage}>{renderTopCard()}</View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>❤️ {t('likedLabel', { count: liked.length })}</Text>
              <Text style={styles.metaText}>✖︎ {t('passedLabel', { count: passed.length })}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.circle, styles.skipBtn]} onPress={() => forceSwipe('left')}>
              <Text style={styles.btnIcon}>✖</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.circle, styles.likeBtn]}
              onPress={() => forceSwipe('right')}>
              <Text style={styles.btnIcon}>♥</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.matches}>
            <Text style={styles.matchesTitle}>{t('newMatches')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchesRow}>
              {profiles.slice(0, 8).map((p, idx) => (
                <View key={p.id} style={styles.matchThumb}>
                  {p.photoUrls?.[0] && !thumbImageError[p.id] ? (
                    <Image
                      source={{ uri: toWebOptimizedUrl(toThumbnailUrl(p.photoUrls[0])) }}
                      style={[styles.matchPhoto, idx % 2 === 0 && styles.newMatch]}
                      onError={() =>
                        setThumbImageError((prev) =>
                          prev[p.id] ? prev : { ...prev, [p.id]: true }
                        )
                      }
                    />
                  ) : (
                    <View style={[styles.matchPhoto, styles.matchPhotoFallback, idx % 2 === 0 && styles.newMatch]}>
                      <Text style={styles.matchInitial}>{p.name.slice(0, 1)}</Text>
                    </View>
                  )}
                  <Text style={styles.matchName}>{p.name.split(' ')[0]}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {activeTab === 'messages' && (
        <View style={styles.panel}>
          {!selectedMatchId ? (
            <>
              <Text style={styles.panelTitle}>{t('messages')}</Text>
              {!messages.length && <Text style={styles.messagePreview}>{t('noMatchesYet')}</Text>}
              {messages.map((m) => (
                <TouchableOpacity key={m.matchId} style={styles.messageRow} onPress={() => setSelectedMatchId(m.matchId)}>
                  <View style={styles.messageDot} />
                  <View style={styles.messageText}>
                    <Text style={styles.messageFrom}>{m.from}</Text>
                    <Text style={styles.messagePreview} numberOfLines={1}>
                      {m.preview}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>{m.time}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <View style={styles.chatHeader}>
                <TouchableOpacity onPress={() => setSelectedMatchId(null)}>
                  <Text style={styles.backText}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={styles.panelTitle}>
                  {profiles.find((p) => p.id === matches.find((x) => x.id === selectedMatchId)?.profileId)?.name || t('chat')}
                </Text>
                <View style={{ width: 34 }} />
              </View>
              <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
                {(messageMap[selectedMatchId] || []).map((msg, idx) => (
                  <View key={`${msg.createdAt}-${idx}`} style={[styles.bubble, msg.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={styles.bubbleText}>{msg.text}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.chatComposer}>
                <TextInput
                  placeholder={t('writeMessage')}
                  placeholderTextColor={palette.textSecondary}
                  value={draftMessage}
                  onChangeText={setDraftMessage}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => {
                    if (!draftMessage.trim() || !selectedMatchId) return;
                    const next: Message = {
                      matchId: selectedMatchId,
                      from: 'me',
                      text: draftMessage.trim(),
                      createdAt: new Date().toISOString()
                    };
                    const thread = messageMap[selectedMatchId] || [];
                    const nextMap = { ...messageMap, [selectedMatchId]: [...thread, next] };
                    setMessageMap(nextMap);
                    setJSON(STORAGE_KEYS.messages, nextMap);
                    setDraftMessage('');
                  }}>
                  <Text style={styles.saveText}>{t('send')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {activeTab === 'profile' && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('yourProfile')}</Text>
          <TextInput
            placeholder={t('name')}
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={currentUser.name}
            onChangeText={(t) => setCurrentUser((prev) => ({ ...prev, name: t }))}
          />
          <TextInput
            placeholder={t('city')}
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={currentUser.city}
            onChangeText={(t) => setCurrentUser((prev) => ({ ...prev, city: t }))}
          />
          <TextInput
            placeholder={t('intent')}
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={currentUser.intent}
            onChangeText={(t) => setCurrentUser((prev) => ({ ...prev, intent: t }))}
          />
          <TextInput
            placeholder={t('photoUrl')}
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={currentUser.photoUrl}
            onChangeText={(t) => setCurrentUser((prev) => ({ ...prev, photoUrl: t }))}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={async () => setJSON(STORAGE_KEYS.currentUser, currentUser)}>
            <Text style={styles.saveText}>{t('saveProfile')}</Text>
          </TouchableOpacity>
          <View style={[styles.statsRow, { marginTop: 12 }]}>
            <Text style={styles.statsChip}>❤️ {t('likedLabel', { count: liked.length })}</Text>
            <Text style={styles.statsChip}>✖︎ {t('passedLabel', { count: passed.length })}</Text>
          </View>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setLiked([]);
              setPassed([]);
              setMatches([]);
              setBlockedIds([]);
              setMessageMap({});
              setSelectedMatchId(null);
              setDraftMessage('');
              setJSON(STORAGE_KEYS.likes, []);
              setJSON(STORAGE_KEYS.passes, []);
              setJSON(STORAGE_KEYS.matches, []);
              setJSON(STORAGE_KEYS.messages, {});
              setJSON(STORAGE_KEYS.blocked, []);
            }}>
            <Text style={styles.resetText}>{t('resetLikesPasses')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 18
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: palette.primary
  },
  header: {
    backgroundColor: palette.primary,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    position: 'relative'
  },
  headerDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: palette.primaryDark
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  logoBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoIcon: {
    fontSize: 20,
    color: '#fff'
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  localeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  localeBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8
  },
  navBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  navBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  navText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    fontSize: 13
  },
  navTextActive: {
    color: '#fff'
  },
  deck: {
    flexShrink: 0,
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingBottom: 8
  },
  findContent: {
    flex: 1
  },
  cardStage: {
    height: CARD_STAGE_HEIGHT
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)'
  },
  loadingCard: {
    backgroundColor: '#0F1626'
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10
  },
  emptyTitle: {
    color: '#FFF2DF',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40
  },
  emptyHint: {
    color: '#E7EDF8',
    fontSize: 16,
    textAlign: 'center'
  },
  moreBtn: {
    position: 'absolute',
    right: 12,
    top: 14,
    zIndex: 10,
    backgroundColor: 'rgba(11,15,25,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    width: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  moreBtnText: {
    color: '#F8F9FB',
    fontSize: 16,
    fontWeight: '700'
  },
  cardStripe: {
    height: 5,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: palette.accent
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  badge: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
    padding: 8,
    borderRadius: 12,
    color: '#0f172a'
  },
  like: {
    backgroundColor: 'rgba(52, 211, 153, 0.9)'
  },
  nope: {
    backgroundColor: 'rgba(255, 145, 129, 0.9)'
  },
  metaRow: {
    marginTop: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metaText: {
    color: '#FFF2DF',
    fontSize: 14,
    fontWeight: '600'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 34,
    backgroundColor: '#121A2A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: palette.surfaceLight,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  skipBtn: {
    backgroundColor: 'rgba(255, 145, 129, 0.12)',
    borderColor: 'rgba(255, 145, 129, 0.3)'
  },
  likeBtn: {
    backgroundColor: palette.primary,
    borderColor: palette.primaryDark,
    shadowColor: palette.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14
  },
  btnIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff'
  },
  panel: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 14,
    marginTop: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 }
  },
  panelTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  backText: {
    color: palette.accent,
    fontWeight: '700'
  },
  chatScroll: {
    flex: 1
  },
  chatContent: {
    gap: 8,
    paddingBottom: 10
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: palette.primary
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceLight
  },
  bubbleText: {
    color: '#fff'
  },
  chatComposer: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  input: {
    backgroundColor: palette.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  messageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.accent
  },
  messageText: {
    flex: 1
  },
  messageFrom: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 15
  },
  messagePreview: {
    color: palette.textSecondary,
    fontSize: 13
  },
  messageTime: {
    color: palette.textSecondary,
    fontSize: 12
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10
  },
  statsChip: {
    backgroundColor: palette.surfaceLight,
    color: palette.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    fontWeight: '700'
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: palette.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  saveText: {
    color: '#fff',
    fontWeight: '700'
  },
  sendBtn: {
    backgroundColor: palette.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  resetText: {
    color: palette.textPrimary,
    fontWeight: '700'
  },
  matches: {
    marginTop: 'auto',
    backgroundColor: '#121A2A',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)'
  },
  matchesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8F9FB',
    marginBottom: 8
  },
  matchesRow: {
    gap: 14
  },
  matchThumb: {
    alignItems: 'center',
    gap: 6
  },
  matchPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1F2B45',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)'
  },
  matchPhotoFallback: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  newMatch: {
    borderColor: palette.accent,
    shadowColor: palette.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  matchName: {
    color: '#E7EDF8',
    fontSize: 12,
    fontWeight: '600'
  },
  matchInitial: {
    color: '#F8F9FB',
    fontSize: 20,
    fontWeight: '800'
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    backgroundColor: palette.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }
  },
  toastText: {
    color: '#fff',
    fontWeight: '700'
  }
});
