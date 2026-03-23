import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { TowerConfigProvider } from '@/contexts/TowerConfigContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TowerConfigProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="main" />
        </Stack>
      </TowerConfigProvider>
    </AuthProvider>
  );
}
