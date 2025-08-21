import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import ModalAddNote from "../components/ModalAddNote";
import NoteItem from "../components/NoteItem";
import { useNotes } from "../context/NotesContext";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const SIDE_PADDING = 20;
const CARD_MARGIN = 12;

export default function NotesScreen() {
  const { notes, addNote } = useNotes();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [storedPassword, setStoredPassword] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadPasswords = async () => {
      const stored = await AsyncStorage.getItem("user_password"); // kullanıcı şifresi
      const session = await AsyncStorage.getItem("current_session_password"); // oturum şifresi
      setStoredPassword(stored);
      setSessionPassword(session);
    };
    loadPasswords();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("current_session_password");
    router.replace("/");
  };

  const handleAddNote = async (title: string, text: string) => {
    if (!sessionPassword) return;
    await addNote(title, text, sessionPassword);
    setModalVisible(false);
  };

  const renderItem = ({ item, index }: any) => {
    const cardWidth =
      (width - SIDE_PADDING * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

    return (
      <View
        style={[
          styles.cardWrapper,
          { width: cardWidth, backgroundColor: isDark ? "#1E1E1E" : "#fff" },
        ]}
      >
        <NoteItem
          item={item}
          index={index}
          password={sessionPassword!}
          openEditModal={(i) =>
            router.push({
              pathname: "/noteDetail",
              params: { index: i.toString() },
            })
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f5f5f5" }]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: isDark ? "#fff" : "#333" }]}>
          Notlarım
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={28} color="red" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{
          paddingBottom: 80,
          paddingHorizontal: SIDE_PADDING,
        }}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: CARD_MARGIN,
        }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{
              color: isDark ? "#fff" : "#555",
              textAlign: "center",
              marginTop: 40,
              fontSize: 16,
            }}
          >
            Henüz not yok.
          </Text>
        }
      />

      {/* Sağ alt + butonu sadece şifreler aynıysa */}
      {sessionPassword && storedPassword && sessionPassword === storedPassword && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: "#007bff", shadowColor: isDark ? "#000" : "#aaa" }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add Note Modal */}
      <ModalAddNote
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
    marginHorizontal: SIDE_PADDING,
  },
  header: { fontSize: 28, fontWeight: "bold" },
  logoutButton: { padding: 5 },
  cardWrapper: {
    borderRadius: 16,
    padding: 12,
    minHeight: 140,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
