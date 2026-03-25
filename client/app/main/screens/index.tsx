import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useTowerConfig } from '@/contexts/TowerConfigContext';

export default function HomeScreen() {
  const { towerConfig, isLoading } = useTowerConfig();

  // Show loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Show onboarding if no tower config is saved
  if (!towerConfig) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.brandContainer}>
          <ThemedText type="title" style={styles.title}>ontime</ThemedText>
        </View>
        <ThemedText style={styles.subtitle}>Welcome!</ThemedText>
        <ThemedText style={styles.description}>
          Configure your transit stop to get real-time departure times.
        </ThemedText>
        <Pressable style={styles.addButton} onPress={() => router.push('/main/screens/tower')}>
          <ThemedText style={styles.addButtonText}>+ Configure Stop</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Show the saved stop configuration
  return (
    <ThemedView style={styles.container}>
      <View style={styles.brandContainer}>
        <ThemedText type="title" style={styles.title}>ontime</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>Your stop:</ThemedText>

      <View style={styles.listContainer}>
        <View style={styles.deviceCard}>
          <ThemedText type="subtitle" style={styles.deviceLabel}>
            {towerConfig.stop}
          </ThemedText>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Line:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {towerConfig.line}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Type:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {towerConfig.type}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Walking offset:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {towerConfig.walkingOffset} mins
            </ThemedText>
          </View>
        </View>
      </View>

      <Pressable style={styles.addButton} onPress={() => router.push('/main/screens/tower')}>
        <ThemedText style={styles.addButtonText}>+ Configure Stop</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  brandContainer: {
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 10,
    paddingTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D32F2F',
    textTransform: 'lowercase',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  listContainer: {
    gap: 12,
  },
  deviceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  deviceLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  online: {
    color: '#28a745',
  },
  offline: {
    color: '#dc3545',
  },
  normalBattery: {
    color: '#212121',
  },
  lowBattery: {
    color: '#dc3545',
  },
  addButton: {
    marginTop: 'auto',
    borderRadius: 15,
    borderColor: '#D32F2F',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
});
