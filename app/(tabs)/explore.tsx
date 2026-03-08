import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/lib/i18n';

export default function AboutScreen() {
  const { locale, t } = useLocale();
  const points =
    locale === 'am'
      ? [
          'ለሀበሻ እና ለኢትዮጵያ ዲያስፖራ ግንኙነቶች የተሰራ።',
          'ቀኝ ይጎትቱ ለመውደድ፣ ግራ ይጎትቱ ለመተው - ቀላል እና ፈጣን።',
          'ፍላጎቶች እና አጭር መግለጫዎች ግንኙነቱን ሰውነታዊ ያደርጋሉ።',
          'ቡና ቀጠሮ፣ ተራራ ጉዞ፣ ሙዚቃ፣ መጽሐፍ ክለብ - የእርስዎን ሁኔታ ይምረጡ።',
          'ደህንነት ቅድሚያ ነው፤ በህዝብ ቦታ ይገናኙ እና እቅድዎን ለጓደኛ ያጋሩ።'
        ]
      : [
          'Built for Habesha & Ethiopian diaspora connections.',
          'Swipe right to like, left to pass - simple and fast.',
          'Interests & short bios keep things human and local.',
          'Coffee dates, hikes, music, book clubs - pick your vibe.',
          'Safety first: meet in public, share plans with a friend.'
        ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('aboutTitle')}</Text>
      <Text style={styles.body}>{t('aboutBody')}</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>{t('whatYouCanDo')}</Text>
        {points.map((p) => (
          <Text key={p} style={styles.listItem}>
            • {p}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>{t('upcomingIdeas')}</Text>
        <Text style={styles.listItem}>
          •{' '}
          {locale === 'am'
            ? 'በመተግበሪያ ውስጥ የአማርኛ/ትግርኛ ሰላምታ ማበልጸጊያ'
            : 'In-app Amharic/Tigrinya greetings booster'}
        </Text>
        <Text style={styles.listItem}>
          • {locale === 'am' ? 'የተረጋገጡ የቡና ስነ-ስርዓት ቀጠሮዎች' : 'Verified coffee ceremony meetups'}
        </Text>
        <Text style={styles.listItem}>
          •{' '}
          {locale === 'am'
            ? 'ለበዓላት እና ኮንሰርቶች የክስተት መሰረት ማች'
            : 'Event-based matching for festivals & concerts'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D111A',
    paddingHorizontal: 18
  },
  content: {
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16
  },
  title: {
    color: '#F8F9FB',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  body: {
    color: '#C7CFDB',
    fontSize: 15,
    lineHeight: 22
  },
  card: {
    backgroundColor: '#121826',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6
  },
  subtitle: {
    color: '#F0A500',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4
  },
  listItem: {
    color: '#C7CFDB',
    fontSize: 14,
    lineHeight: 20
  }
});
