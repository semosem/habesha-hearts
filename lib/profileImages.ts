import { Platform } from 'react-native';

export function toThumbnailUrl(url: string) {
  if (!url.includes('/randomuser.me/api/portraits/')) return url;
  if (url.includes('/api/portraits/thumb/')) return url;
  return url.replace('/api/portraits/', '/api/portraits/thumb/');
}

export function toWebOptimizedUrl(url: string) {
  if (Platform.OS !== 'web') return url;
  try {
    const parsed = new URL(url);
    const source = `${parsed.host}${parsed.pathname}${parsed.search}`;
    return `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=96&h=96&fit=cover&output=webp&q=70`;
  } catch {
    return url;
  }
}
