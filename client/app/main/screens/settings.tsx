import { StyleSheet, Pressable, View, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTowerConfig } from '@/contexts/TowerConfigContext';
import storage from '@/utils/storage';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { clearTowerConfig } = useTowerConfig();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUserEmail = async () => {
      const email = await storage.getItem('userEmail');
      setUserEmail(email);
    };
    getUserEmail();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Log Out',
        onPress: async () => {
          await logout();
          await clearTowerConfig();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Settings</ThemedText>

      <View style={styles.section}>
        <View style={styles.card}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{userEmail || 'Not set'}</ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <Pressable style={[styles.button, styles.dangerButton]} onPress={handleLogout}>
          <ThemedText style={styles.dangerText}>Log Out</ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>About</ThemedText>
        <View style={styles.card}>
          <ThemedText style={styles.label}>Version</ThemedText>
          <ThemedText style={styles.value}>1.0.0</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    paddingTop: 45,
    color: '#000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#D32F2F',
  },
  dangerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
