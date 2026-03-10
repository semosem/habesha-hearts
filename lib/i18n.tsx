import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'en' | 'am';

type TranslationMap = Record<string, string>;

const STORAGE_KEY = 'habesha_hearts_locale';

const translations: Record<Locale, TranslationMap> = {
  en: {
    appName: 'Habesha Hearts',
    welcomeTitle: 'Built for real connections, not open access.',
    welcomeSubtitle: 'Sign in first, verify your account, then finish your profile before you enter the app.',
    welcomePrimaryCta: 'Start your profile',
    welcomePrimaryHint: 'Create an account and begin with your first photo.',
    welcomeSecondaryCta: 'Sign in',
    welcomeSecondaryHint: 'Continue with your verified Habesha Hearts account.',
    loginTitle: 'Log in',
    signupTitle: 'Create your account',
    login: 'Log in',
    createAccount: 'Create account',
    alreadyHaveAccount: 'I have an account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    invalidCredentials: 'Email or password is incorrect.',
    passwordsDoNotMatch: 'Passwords do not match.',
    fillRequired: 'Fill in the required fields.',
    needAccount: 'Need an account? Sign up',
    verifyTitle: 'Verify your account',
    verifyHint: 'Mock verification for {email}. In production this becomes email or phone verification.',
    verifyNow: 'Verify and continue',
    onboardingBasicsTitle: 'Set up your basics',
    onboardingPhotosTitle: 'Add your first photo',
    onboardingInterestsTitle: 'Pick a few interests',
    continue: 'Continue',
    finishSetup: 'Finish setup',
    signOut: 'Sign out',
    inbox: 'Inbox',
    swipe: 'Swipe',
    likes: 'Likes',
    explore: 'Explore',
    tabChat: 'Chat',
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
    viewProfile: 'View profile',
    aboutMe: 'About',
    interestsTitle: 'Interests',
    intentTitle: 'Looking for',
    backToSwipe: 'Back to swipe',
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
    introMessage: 'Selam. Want to grab buna this week?',
    newMatches: 'New Matches',
    tabHome: 'Home',
    tabExplore: 'Explore',
    tabLikes: 'Likes',
    tabChatShort: 'Chat',
    tabProfile: 'Profile',
    likesTitle: 'People you liked',
    likesEmpty: 'No likes yet. Swipe right on someone first.',
    exploreTitle: 'Explore',
    exploreHint: 'Browse profiles without swiping. Good for slower decisions.',
    language: 'Language',
    aboutTitle: 'About Habesha Hearts',
    aboutBody:
      'A warm, swipe-first dating experience tailored for Ethiopians at home and abroad. We keep it fast, friendly, and culturally tuned - from coffee meetups to music nights.',
    whatYouCanDo: 'What you can do',
    upcomingIdeas: 'Upcoming ideas',
    switchLanguage: 'አማ'
  },
  am: {
    appName: 'ሀበሻ ልቦች',
    welcomeTitle: 'ወደ መተግበሪያው ከመግባትዎ በፊት መለያ ይፍጠሩ።',
    welcomeSubtitle: 'መጀመሪያ ይግቡ፣ መለያዎን ያረጋግጡ እና ፕሮፋይልዎን ያጠናቁ።',
    welcomePrimaryCta: 'ፕሮፋይል ይጀምሩ',
    welcomePrimaryHint: 'መለያ ይፍጠሩ እና በመጀመሪያ ፎቶዎ ይጀምሩ።',
    welcomeSecondaryCta: 'ይግቡ',
    welcomeSecondaryHint: 'የተረጋገጠ የሀበሻ ልቦች መለያዎን ይቀጥሉ።',
    loginTitle: 'ይግቡ',
    signupTitle: 'መለያ ይፍጠሩ',
    login: 'ይግቡ',
    createAccount: 'መለያ ይፍጠሩ',
    alreadyHaveAccount: 'መለያ አለኝ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
    invalidCredentials: 'ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም።',
    passwordsDoNotMatch: 'የይለፍ ቃሎቹ አይመሳሰሉም።',
    fillRequired: 'አስፈላጊ መረጃዎችን ይሙሉ።',
    needAccount: 'መለያ የለዎትም? ይመዝገቡ',
    verifyTitle: 'መለያዎን ያረጋግጡ',
    verifyHint: 'ለ {email} የማስመሰል ማረጋገጫ ነው። በእውነተኛ ስሪት ኢሜይል ወይም ስልክ ይሆናል።',
    verifyNow: 'አረጋግጥ እና ቀጥል',
    onboardingBasicsTitle: 'መሠረታዊ መረጃዎን ያስገቡ',
    onboardingPhotosTitle: 'የመጀመሪያ ፎቶዎን ያክሉ',
    onboardingInterestsTitle: 'ጥቂት ፍላጎቶችን ይምረጡ',
    continue: 'ቀጥል',
    finishSetup: 'ማብቂያ',
    signOut: 'ውጣ',
    inbox: 'ግቢ መልእክቶች',
    swipe: 'ስዋይፕ',
    likes: 'የወደዷቸው',
    explore: 'አስስ',
    tabChat: 'ቻት',
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
    viewProfile: 'ፕሮፋይል ይመልከቱ',
    aboutMe: 'ስለ እሷ/እሱ',
    interestsTitle: 'ፍላጎቶች',
    intentTitle: 'የሚፈልጉት',
    backToSwipe: 'ወደ ስዋይፕ ተመለስ',
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
    introMessage: 'ሰላም፣ በዚህ ሳምንት ቡና እንጠጣ?',
    newMatches: 'አዲስ ማቾች',
    tabHome: 'መነሻ',
    tabExplore: 'አስስ',
    tabLikes: 'ወደዱ',
    tabChatShort: 'ቻት',
    tabProfile: 'ፕሮፋይል',
    likesTitle: 'የወደዷቸው ሰዎች',
    likesEmpty: 'ገና የወደዱት ሰው የለም። መጀመሪያ ቀኝ ይስዋይፉ።',
    exploreTitle: 'አስስ',
    exploreHint: 'ስዋይፕ ሳይደረግ ፕሮፋይሎችን ያስሱ። ለበለጠ ጥንቃቄ ውሳኔ ይረዳል።',
    language: 'ቋንቋ',
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
