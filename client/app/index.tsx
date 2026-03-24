import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isLogged, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  // Not logged in → show welcome
  if (!isLogged) {
    return <Redirect href="/main/screens/welcome" />;
  }

  // Logged in → go to main app
  return <Redirect href="/main/screens" />;
}
