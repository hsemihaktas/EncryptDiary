import { Stack } from "expo-router";
import { NotesProvider } from "../context/NotesContext";

export default function RootLayout() {
  return (
    <NotesProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false , gestureEnabled: false}} />
        <Stack.Screen name="notes" options={{ headerShown: false , gestureEnabled: false}} />
        <Stack.Screen name="noteDetail" options={{headerShown: false, gestureEnabled: false }} />
      </Stack>
    </NotesProvider>
  );
}
