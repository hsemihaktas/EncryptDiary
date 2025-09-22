import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { decryptNote } from "../utils/crypto";

type NoteType = {
  encTitle: string;
  encContent: string;
  encImages?: string[]; // şifrelenmiş resimler array'i
};

type NoteItemProps = {
  item: NoteType;
  index: number;
  password: string;
  openEditModal: (index: number, text: string) => void;
};

const NoteItem: React.FC<NoteItemProps> = ({
  item,
  index,
  password,
  openEditModal,
}) => {
  const [decryptedTitle, setDecryptedTitle] = useState<string>("");
  const [imageCount, setImageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Font.loadAsync({
          GreatVibes: require("../assets/fonts/GreatVibes-Regular.ttf"),
        });
        setFontLoaded(true);
      } catch (err) {
        console.error("Font load error:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const decrypt = async () => {
      try {
        const title = item.encTitle
          ? await decryptNote(item.encTitle, password)
          : "Başlık yok";
        setDecryptedTitle(title);

        // Resim sayısını belirle
        if (item.encImages && item.encImages.length > 0) {
          setImageCount(item.encImages.length);
        }
      } catch (err) {
        console.error("Decrypt error:", err, "Item:", item);
        setDecryptedTitle("🔒 Şifre çözülmedi");
      } finally {
        setLoading(false);
      }
    };
    decrypt();
  }, [item, password]);

  if (loading || !fontLoaded)
    return <ActivityIndicator style={{ marginVertical: 12 }} color="#000" />;

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => openEditModal(index, decryptedTitle)}
    >
      <ImageBackground
        source={require("../assets/images/cover_texture.png")}
        style={styles.card}
        imageStyle={styles.cardİmage}
      >
        <View style={styles.overlay} />
        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={2}>
            {decryptedTitle}
          </Text>
        </View>
        {imageCount > 0 && (
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>📷</Text>
            {imageCount > 1 && (
              <Text style={styles.imageCountText}>{imageCount}</Text>
            )}
          </View>
        )}
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 6,
    marginVertical: 8,
  },
  card: {
    width: 180,
    height: 290, // biraz daha dikey
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  cardİmage: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
  },
  titleWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "GreatVibes",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textTransform: "capitalize",
  },
  imageIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 15,
    minWidth: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 6,
  },
  imageIndicatorText: {
    fontSize: 16,
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 2,
    color: "#333",
  },
});

export default NoteItem;
