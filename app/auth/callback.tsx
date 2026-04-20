import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallbackScreen() {
  const { authError } = useAuth();

  return (
    <>
      <Stack.Screen options={{ title: 'Signing In', headerShown: false }} />
      <AppScreen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FDE047" />
          <ThemedText style={styles.title}>Finishing Sign In</ThemedText>
          <ThemedText style={styles.message}>
            {authError
              ? authError
              : 'Finishing passwordless authentication and restoring your session.'}
          </ThemedText>
        </View>
      </AppScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  message: {
    color: '#A3A3A3',
    textAlign: 'center',
  },
});
