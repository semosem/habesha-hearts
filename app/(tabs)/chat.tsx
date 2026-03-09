import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { profiles as seedProfiles, type Profile } from '@/constants/profiles';
import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';
import { toThumbnailUrl, toWebOptimizedUrl } from '@/lib/profileImages';
import { getJSON, Match, Message, MessageMap, setJSON, STORAGE_KEYS } from '@/lib/storage';

export default function ChatScreen() {
  const { t } = useLocale();
  const [profiles, setProfiles] = useState<Profile[]>(seedProfiles);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messageMap, setMessageMap] = useState<MessageMap>({});
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');

  const loadState = useCallback(async () => {
    const storedProfiles = await getJSON<Profile[]>(STORAGE_KEYS.profiles, seedProfiles);
    const storedMatches = await getJSON<Match[]>(STORAGE_KEYS.matches, []);
    const storedMessages = await getJSON<MessageMap>(STORAGE_KEYS.messages, {});
    setProfiles(storedProfiles.length ? storedProfiles : seedProfiles);
    setMatches(storedMatches);
    setMessageMap(storedMessages);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadState();
      return () => undefined;
    }, [loadState])
  );

  const inbox = matches
    .map((match) => {
      const profile = profiles.find((item) => item.id === match.profileId);
      if (!profile) return null;
      const thread = messageMap[match.id] || [];
      const isNewMatch = !thread.some((message) => message.from === 'me');
      const lastMessage = thread[thread.length - 1];

      return {
        matchId: match.id,
        profile,
        isNewMatch,
        preview: lastMessage?.text || t('sayHi'),
        time: new Date(lastMessage?.createdAt || match.createdAt).toLocaleDateString(),
      };
    })
    .filter(Boolean) as {
    matchId: string;
    profile: Profile;
    isNewMatch: boolean;
    preview: string;
    time: string;
  }[];

  const selectedProfile = profiles.find(
    (profile) => profile.id === matches.find((match) => match.id === selectedMatchId)?.profileId
  );

  return (
    <SafeAreaView style={styles.container}>
      {!selectedMatchId ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('inbox')}</Text>
          {!inbox.length ? <Text style={styles.empty}>{t('noMatchesYet')}</Text> : null}

          {inbox.some((item) => item.isNewMatch) ? (
            <>
              <Text style={styles.sectionTitle}>{t('newMatches')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.matchRow}>
                {inbox
                  .filter((item) => item.isNewMatch)
                  .map((item) => (
                    <TouchableOpacity
                      key={item.matchId}
                      style={styles.matchThumb}
                      onPress={() => setSelectedMatchId(item.matchId)}>
                      <Image
                        source={{ uri: toWebOptimizedUrl(toThumbnailUrl(item.profile.photoUrls?.[0] || '')) }}
                        style={styles.matchPhoto}
                      />
                      <Text style={styles.matchName}>{item.profile.name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </>
          ) : null}

          {inbox.some((item) => !item.isNewMatch) ? (
            <>
              <Text style={styles.sectionTitle}>{t('messages')}</Text>
              {inbox
                .filter((item) => !item.isNewMatch)
                .map((item) => (
                  <TouchableOpacity
                    key={item.matchId}
                    style={styles.threadRow}
                    onPress={() => setSelectedMatchId(item.matchId)}>
                    <Image
                      source={{ uri: toWebOptimizedUrl(toThumbnailUrl(item.profile.photoUrls?.[0] || '')) }}
                      style={styles.threadPhoto}
                    />
                    <View style={styles.threadCopy}>
                      <Text style={styles.threadName}>{item.profile.name}</Text>
                      <Text style={styles.threadPreview} numberOfLines={1}>
                        {item.preview}
                      </Text>
                    </View>
                    <Text style={styles.threadTime}>{item.time}</Text>
                  </TouchableOpacity>
                ))}
            </>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.chatShell}>
          <View style={styles.chatHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedMatchId(null)}>
              <Text style={styles.backText}>{t('back')}</Text>
            </TouchableOpacity>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {selectedProfile?.name || t('chat')}
            </Text>
            <View style={styles.backSpacer} />
          </View>

          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {(messageMap[selectedMatchId] || []).map((message, index) => (
              <View
                key={`${message.createdAt}-${index}`}
                style={[styles.bubble, message.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={styles.bubbleText}>{message.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={draftMessage}
              onChangeText={setDraftMessage}
              placeholder={t('writeMessage')}
              placeholderTextColor={palette.textSecondary}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={async () => {
                if (!selectedMatchId || !draftMessage.trim()) return;
                const nextMessage: Message = {
                  matchId: selectedMatchId,
                  from: 'me',
                  text: draftMessage.trim(),
                  createdAt: new Date().toISOString(),
                };
                const nextMap = {
                  ...messageMap,
                  [selectedMatchId]: [...(messageMap[selectedMatchId] || []), nextMessage],
                };
                setMessageMap(nextMap);
                setDraftMessage('');
                await setJSON(STORAGE_KEYS.messages, nextMap);
              }}>
              <Text style={styles.sendText}>{t('send')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 18
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
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  matchRow: {
    gap: 14,
    paddingVertical: 6,
  },
  matchThumb: {
    alignItems: 'center',
    gap: 8,
  },
  matchPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: palette.accent,
  },
  matchName: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  threadPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  threadCopy: {
    flex: 1,
    gap: 4,
  },
  threadName: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  threadPreview: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  threadTime: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  chatShell: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 18,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  backButton: {
    minWidth: 52,
    paddingVertical: 6,
  },
  backText: {
    color: palette.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  backSpacer: {
    width: 52,
  },
  chatTitle: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    gap: 10,
    paddingBottom: 16,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: palette.primary,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surface,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  composer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: palette.surfaceLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.textPrimary,
  },
  sendButton: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
