import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          Go to home screen
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: palette.background,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  link: {
    marginTop: 18,
    color: palette.accent,
    fontWeight: '700',
  },
});
