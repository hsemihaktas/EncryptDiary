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
  encCoverImage?: string; // şifrelenmiş kapak fotoğrafı
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
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
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
      setCoverImageUri(null);
      setImageCount(0);
      
      try {
        const title = item.encTitle
          ? await decryptNote(item.encTitle, password)
          : "Başlık yok";
        setDecryptedTitle(title);

        // Kapak fotoğrafını çöz
        if (item.encCoverImage) {
          try {
            const coverUri = await decryptNote(item.encCoverImage, password);
            setCoverImageUri(coverUri);
          } catch (err) {
            setCoverImageUri(null);
          }
        } else {
          setCoverImageUri(null);
        }

        // Resim sayısını belirle
        if (item.encImages && item.encImages.length > 0) {
          setImageCount(item.encImages.length);
        }
      } catch (err) {
        setDecryptedTitle("🔒 Şifre çözülmedi");
        setCoverImageUri(null);
        setImageCount(0);
      } finally {
        setLoading(false);
      }
    };
    decrypt();
  }, [item, password]);

  if (loading || !fontLoaded)
    return <ActivityIndicator style={{ marginVertical: 12 }} color="#000" />;

  // URI validation fonksiyonu
  const isValidUri = (uri: string | null): boolean => {
    if (!uri || uri.trim() === "") return false;
    
    // URI format kontrolü - gerçek URI mi yoksa garbled text mi?
    const uriPattern = /^(file:\/\/|content:\/\/|https?:\/\/)/;
    const isValidFormat = uriPattern.test(uri);
    
    // Garbled text kontrolü - çok fazla özel karakter varsa geçersiz
    const specialCharCount = (uri.match(/[^a-zA-Z0-9._\-\/:#]/g) || []).length;
    const isNotGarbled = specialCharCount < uri.length * 0.3;
    
    return isValidFormat && isNotGarbled;
  };

  const shouldUseDefaultCover = !coverImageUri || !isValidUri(coverImageUri);

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => openEditModal(index, decryptedTitle)}
    >
      <ImageBackground
        source={
          shouldUseDefaultCover
            ? require("../assets/images/cover_texture.png")
            : { uri: coverImageUri! }
        }
        style={styles.card}
        imageStyle={[
          styles.cardİmage,
          shouldUseDefaultCover
            ? { resizeMode: "stretch" }
            : { resizeMode: "cover" }
        ]}
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
