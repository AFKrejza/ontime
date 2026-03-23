import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

interface DeviceInfo {
  id: string;
  label: string;
  status: 'online' | 'offline';
  battery: number;
  lastSeen: string;
}

const devices: DeviceInfo[] = [
  { id: '1', label: 'Tower: home stop', status: 'online', battery: 46, lastSeen: '12:32' },
  { id: '2', label: 'Tower: work stop', status: 'offline', battery: 22, lastSeen: '16:03' },
];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.brandContainer}>
        <ThemedText type="title" style={styles.title}>ontime</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>Your devices:</ThemedText>

      <View style={styles.listContainer}>
        {devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <ThemedText type="subtitle" style={styles.deviceLabel}>{device.label}</ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Status:</ThemedText>
              <ThemedText style={[styles.detailValue, device.status === 'online' ? styles.online : styles.offline]}>
                {device.status}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Battery:</ThemedText>
              <ThemedText style={[styles.detailValue, device.battery <= 25 ? styles.lowBattery : styles.normalBattery]}>
                {device.battery}%{device.battery <= 25 ? ' (low)' : ''}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Last seen:</ThemedText>
              <ThemedText style={styles.detailValue}>{device.lastSeen}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.addButton} onPress={() => router.push('/main/screens/tower')}>
        <ThemedText style={styles.addButtonText}>+ Add Gateway</ThemedText>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D32F2F',
    textTransform: 'lowercase',
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
    borderRadius: 14,
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
});
