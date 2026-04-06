import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, TextInput, Alert, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useTowerConfig } from '@/contexts/TowerConfigContext';
import { fetchTrieData, fetchStopLines, addStop, StopSummary, StopDetails, Line, SERVER_URL } from '@/utils/api';

const typeOptions = ['bus', 'tram', 'metro', 'train'];

// Fallback stops in case API is not available
const fallbackStops: StopSummary[] = [
  { name: 'Vysocanska', id: '001' },
  { name: 'Hlavni nadrazi', id: '002' },
  { name: 'Narodni trida', id: '003' },
  { name: 'Wenceslas Square', id: '004' },
  { name: 'Old Town Square', id: '005' },
  { name: 'Charles Bridge', id: '006' },
  { name: 'Mustek', id: '007' },
  { name: 'Muzeum', id: '008' },
  { name: 'Florenc', id: '009' },
  { name: 'Andel', id: '010' },
];

const lineColors: Record<string, string> = {
  A: '#4CAF50', 
  B: '#FFEB3B', 
  C: '#F44336',
};

export default function TowerConfigScreen() {
  const { saveTowerConfig } = useTowerConfig();
  const [allStops, setAllStops] = useState<StopSummary[]>([]);
  const [filteredStops, setFilteredStops] = useState<StopSummary[]>([]);
  const [query, setQuery] = useState('');
  const [selectedStop, setSelectedStop] = useState<StopSummary | null>(null);
  const [stopDetails, setStopDetails] = useState<StopDetails | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [selectedType, setSelectedType] = useState<string>('bus');
  const [walkingOffset, setWalkingOffset] = useState(5);

  // Fetch all stops on mount
  // remve the alert debug statements if you have a working API and want to avoid the popups every time
  useEffect(() => {
    const loadStops = async () => {
      try {
        setLoading(true);
        //Alert.alert('Debug', 'Connecting to http://localhost:3000/trieData...');
        const stops = await fetchTrieData();
       // Alert.alert('API Result', `Got ${stops.length} stops`);
        if (stops && stops.length > 0) {
          setAllStops(stops);
          setFilteredStops(stops.slice(0, 20));
        } else {
          // Use fallback if API returns empty
          setAllStops(fallbackStops);
          setFilteredStops(fallbackStops);
        }
      } catch (error) {
        //Alert.alert('API Error', 'Failed to fetch stops: ' + error);
        // Use fallback stops if API fails
        setAllStops(fallbackStops);
        setFilteredStops(fallbackStops);
      } finally {
        setLoading(false);
      }
    };
    loadStops();
  }, []);

  // Filter stops when query changes
  useEffect(() => {
    if (query.trim()) {
      const filtered = allStops.filter(stop =>
        stop.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20);
      setFilteredStops(filtered);
      setShowDropdown(true);
    } else {
      setFilteredStops([]);
      setShowDropdown(false); // Don't show dropdown when query is empty
    }
  }, [query, allStops]);

  const handleSelectStop = async (stop: StopSummary) => {
    setSelectedStop(stop);
    setQuery(stop.name);
    setShowDropdown(false);
    setLoading(true);

    try {
      const details = await fetchStopLines(stop.id);
      setStopDetails(details);

      const availableTypes = Object.keys(details.lines).filter(
        (type) => details.lines[type as keyof typeof details.lines]?.length
      );

      const initialType = availableTypes.length > 0 ? availableTypes[0] : 'bus';
      setSelectedType(initialType);

      const initialLines = details.lines[initialType as keyof typeof details.lines];
      setSelectedLine(initialLines && initialLines.length > 0 ? initialLines[0] : null);
    } catch (error) {
      console.error('Error fetching stop details for', stop.name, error);
      setStopDetails(null);
      setSelectedLine(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStop || !selectedLine) {
      Alert.alert('Please select a stop and a line first');
      return;
    }

    try {
      await saveTowerConfig({
        stop: selectedStop.name,
        stopId: selectedStop.id,
        line: selectedLine.name,
        type: selectedLine.type,
        walkingOffset,
      });

      try {
        await addStop({
          offset: walkingOffset,
          stopName: selectedStop.name,
          stopId: selectedStop.id,
          line: selectedLine,
        });
      } catch (serverError) {
        console.log('Server not available, saved locally only', serverError);
      }

      Alert.alert('Saved', `Tower configured for ${selectedStop.name} (${selectedLine.name} ${selectedLine.type})`);
      router.replace('/');
    } catch (error) {
      console.error('Error saving tower configuration:', error);
      Alert.alert('Error', 'Failed to save tower configuration');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Configure Tower
        </ThemedText>

        {/* Stop Search Input */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Select Stop</ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search for a stop..."
              placeholderTextColor="#888"
              value={query}
              onChangeText={setQuery}
              onFocus={() => {
                if (query.trim()) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow selection
                setTimeout(() => setShowDropdown(false), 200);
              }}
            />
            {loading && <ThemedText style={styles.loadingText}>Loading...</ThemedText>}
          </View>
          
          {/* Dropdown showing filtered stops */}
          {showDropdown && filteredStops.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={filteredStops}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stopItem}
                    onPress={() => handleSelectStop(item)}
                  >
                    <ThemedText style={styles.stopName}>{item.name}</ThemedText>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
                style={styles.dropdownList}
              />
            </View>
          )}
        </View>

        {/* Selected Stop Display */}
        {selectedStop && (
          <View style={styles.selectedSection}>
            <ThemedText type="subtitle">Selected Stop</ThemedText>
            <ThemedText style={styles.selectedText}>
              {selectedStop.name}
            </ThemedText>
          </View>
        )}

        {/* Transport Type Selection */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Transport Type</ThemedText>
          <View style={styles.optionsRow}>
              {(stopDetails ? Object.keys(stopDetails.lines) : typeOptions)
                .filter((type) => {
                  if (!stopDetails) return true;
                  const lines = stopDetails.lines[type as keyof typeof stopDetails.lines];
                  return !!lines && lines.length > 0;
                })
                .map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.optionButton,
                      selectedType === type && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      setSelectedType(type);
                      if (stopDetails) {
                        const lines = stopDetails.lines[type as keyof typeof stopDetails.lines];
                        setSelectedLine(lines && lines.length > 0 ? lines[0] : null);
                      }
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        selectedType === type && styles.optionTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </ThemedText>
                  </Pressable>
                ))}
            </View>
          </View>

          {/* Line Selection */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Line</ThemedText>
            {stopDetails && selectedType ? (
              <View style={styles.optionsRow}>
                {(stopDetails.lines[selectedType as keyof typeof stopDetails.lines] || []).map((line) => (
                  <Pressable
                    key={line.id}
                    style={[
                      styles.lineButton,
                      { backgroundColor: lineColors[line.name] || '#888' },
                      selectedLine?.id === line.id && styles.lineButtonSelected,
                    ]}
                    onPress={() => setSelectedLine(line)}
                  >
                    <ThemedText
                      style={[
                        styles.lineButtonText,
                        selectedLine?.id === line.id && styles.lineButtonTextSelected,
                      ]}
                    >
                      {line.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.helperText}>
                Select a stop first to view available lines.
              </ThemedText>
            )}
          </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Walking Offset: mins</ThemedText>
          <View style={styles.offsetRow}>
            <Pressable
              style={styles.offsetButton}
              onPress={() => setWalkingOffset(Math.max(0, walkingOffset - 1))}
            >
              <ThemedText style={styles.offsetButtonText}>-</ThemedText>
            </Pressable>
            <View style={styles.offsetValue}>
              <ThemedText style={styles.offsetText}>{walkingOffset}</ThemedText>
            </View>
            <Pressable
              style={styles.offsetButton}
              onPress={() => setWalkingOffset(Math.min(30, walkingOffset + 1))}
            >
              <ThemedText style={styles.offsetButtonText}>+</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Save Button */} 
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>Add Configuration</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 25,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  loadingText: {
    position: 'absolute',
    right: 12,
    top: 20,
    color: '#888',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownList: {
    maxHeight: 200,
  },
  stopItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stopName: {
    fontSize: 14,
  },
  selectedSection: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
  lineButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  lineButtonSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#000',
  },
  lineButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  lineButtonTextSelected: {
    color: '#fff',
  },
  helperText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  offsetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  offsetButton: {
    width: 40,
    height: 35,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offsetButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  offsetValue: {
    minWidth: 60,
    alignItems: 'center',
  },
  offsetText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D32F2F',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#D32F2F',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
