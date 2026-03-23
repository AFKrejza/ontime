import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

export default function WelcomeScreen() {

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.stepIndicator}>Step 1 of 4</ThemedText>
      <ThemedText type="title" style={styles.title}>Welcome to OnTime</ThemedText>
      <ThemedText style={styles.subtitle}>
        OnTime gives you real-time public transport updates, gateway setup and tower monitoring.
      </ThemedText>
      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={() => router.replace('/main/screens/signup')}>
          <ThemedText style={styles.primaryText}>Create Account</ThemedText>
        </Pressable>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => router.replace('/main/screens/login')}>
          <ThemedText style={styles.secondaryText}>Log In</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  stepIndicator: { fontSize: 12, color: '#999', marginBottom: 12, fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '800', color: '#D32F2F', marginBottom: 15 },
  subtitle: { fontSize: 16, color: '#333', marginBottom: 24, lineHeight: 22 },
  actions: { gap: 12 },
  button: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: '#D32F2F' },
  secondaryButton: { borderWidth: 1, borderColor: '#D32F2F' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryText: { color: '#D32F2F', fontWeight: '700', fontSize: 16 },
});