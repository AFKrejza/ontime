import { useState } from 'react';
import { StyleSheet, View, Pressable, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useTowerConfig } from '@/contexts/TowerConfigContext';

const lineOptions = ['A', 'B', 'C'];
const typeOptions = ['bus', 'tram', 'metro', 'train'];

const lineColors: Record<string, string> = {
  A: '#4CAF50', // green
  B: '#FFEB3B', // yellow
  C: '#F44336', // red
};

export default function TowerConfigScreen() {
  const { saveTowerConfig } = useTowerConfig();
  const [query, setQuery] = useState('');
  const [selectedLine, setSelectedLine] = useState('A');
  const [selectedType, setSelectedType] = useState('bus');
  const [walkingOffset, setWalkingOffset] = useState(5);

  const handleSave = async () => {
    if (!query.trim()) {
      Alert.alert('Please search and select a stop first.');
      return;
    }
    try {
      await saveTowerConfig({
        stop: query,
        line: selectedLine,
        type: selectedType,
        walkingOffset,
      });
      Alert.alert('Saved', `Tower configured for ${query}`);
      router.replace('/');
    } catch {
      Alert.alert('Error', 'Failed to save tower configuration');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.stepIndicator}>Step 4 of 4</ThemedText>
      <ThemedText type="title" style={styles.title}>Tower configuration</ThemedText>
      <ThemedText style={styles.subtitle}>configure your tower to display public transport departures</ThemedText>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Search for stops...</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Type stop name..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Select line:</ThemedText>
          <View style={styles.pickerRow}>
            {lineOptions.map((line) => {
              const isSelected = selectedLine === line;
              const lineColor = lineColors[line];

              return (
                <Pressable
                  key={line}
                  style={[
                    styles.optionChip,
                    { borderColor: lineColor, backgroundColor: isSelected ? lineColor : '#fafafa' },
                  ]}
                  onPress={() => setSelectedLine(line)}
                >
                  <ThemedText style={[styles.optionText, isSelected && styles.selectedText, { color: isSelected ? '#000' : '#444' }]}>{line}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Select type:</ThemedText>
          <View style={styles.pickerRow}>
            {typeOptions.map((type) => (
              <Pressable
                key={type}
                style={[styles.optionChip, selectedType === type && styles.selectedChip]}
                onPress={() => setSelectedType(type)}
              >
                <ThemedText style={[styles.optionText, selectedType === type && styles.selectedText]}>{type}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Walking Offset (minutes):</ThemedText>
          <View style={styles.offsetRow}>
            <Pressable
              style={styles.offsetButton}
              onPress={() => setWalkingOffset((prev) => Math.max(0, prev - 1))}
            >
              <ThemedText style={styles.offsetBtnText}>-</ThemedText>
            </Pressable>
            <ThemedText style={styles.offsetValue}>{walkingOffset}</ThemedText>
            <Pressable
              style={styles.offsetButton}
              onPress={() => setWalkingOffset((prev) => Math.min(30, prev + 1))}
            >
              <ThemedText style={styles.offsetBtnText}>+</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
            <ThemedText style={styles.saveText}>Save</ThemedText>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.cancelButton]}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 20,
  },
  stepIndicator: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  input: {
    backgroundColor: '#f4f5f8',
    borderColor: '#d8dbe1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#222',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8dbe1',
    backgroundColor: '#fafafa',
  },
  selectedChip: {
    backgroundColor: '#999',
  },
  optionText: {
    fontSize: 14,
    color: '#444',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  offsetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  offsetButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offsetBtnText: {
    fontSize: 22,
    color: '#D32F2F',
    fontWeight: '800',
  },
  offsetValue: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2e7d32',
  },
  cancelButton: {
    backgroundColor: '#c62828',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '700',
  },
});