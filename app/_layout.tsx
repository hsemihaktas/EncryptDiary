import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { NotesProvider } from "../context/NotesContext";
import { ThemeProvider } from "../context/ThemeContext";

// Splash screen'i uygulama hazır olana kadar göster
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // El yazısı fontları
    "Caveat-Regular": require("../assets/fonts/Caveat-Regular.ttf"),
    "DancingScript-Regular": require("../assets/fonts/DancingScript-Regular.ttf"),
    GreatVibes: require("../assets/fonts/GreatVibes-Regular.ttf"),

    // Modern fontlar
    "Nunito-Regular": require("../assets/fonts/Nunito-Regular.ttf"),
    "Lora-Regular": require("../assets/fonts/Lora-Regular.ttf"),

    // Özel fontlar
    "Pacifico-Regular": require("../assets/fonts/Pacifico-Regular.ttf"),
    "CourierPrime-Regular": require("../assets/fonts/CourierPrime-Regular.ttf"),
    "CrimsonText-Regular": require("../assets/fonts/CrimsonText-Regular.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <NotesProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="notes"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="noteDetail"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="settings"
            options={{ headerShown: false, gestureEnabled: false }}
          />
        </Stack>
      </NotesProvider>
    </ThemeProvider>
  );
}
