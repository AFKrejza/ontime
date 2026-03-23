import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, ActivityIndicator, Platform } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Server API configuration
type ApiConfig = {
  url: string;
};

const getApiUrl = (): ApiConfig => {
  if (Platform.OS === 'android') {
    return { url: 'http://10.0.2.2:3000' };
  }
  // iOS and Web can use local host when running server locally
  return { url: 'http://localhost:3000' };
};

const API_URL = getApiUrl().url;

interface Stop {
  id: string;
  name: string;
  type: string;
  lines: string[];
  gtfsId?: string;
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stops from server on mount
  useEffect(() => {
    fetchAllStops();
  }, []);

  // Search when query changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 0) {
        searchStops(searchQuery);
      } else if (searchQuery.length === 0) {
        fetchAllStops();
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchAllStops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stops`);
      if (!response.ok) {
        throw new Error('Failed to fetch stops');
      }
      const data = await response.json();
      setStops(data);
    } catch (err) {
      console.error('Error fetching stops:', err);
      setError('Could not connect to server. Using offline data.');
      // Fallback to sample data if server is not available
      setStops([
        { id: '1', name: 'Nádraží Holešovice', type: 'metro', lines: ['C'] },
        { id: '2', name: 'Můstek', type: 'metro', lines: ['A', 'B'] },
        { id: '3', name: 'Karlín', type: 'tram', lines: ['3', '8'] },
        { id: '4', name: 'Hlavní nádraží', type: 'bus', lines: ['100', '110'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const searchStops = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stops/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search stops');
      }
      const data = await response.json();
      setStops(data);
    } catch (err) {
      console.error('Error searching stops:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="bus.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Find Your Stop</ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <IconSymbol size={20} name="magnifyingglass" color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for bus, metro, or tram stop..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a84ff" />
          <ThemedText style={styles.loadingText}>Connecting to server...</ThemedText>
        </View>
      )}

      {error && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      )}

      {!loading && (
        <ThemedView style={styles.resultsContainer}>
          <ThemedText type="subtitle">Nearby Stops</ThemedText>
          
          {stops.map((stop) => (
          <Pressable key={stop.id} style={styles.stopItem}>
            <View style={styles.stopIcon}>
              <ThemedText>
                {stop.type === 'metro' ? '🚇' : stop.type === 'tram' ? '🚊' : '🚌'}
              </ThemedText>
            </View>
            <View style={styles.stopInfo}>
              <ThemedText type="defaultSemiBold">{stop.name}</ThemedText>
              <ThemedText style={styles.stopLines}>
                Lines: {(stop.lines || []).join(', ') || 'N/A'}
              </ThemedText>
            </View>
            <View style={styles.arrivalInfo}>
              <ThemedText style={styles.arrivalTime}>2 min</ThemedText>
            </View>
          </Pressable>
        ))}
      </ThemedView>
      )}

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="title" style={styles.infoTitle}>How It Works</ThemedText>
        
        <ThemedView style={styles.infoItem}>
          <ThemedText type="defaultSemiBold">1. Search</ThemedText>
          <ThemedText>Enter your stop name in the search bar</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.infoItem}>
          <ThemedText type="defaultSemiBold">2. Select</ThemedText>
          <ThemedText>Choose your stop from the results</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.infoItem}>
          <ThemedText type="defaultSemiBold">3. Track</ThemedText>
          <ThemedText>View and get real-time departure times on your OnTime device </ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoItem}>
          <ThemedText type="defaultSemiBold">4. Save</ThemedText>
          <ThemedText>Never be late again.</ThemedText>
        </ThemedView>


      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    padding: 20,
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  resultsContainer: {
    padding: 20,
    gap: 12,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  stopIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  stopInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stopLines: {
    fontSize: 12,
    opacity: 0.7,
  },
  arrivalInfo: {
    alignItems: 'flex-end',
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a84ff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#888',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 100, 100, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#ff6464',
    textAlign: 'center',
  },
  infoContainer: {
    padding: 20,
    gap: 16,
  },
  infoTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  infoItem: {
    gap: 4,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
});
