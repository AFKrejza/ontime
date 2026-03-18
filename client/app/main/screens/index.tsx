import { Image } from 'expo-image';
import { StyleSheet, View, Pressable, TextInput, ScrollView } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { DarkTheme } from '@react-navigation/native';

// Color scheme: Gray, Red, White, Black
const colors = {
  primary: '#D32F2F',     
  secondary: '#616161',     
  background: '#FFFFFF',    
  surface: '#F5F5F5',      
  text: '#212121',         
  textSecondary: '#757575', 
  accent: '#BDBDBD',       
};

// Prague Metro Line Colors (since i dont want it to look confusing )
const metroLineColors: Record<string, string> = {
  'A': '#4CAF50',  // Green
  'B': '#FFEB3B',  // Yellow
  'C': '#F44336',  // Red
};

// Get color for a metro line
const getMetroLineColor = (line: string): string => {
  return metroLineColors[line] || colors.primary;
};

// Sample recent stops (will delete later)
const recentStops = [
  { id: '1', name: 'Nádraží Holešovice', type: 'metro', lines: ['C'], time: '3 min' },
  { id: '2', name: 'Můstek', type: 'metro', lines: ['A', 'B'], time: '5 min' },
];

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#212121', dark: '#000000' }}
      headerImage={
        <View style={styles.headerImageContainer}>
          <IconSymbol size={120} color="#ffffff" name="bus.fill" style={styles.headerIcon} />
        </View>
      }>
      
      {/* App Title */}
      <ThemedView style={styles.titleSection}>
        <ThemedText type="title" style={styles.appTitle}>OnTime</ThemedText>
        <ThemedText style={styles.appSubtitle}>Your real-time transit companion for Prague&apos;s public transport.</ThemedText>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <Pressable 
          style={styles.searchBar}
          onPress={() => router.push('/main/screens/explore')}
        >
          <IconSymbol size={20} color={colors.textSecondary} name="magnifyingglass" />
          <ThemedText style={styles.searchPlaceholder}>Search for stops...</ThemedText>
        </Pressable>
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.quickActionsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#EEEEEE' }]}>
              <IconSymbol size={24} color={colors.primary} name="location.fill" />
            </View>
            <ThemedText style={styles.actionText}>Nearby</ThemedText>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
              <IconSymbol size={24} color={colors.primary} name="star.fill" />
            </View>
            <ThemedText style={styles.actionText}>Favorites</ThemedText>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#ECEFF1' }]}>
              <IconSymbol size={24} color={colors.secondary} name="clock.fill" />
            </View>
            <ThemedText style={styles.actionText}>History</ThemedText>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
              <IconSymbol size={24} color={colors.primary} name="plus.circle.fill" />
            </View>
            <ThemedText style={styles.actionText}>Add Stop</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* Recent Stops */}
      <ThemedView style={styles.favoritesContainer}>
        <View style={styles.favoritesHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Stops</ThemedText>
          <Pressable onPress={() => router.push('/main/screens/explore')}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
          </Pressable>
        </View>
        
        {recentStops.map((stop) => (
          <Pressable key={stop.id} style={styles.favoriteItem}>
            <View style={styles.stopIconContainer}>
              <ThemedText style={styles.stopIcon}>
                {stop.type === 'metro' ? '🚇' : stop.type === 'tram' ? '🚊' : '🚌'}
              </ThemedText>
            </View>
            <View style={styles.stopDetails}>
              <ThemedText type="defaultSemiBold" style={styles.stopName}>{stop.name}</ThemedText>
              <View style={styles.linesContainer}>
                {stop.lines.map((line, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.lineBadge, 
                      { backgroundColor: stop.type === 'metro' ? getMetroLineColor(line) : '#E0E0E0' }
                    ]}
                  >
                    <ThemedText style={[
                      styles.lineText, 
                      stop.type === 'metro' && line === 'B' && styles.lineTextDark
                    ]}>
                      {line}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.arrivalContainer}>
              <ThemedText style={styles.arrivalTime}>{stop.time}</ThemedText>
              <ThemedText style={styles.arrivalLabel}>arriving</ThemedText>
            </View>
          </Pressable>
        ))}
      </ThemedView>

      {/* Upcoming Departures */}
      <ThemedView style={styles.departuresContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Upcoming Departures</ThemedText>
        
        <View style={styles.departureItem}>
          <View style={styles.departureRoute}>
            <View style={[styles.routeBadge, { backgroundColor: '#757575' }]}>
              <ThemedText style={styles.routeNumber}>136</ThemedText>
            </View>
            <ThemedText style={styles.routeDirection}>Jižní Město</ThemedText>
          </View>
          <View style={styles.departureTime}>
            <ThemedText style={styles.departureMinutes}>2</ThemedText>
            <ThemedText style={styles.departureUnit}>min</ThemedText>
          </View>
        </View>
        
        <View style={styles.departureItem}>
          <View style={styles.departureRoute}>
            <View style={[styles.routeBadge, { backgroundColor: '#757575' }]}>
              <ThemedText style={styles.routeNumber}>186</ThemedText>
            </View>
            <ThemedText style={styles.routeDirection}>Poliklinika Vysočany</ThemedText>
          </View>
          <View style={styles.departureTime}>
            <ThemedText style={styles.departureMinutes}>5</ThemedText>
            <ThemedText style={styles.departureUnit}>min</ThemedText>
          </View>
        </View>
        
        <View style={styles.departureItem}>
          <View style={styles.departureRoute}>
            <View style={[styles.routeBadge, { backgroundColor: getMetroLineColor('C') }]}>
              <ThemedText style={styles.routeNumber}>C</ThemedText>
            </View>
            <ThemedText style={styles.routeDirection}>Letňany</ThemedText>
          </View>
          <View style={styles.departureTime}>
            <ThemedText style={styles.departureMinutes}>8</ThemedText>
            <ThemedText style={styles.departureUnit}>min</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Get Started Button */}
      <ThemedView style={styles.buttonContainer}>
        <Pressable 
          style={styles.startButton}
          onPress={() => router.push('/main/screens/explore')}
        >
          <ThemedText style={styles.startButtonText}>Find Your Stop</ThemedText>
          <IconSymbol size={20} color="#ffffff" name="arrow.right" />
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    opacity: 0.2,
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchPlaceholder: {
    color: colors.textSecondary,
    fontSize: 16,
    flex: 1,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  favoritesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    fontSize: 24,
  },
  stopDetails: {
    flex: 1,
    marginLeft: 12,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  stopLines: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  lineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  lineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  lineTextDark: {
    color: '#333333',
  },
  arrivalContainer: {
    alignItems: 'flex-end',
  },
  arrivalTime: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  arrivalLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  departuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  departureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  departureRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  routeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  routeDirection: {
    fontSize: 14,
    color: colors.text,
  },
  departureTime: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  departureMinutes: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  departureUnit: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
