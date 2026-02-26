import { Image } from 'expo-image';
import { StyleSheet, View, Pressable } from 'react-native';
 
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Ontime</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Your companion for public transit in the Czech Republic.
        </ThemedText>
        <ThemedText style={styles.description}>
          Track when your bus, metro, or tram is leaving. 
          Never miss your ride again with real-time departure information.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <Pressable 
          style={styles.startButton}
          onPress={() => router.push('/screens/explore')}
        >
          <ThemedText style={styles.startButtonText}>Start</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.featuresContainer}>
        <ThemedText type="title" style={styles.featuresTitle}>Features</ThemedText>
        
        <ThemedView style={styles.featureItem}>
          <ThemedText type="defaultSemiBold">🚌 Bus Tracking</ThemedText>
          <ThemedText>Real-time bus departure times</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.featureItem}>
          <ThemedText type="defaultSemiBold">🚇 Metro Info</ThemedText>
          <ThemedText>Metro schedules at your fingertips</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.featureItem}>
          <ThemedText type="defaultSemiBold">🚊 Tram Updates</ThemedText>
          <ThemedText>Track tram arrivals instantly</ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
    
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeContainer: {
    padding: 20,
    gap: 12,
  },
  subtitle: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  startButton: {
    backgroundColor: '#0a84ff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresContainer: {
    padding: 20,
    gap: 16,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  featureItem: {
    gap: 4,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
