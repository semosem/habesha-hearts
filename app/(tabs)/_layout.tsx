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
        tabBarActiveTintColor: '#F6EBDD',
        tabBarInactiveTintColor: 'rgba(205, 183, 156, 0.68)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: !compactTabs,
        tabBarBackground: () => <View style={{ flex: 1, backgroundColor: '#060A12' }} />,
        tabBarStyle: {
          backgroundColor: '#060A12',
          borderTopColor: 'rgba(240,165,0,0.12)',
          height: compactTabs ? 68 : 76,
          paddingTop: 8,
          paddingBottom: compactTabs ? 8 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          paddingTop: 2,
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
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
