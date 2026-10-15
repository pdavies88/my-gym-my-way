import {
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/archivo';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors, DisplayFont } from '@/constants/theme';
import { SettingsProvider } from '@/context/settings-context';
import { TrainingProvider } from '@/context/training-context';

SplashScreen.preventAutoHideAsync();

const colors = Colors.dark;

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.tint,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  // Fonts load at runtime (rather than via the expo-font config plugin) so the app also works in Expo Go.
  const [fontsLoaded, fontError] = useFonts({ Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // The native splash stays up until fonts are ready, so nothing shows in the fallback font.
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider value={navigationTheme}>
        <SettingsProvider>
          <TrainingProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShadowVisible: false,
                headerTintColor: colors.tint,
                headerTitleStyle: { fontFamily: DisplayFont.semiBold, color: colors.text },
                headerBackButtonDisplayMode: 'minimal',
                contentStyle: { backgroundColor: colors.background },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="exercise/[id]" options={{ title: '' }} />
              <Stack.Screen name="workout/[id]" options={{ title: '' }} />
              <Stack.Screen name="log/[id]" options={{ title: '' }} />
              <Stack.Screen name="equipment" options={{ title: 'Your equipment' }} />
              <Stack.Screen name="generate" options={{ title: 'Generate', presentation: 'modal' }} />
              <Stack.Screen name="builder" options={{ title: 'Build a workout', presentation: 'modal' }} />
              <Stack.Screen name="session" options={{ title: '', gestureEnabled: false, headerBackVisible: false }} />
            </Stack>
          </TrainingProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
