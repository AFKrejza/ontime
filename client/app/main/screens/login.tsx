import { useState } from 'react';
import { StyleSheet, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Please fill in email and password.');
      return;
    }

    try {
      await login(email, password);
      alert('You are now signed in.');
      router.replace('/main/screens/scan');
    } catch {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.stepIndicator}>Step 2 of 4</ThemedText>
      <ThemedText type='title' style={styles.title}>Log In</ThemedText>
      <TextInput style={styles.input} placeholder='Email' autoCapitalize='none' value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder='Password' secureTextEntry value={password} onChangeText={setPassword} />
      <Pressable style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Log In</ThemedText>
      </Pressable>
      <Pressable onPress={() => router.replace('/main/screens/signup')}>
        <ThemedText style={styles.linkText}>Create account</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  stepIndicator: { fontSize: 12, color: '#999', marginBottom: 12, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#d8dbe1', borderRadius: 10, padding: 14, marginBottom: 14, backgroundColor: '#f4f5f8' },
  button: { backgroundColor: '#D32F2F', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkText: { color: '#1976D2', fontSize: 14, textAlign: 'center' },
});