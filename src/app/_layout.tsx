import { Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold, useFonts } from '@expo-google-fonts/archivo';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HeaderButton } from '@/components/header-button';
import { Colors, DisplayFont } from '@/constants/theme';
import { SettingsProvider } from '@/context/settings-context';
import { TrainingProvider } from '@/context/training-context';

SplashScreen.preventAutoHideAsync();

// Screens opened from a link get the tabs underneath, so there is always somewhere to go back to.
export const unstable_settings = { anchor: '(tabs)' };

const colors = Colors.dark;

const back = { headerLeft: () => <HeaderButton /> };
const close = { presentation: 'modal' as const, headerLeft: () => <HeaderButton variant="close" /> };

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
              <Stack.Screen name="exercise/[id]" options={{ title: '', ...back }} />
              <Stack.Screen name="workout/[id]" options={{ title: '', ...back }} />
              <Stack.Screen name="log/[id]" options={{ title: '', ...back }} />
              <Stack.Screen name="equipment" options={{ title: 'Your equipment', ...back }} />
              <Stack.Screen name="library" options={{ title: 'Exercise library', ...back }} />
              <Stack.Screen name="cardio/[id]" options={{ title: '', ...back }} />
              <Stack.Screen
                name="cardio-player/[id]"
                options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
              />
              <Stack.Screen name="generate" options={{ title: 'Generate', ...close }} />
              <Stack.Screen name="builder" options={{ title: 'Build a workout', ...close }} />
              <Stack.Screen name="session" options={{ title: '', gestureEnabled: false, headerBackVisible: false }} />
            </Stack>
          </TrainingProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
