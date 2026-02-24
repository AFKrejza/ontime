import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - in production this would come from an API
  const sampleStops = [
    { id: '1', name: 'Nádraží Holešovice', type: 'metro', lines: ['C'] },
    { id: '2', name: 'Můstek', type: 'metro', lines: ['A', 'B'] },
    { id: '3', name: 'Karlín', type: 'tram', lines: ['3', '8'] },
    { id: '4', name: 'Hlavní nádraží', type: 'bus', lines: ['902', '910'] },
  ];

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

      <ThemedView style={styles.resultsContainer}>
        <ThemedText type="subtitle">Nearby Stops</ThemedText>
        
        {sampleStops.map((stop) => (
          <Pressable key={stop.id} style={styles.stopItem}>
            <View style={styles.stopIcon}>
              <ThemedText>
                {stop.type === 'metro' ? '🚇' : stop.type === 'tram' ? '🚊' : '🚌'}
              </ThemedText>
            </View>
            <View style={styles.stopInfo}>
              <ThemedText type="defaultSemiBold">{stop.name}</ThemedText>
              <ThemedText style={styles.stopLines}>
                Lines: {stop.lines.join(', ')}
              </ThemedText>
            </View>
            <View style={styles.arrivalInfo}>
              <ThemedText style={styles.arrivalTime}>2 min</ThemedText>
            </View>
          </Pressable>
        ))}
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="title" style={styles.infoTitle}>How It Works</ThemedText>
        
        <ThemedView style={styles.infoItem}>
          <ThemedText type="defaultSemiBold">1. Search</ThemedText>
          <ThemedText>Enter your bus, metro, or tram stop name</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.infoItem}>
          <ThemedText type="defaultSemiBold">2. Select</ThemedText>
          <ThemedText>Choose your stop from the results</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.infoItem}>
          <ThemedText type="defaultSemiBold">3. Track</ThemedText>
          <ThemedText>View real-time departure times</ThemedText>
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
