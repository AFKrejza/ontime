import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateAccount = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    try {
      await login(email, password);
      Alert.alert('Account created', 'Welcome to OnTime!');
      router.replace('/main/screens/scan');
    } catch {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.stepIndicator}>Step 2 of 4</ThemedText>
        <IconSymbol name="person.crop.circle" size={82} color="#D32F2F" style={styles.logo} />
        <ThemedText type="title" style={styles.title}>Create Your Account</ThemedText>

        <ThemedText style={styles.label}>Email:</ThemedText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="user@example.com"
          placeholderTextColor="#999"
        />

        <ThemedText style={styles.label}>Password:</ThemedText>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="********"
          placeholderTextColor="#999"
        />

        <ThemedText style={styles.label}>Confirm Password:</ThemedText>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="********"
          placeholderTextColor="#999"
        />

        <Pressable style={styles.button} onPress={handleCreateAccount}>
          <ThemedText style={styles.buttonText}>Create Account</ThemedText>
        </Pressable>

        <Pressable onPress={() => router.replace('/main/screens/login')}>
          <ThemedText style={styles.subText} type="link">
            Already have an account? Sign In
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fc',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 9,
  },
  stepIndicator: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    backgroundColor: '#f4f5f8',
    borderColor: '#d8dbe1',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#222',
  },
  button: {
    marginTop: 22,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#3761a8',
  },
});
