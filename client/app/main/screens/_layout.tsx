import { Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { CustomTabBar } from '@/components/custom-tab-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTowerConfig } from '@/contexts/TowerConfigContext';
import { useAuth } from '@/contexts/AuthContext';

// Screens that should show the custom tab bar (main app screens)
const mainAppScreens = ['/main/screens', '/main/screens/tower', '/main/screens/settings'];

export default function ScreensLayout() {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isOnboardingComplete } = useTowerConfig();
  const { isLogged } = useAuth();

  // Show tab bar only when onboarding is complete AND user is logged in
  // This hides the tab bar during onboarding/login flow
  const showTabBar = isOnboardingComplete && isLogged;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="tower" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="scan" />
        </Stack>
      </View>
      {showTabBar && <CustomTabBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
