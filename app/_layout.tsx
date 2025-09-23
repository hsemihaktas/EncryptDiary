import { Stack } from "expo-router";
import { NotesProvider } from "../context/NotesContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
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
