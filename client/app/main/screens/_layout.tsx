import { Stack, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTowerConfig } from '@/contexts/TowerConfigContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ScreensLayout() {
  const colorScheme = useColorScheme();
  const { isOnboardingComplete } = useTowerConfig();
  const { isLogged } = useAuth();

  // Show onboarding flow (stack) only when onboarding is not complete AND user is not logged in
  // This ensures logged-in users always see the tabs, never the onboarding stack
  if (!isOnboardingComplete && !isLogged) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="tower" />
      </Stack>
    );
  }

  // Show main app tabs after onboarding complete or when logged in
  // Only show Home, Settings, and Tower tabs
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tower"
        options={{
          title: 'Tower',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="antenna.radiowaves.left.and.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
