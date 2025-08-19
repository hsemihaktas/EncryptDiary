import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>This screen does not exist.</Text>
      <Button title="Go to home screen" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
});
