import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'en' | 'am';

type TranslationMap = Record<string, string>;

const STORAGE_KEY = 'habesha_hearts_locale';

const translations: Record<Locale, TranslationMap> = {
  en: {
    appName: 'Habesha Hearts',
    findLove: 'Find love',
    messages: 'Messages',
    profile: 'Profile',
    likedLabel: '{count} liked',
    passedLabel: '{count} passed',
    caughtUpTitle: "You're all caught up.",
    caughtUpHint: 'Open Profile and tap reset to see cards again.',
    noMatchesYet: 'No matches yet. Like someone first.',
    back: 'Back',
    writeMessage: 'Write a message',
    send: 'Send',
    yourProfile: 'Your profile',
    name: 'Name',
    city: 'City',
    intent: 'Intent (Dating / Long term / Friendship)',
    photoUrl: 'Photo URL (optional)',
    saveProfile: 'Save profile',
    resetLikesPasses: 'Reset likes/passes',
    toastLiked: 'You liked {name}',
    toastBlocked: 'Blocked {name}',
    chat: 'Chat',
    sayHi: 'Say hi',
    likeBadge: 'LIKE',
    nopeBadge: 'NOPE',
    introMessage: 'Selam {name}. Want to grab buna this week?',
    newMatches: 'New Matches',
    tabHome: 'Home',
    tabExplore: 'Explore',
    aboutTitle: 'About Habesha Hearts',
    aboutBody:
      'A warm, swipe-first dating experience tailored for Ethiopians at home and abroad. We keep it fast, friendly, and culturally tuned - from coffee meetups to music nights.',
    whatYouCanDo: 'What you can do',
    upcomingIdeas: 'Upcoming ideas',
    switchLanguage: 'አማ'
  },
  am: {
    appName: 'ሀበሻ ልቦች',
    findLove: 'ፍቅር ፈልግ',
    messages: 'መልእክቶች',
    profile: 'ፕሮፋይል',
    likedLabel: '{count} ወደዱ',
    passedLabel: '{count} አለፉ',
    caughtUpTitle: 'ሁሉንም ካርዶች ጨርሰዋል።',
    caughtUpHint: 'አዲስ ካርዶች ለማየት ወደ ፕሮፋይል ሄደው Reset ይጫኑ።',
    noMatchesYet: 'ገና ማች የለም። መጀመሪያ ሰው ይውደዱ።',
    back: 'ተመለስ',
    writeMessage: 'መልእክት ይፃፉ',
    send: 'ላክ',
    yourProfile: 'የእርስዎ ፕሮፋይል',
    name: 'ስም',
    city: 'ከተማ',
    intent: 'ፍላጎት (ዴቲንግ / ረጅም ግንኙነት / ጓደኝነት)',
    photoUrl: 'የፎቶ URL (አማራጭ)',
    saveProfile: 'ፕሮፋይል አስቀምጥ',
    resetLikesPasses: 'የወደዱ/ያለፉ ዳግም አስጀምር',
    toastLiked: '{name}ን ወደዱ',
    toastBlocked: '{name} ታግዷል',
    chat: 'ውይይት',
    sayHi: 'ሰላም በል',
    likeBadge: 'ወድጄዋለሁ',
    nopeBadge: 'አልፌዋለሁ',
    introMessage: 'ሰላም {name}፣ በዚህ ሳምንት ቡና እንጠጣ?',
    newMatches: 'አዲስ ማቾች',
    tabHome: 'መነሻ',
    tabExplore: 'አስስ',
    aboutTitle: 'ስለ ሀበሻ ልቦች',
    aboutBody:
      'ለኢትዮጵያውያን በሀገር ውስጥና በውጭ የተዘጋጀ ፈጣን እና ቀላል የመግጠሚያ መተግበሪያ ነው። ከቡና ቀጠሮ እስከ ሙዚቃ ምሽት ድረስ የባህል ቅርብ ልምድ ይሰጣል።',
    whatYouCanDo: 'ማድረግ የሚችሉት',
    upcomingIdeas: 'ቀጣይ ሀሳቦች',
    switchLanguage: 'EN'
  }
};

type TranslationKey = keyof typeof translations.en;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function format(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

function detectLocale(): Locale {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale?.toLowerCase() || 'en';
  return locale.startsWith('am') ? 'am' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale());

  useEffect(() => {
    const loadLocale = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'am') {
        setLocaleState(stored);
      }
    };
    loadLocale();
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      format(translations[locale][key] ?? translations.en[key], params),
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return context;
}
