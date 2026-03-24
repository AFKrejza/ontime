import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

interface TabItem {
  name: string;
  route: string;
  icon: string;
  title: string;
}

const tabs: TabItem[] = [
  { name: 'index', route: '/main/screens', icon: 'house.fill', title: 'Home' },
  { name: 'tower', route: '/main/screens/tower', icon: 'antenna.radiowaves.left.and.right', title: 'Tower' },
  { name: 'settings', route: '/main/screens/settings', icon: 'gear', title: 'Settings' },
];

export function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = (route: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || 
          (tab.name === 'index' && pathname === '/main/screens');
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handlePress(tab.route)}
            activeOpacity={0.7}
          >
            <IconSymbol 
              size={28} 
              name={tab.icon as any} 
              color={isActive ? colors.tint : colors.text} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 85,
    paddingBottom: 25,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
