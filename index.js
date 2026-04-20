import 'expo-dev-client';
import 'react-native-gesture-handler';

import { initializeStreamPush } from './lib/stream-push';

initializeStreamPush();

import 'expo-router/entry';
