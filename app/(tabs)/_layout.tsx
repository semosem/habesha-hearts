import { Tabs } from 'expo-router';
import React from 'react';
import { useWindowDimensions, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLocale } from '@/lib/i18n';

export default function TabLayout() {
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const compactTabs = width < 430;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.68)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: !compactTabs,
        tabBarBackground: () => <View style={{ flex: 1, backgroundColor: '#020407' }} />,
        tabBarStyle: {
          backgroundColor: '#020407',
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: compactTabs ? 70 : 78,
          paddingTop: 6,
          paddingBottom: compactTabs ? 6 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('swipe'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={compactTabs ? 30 : 28} name="flame.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('explore'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={compactTabs ? 30 : 28} name="safari.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: t('likes'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={compactTabs ? 30 : 28} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('tabChat'),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={compactTabs ? 30 : 28}
              name="bubble.left.and.bubble.right.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={compactTabs ? 30 : 28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
