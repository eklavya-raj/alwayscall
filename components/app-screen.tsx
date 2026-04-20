import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLACK = '#0A0A0A';

type AppScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function AppScreen({ children, style }: AppScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={[styles.root, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: BLACK,
    flex: 1,
  },
});
