import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootIncomingCallOverlay } from '@/components/root-incoming-call-overlay';
import { SplashScreenController } from '@/components/splash-screen-controller';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthProvider from '@/providers/auth-provider';
import StreamProvider from '@/providers/stream-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { isAuthenticated, isAuthBootstrapping, isProfileComplete } = useAuth();

  // Keep the native splash visible only during the initial auth bootstrap.
  // Intentionally NOT gated on `isLoading`, which also flips true for every
  // profile refetch — doing so would unmount the navigator (and therefore
  // the active call screen) mid-call, dropping the user from the room.
  if (isAuthBootstrapping) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated && isProfileComplete}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="rooms/[roomCode]" />
        <Stack.Screen name="modal" options={{ headerShown: true, presentation: 'modal', title: 'Modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && !isProfileComplete}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <StreamProvider>
              <SplashScreenController />
              <RootNavigator />
              <RootIncomingCallOverlay />
              <StatusBar style="light" />
            </StreamProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
