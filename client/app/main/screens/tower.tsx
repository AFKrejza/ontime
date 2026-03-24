import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useTowerConfig } from '@/contexts/TowerConfigContext';
import { 
  fetchTrieData, 
  fetchStopLines, 
  searchStops, 
  type StopSummary, 
  type StopDetails, 
  type Line,
  type SelectedStop
} from '@/utils/api';

// Server endpoint for saving stop (prepared but not sent yet)
const SERVER_URL = 'http://localhost:3000';

export default function TowerConfigScreen() {
  const { saveTowerConfig } = useTowerConfig();
  
  // Search state
  const [query, setQuery] = useState('');
  const [allStops, setAllStops] = useState<StopSummary[]>([]);
  const [searchResults, setSearchResults] = useState<StopSummary[]>([]);
  const [isLoadingStops, setIsLoadingStops] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  // Selected stop state
  const [selectedStop, setSelectedStop] = useState<StopSummary | null>(null);
  const [stopLines, setStopLines] = useState<StopDetails | null>(null);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  
  // Line selection state
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [walkingOffset, setWalkingOffset] = useState(5);
  
  // Fetch trieData on mount
  useEffect(() => {
    async function loadStops() {
      try {
        const data = await fetchTrieData();
        setAllStops(data);
      } catch (error) {
        console.error('Failed to load stops:', error);
        Alert.alert('Error', 'Failed to load stops from server');
      } finally {
        setIsLoadingStops(false);
      }
    }
    loadStops();
  }, []);
  
  // Handle search input change
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (text.trim()) {
      const results = searchStops(allStops, text);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [allStops]);
  
  // Handle selecting a stop from search results
  const handleSelectStop = async (stop: StopSummary) => {
    setQuery(stop.name);
    setSelectedStop(stop);
    setShowResults(false);
    setSearchResults([]);
    
    // Fetch lines for this stop
    setIsLoadingLines(true);
    try {
      const lines = await fetchStopLines(stop.id);
      setStopLines(lines);
      setSelectedLine(null); // Reset line selection
    } catch (error) {
      console.error('Failed to load lines:', error);
      Alert.alert('Error', 'Failed to load stop lines');
    } finally {
      setIsLoadingLines(false);
    }
  };
  
  // Get lines grouped by type for display
  const getLinesByType = () => {
    if (!stopLines) return [];
    
    const types: Array<{ type: string; lines: Line[] }> = [];
    
    if (stopLines.lines.tram) {
      types.push({ type: 'tram', lines: stopLines.lines.tram });
    }
    if (stopLines.lines.bus) {
      types.push({ type: 'bus', lines: stopLines.lines.bus });
    }
    if (stopLines.lines.metro) {
      types.push({ type: 'metro', lines: stopLines.lines.metro });
    }
    if (stopLines.lines.train) {
      types.push({ type: 'train', lines: stopLines.lines.train });
    }
    
    return types;
  };
  
  // Prepare the final config object (ready to send to server)
  const prepareStopConfig = (): SelectedStop | null => {
    if (!selectedStop || !selectedLine) return null;
    
    return {
      stopName: selectedStop.name,
      stopId: selectedStop.id,
      line: {
        id: selectedLine.id,
        name: selectedLine.name,
        type: selectedLine.type,
        direction: selectedLine.direction,
        gtfsId: selectedLine.gtfsId,
      },
      offset: walkingOffset,
    };
  };
  
  // Handle save - prepare format but only save locally for now
  const handleSave = async () => {
    const config = prepareStopConfig();
    
    if (!config) {
      Alert.alert('Please select a stop and line first');
      return;
    }
    
    try {
      // Save to local storage (as per request - don't send to server yet)
      await saveTowerConfig({
        stop: config.stopName,
        line: config.line.name,
        type: config.line.type,
        walkingOffset: config.offset,
      });
      
      // Log the prepared format (ready to send)
      console.log('Prepared stop config (ready to send to server):', JSON.stringify(config, null, 2));
      
      Alert.alert('Saved', `Tower configured for ${config.stopName} - ${config.line.name}`);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to save tower configuration');
    }
  };
  
  // Render search result item
  const renderSearchResult = ({ item }: { item: StopSummary }) => (
    <Pressable 
      style={styles.searchResultItem}
      onPress={() => handleSelectStop(item)}
    >
      <ThemedText style={styles.searchResultText}>{item.name}</ThemedText>
    </Pressable>
  );
  
  // Render line item
  const renderLineItem = (line: Line) => {
    const isSelected = selectedLine?.gtfsId === line.gtfsId;
    
    return (
      <Pressable
        key={line.gtfsId}
        style={[styles.lineItem, isSelected && styles.lineItemSelected]}
        onPress={() => setSelectedLine(line)}
      >
        <View style={styles.lineInfo}>
          <ThemedText style={[styles.lineName, isSelected && styles.lineTextSelected]}>
            {line.name}
          </ThemedText>
          <ThemedText style={styles.lineDirection}>{line.direction}</ThemedText>
        </View>
        <ThemedText style={[styles.lineType, isSelected && styles.lineTextSelected]}>
          {line.type}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.stepIndicator}>Step 4 of 4</ThemedText>
      <ThemedText type="title" style={styles.title}>Tower configuration</ThemedText>
      <ThemedText style={styles.subtitle}>configure your tower to display public transport departures</ThemedText>

      <View style={styles.form}>
        {/* Stop Search */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Search for stops...</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Type stop name..."
            value={query}
            onChangeText={handleQueryChange}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholderTextColor="#999"
          />
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        {/* Loading indicator for stops */}
        {isLoadingStops && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#D32F2F" />
            <ThemedText style={styles.loadingText}>Loading stops...</ThemedText>
          </View>
        )}

        {/* Stop Lines */}
        {selectedStop && !isLoadingLines && stopLines && (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Select a line at {selectedStop.name}:</ThemedText>
            
            {getLinesByType().map(({ type, lines }) => (
              <View key={type} style={styles.typeGroup}>
                <ThemedText style={styles.typeLabel}>{type.toUpperCase()}</ThemedText>
                {lines.map(line => renderLineItem(line))}
              </View>
            ))}
          </View>
        )}

        {/* Loading indicator for lines */}
        {isLoadingLines && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#D32F2F" />
            <ThemedText style={styles.loadingText}>Loading lines...</ThemedText>
          </View>
        )}

        {/* Walking Offset */}
        {selectedLine && (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Walking time to stop (minutes):</ThemedText>
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
        )}

        {/* Selected Configuration Summary */}
        {selectedLine && (
          <View style={styles.summary}>
            <ThemedText style={styles.summaryTitle}>Selected:</ThemedText>
            <ThemedText style={styles.summaryText}>
              {selectedStop?.name} → {selectedLine.name} ({selectedLine.direction})
            </ThemedText>
            <ThemedText style={styles.summaryText}>
              Walking time: {walkingOffset} minutes
            </ThemedText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable 
            style={[
              styles.actionButton, 
              styles.saveButton,
              !selectedLine && styles.buttonDisabled
            ]} 
            onPress={handleSave}
            disabled={!selectedLine}
          >
            <ThemedText style={styles.saveText}>Save</ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => router.back()}
          >
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
    position: 'relative',
    zIndex: 1,
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
  searchResults: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#d8dbe1',
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  typeGroup: {
    marginTop: 8,
    gap: 4,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8dbe1',
    backgroundColor: '#fafafa',
    marginBottom: 4,
  },
  lineItemSelected: {
    borderColor: '#D32F2F',
    backgroundColor: '#D32F2F',
  },
  lineInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  lineDirection: {
    fontSize: 12,
    color: '#666',
  },
  lineType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  lineTextSelected: {
    color: '#fff',
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
  summary: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
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
  buttonDisabled: {
    backgroundColor: '#ccc',
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
