import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

export default function ScanScreen() {
  const [code, setCode] = useState('');

  const handleContinue = () => {
    if (!code.trim()) {
      Alert.alert('Enter the code to continue.');
      return;
    }
    Alert.alert('Connected', `Device code ${code} accepted.`);
    router.replace('/main/screens/tower');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.stepIndicator}>Step 3 of 4</ThemedText>
      <ThemedText type="title" style={styles.title}>Connect to your OnTime device</ThemedText>
      <ThemedText style={styles.subtitle}>Please enter the code displayed on your device.</ThemedText>

      <View style={styles.qrBox}>
        <View style={styles.qrPlaceholder}>
          <View style={styles.qrBlock} />
          <View style={styles.qrBlockRow} />
          <View style={styles.qrBlockRow} />
        </View>
      </View>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={setCode}
        placeholder="Enter the code to continue"
        placeholderTextColor="#999"
        keyboardType="default"
        autoCapitalize="none"
      />

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <ThemedText style={styles.continueText}>Continue</ThemedText>
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.push('/main/screens')}>
        <ThemedText style={styles.backText}>Back</ThemedText>
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
  stepIndicator: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 20,
  },
  qrBox: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBlock: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 14,
  },
  qrBlockRow: {
    width: 140,
    height: 16,
    backgroundColor: '#333',
    marginVertical: 4,
    borderRadius: 2,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#f4f5f8',
  },
  continueButton: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  continueText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backText: {
    color: '#dc3545',
    fontWeight: '700',
  },
});
