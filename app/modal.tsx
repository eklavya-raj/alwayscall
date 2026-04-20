import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';

export default function ModalScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <ThemedText style={styles.title}>AlwaysCall</ThemedText>
        <ThemedText style={styles.subtitle}>This placeholder modal is ready for future production flows.</ThemedText>
        <Link href="/" dismissTo style={styles.link}>
          <ThemedText style={styles.linkText}>Back to App</ThemedText>
        </Link>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    backgroundColor: '#FDE047',
    borderRadius: 12,
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#A3A3A3',
    textAlign: 'center',
  },
  linkText: {
    color: '#0A0A0A',
    fontWeight: '800',
  },
});
