/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const accent = '#FACC15';
const accentMuted = '#EAB308';
const cardLight = '#FFF8CC';
const cardDark = '#171717';

export const Colors = {
  light: {
    text: '#111111',
    background: '#FFFDE8',
    tint: accent,
    icon: '#4B5563',
    tabIconDefault: '#4B5563',
    tabIconSelected: accent,
    card: cardLight,
    border: '#E5D27A',
    muted: '#5B5B5B',
    accent,
    accentMuted,
    danger: '#B91C1C',
    success: '#15803D',
  },
  dark: {
    text: '#FAFAFA',
    background: '#090909',
    tint: accent,
    icon: '#A1A1AA',
    tabIconDefault: '#71717A',
    tabIconSelected: accent,
    card: cardDark,
    border: '#3F3F46',
    muted: '#A1A1AA',
    accent,
    accentMuted,
    danger: '#F87171',
    success: '#4ADE80',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
