import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/constants/theme';
import { useLocale } from '@/lib/i18n';

export function LocaleSwitch() {
  const { locale, setLocale } = useLocale();

  return (
    <View style={styles.switch}>
      <TouchableOpacity
        style={[styles.segment, styles.segmentLeft, locale === 'en' && styles.segmentActive]}
        onPress={() => setLocale('en')}>
        <Text style={[styles.segmentText, locale === 'en' && styles.segmentTextActive]}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segment, styles.segmentRight, locale === 'am' && styles.segmentActive]}
        onPress={() => setLocale('am')}>
        <Text style={[styles.segmentText, locale === 'am' && styles.segmentTextActive]}>አማ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  switch: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(183, 28, 28, 0.12)',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(240, 165, 0, 0.38)',
    overflow: 'hidden',
  },
  segment: {
    minWidth: 86,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentLeft: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  segmentRight: {
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  segmentActive: {
    backgroundColor: palette.primary,
  },
  segmentText: {
    color: '#E6C89E',
    fontWeight: '800',
    fontSize: 16,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});
