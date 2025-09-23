import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useState } from "react";
import { createGarbledText } from "../utils/crypto";

type NoteType = {
  title: string; // normal başlık (doğru şifre) veya şifreli başlık (yanlış şifre)
  content: string; // normal içerik (doğru şifre) veya şifreli içerik (yanlış şifre)
  images?: string[]; // normal resimler (doğru şifre) veya şifreli resimler (yanlış şifre)
  coverImage?: string; // normal kapak (doğru şifre) veya şifreli kapak (yanlış şifre)
  imageCount?: number; // resim sayısı
};

type StoredNoteType = {
  title: string; // her zaman düz metin olarak saklanır
  content: string; // her zaman düz metin olarak saklanır
  images?: string[]; // her zaman düz metin olarak saklanır
  coverImage?: string; // her zaman düz metin olarak saklanır
  imageCount?: number;
};

type NotesContextType = {
  notes: NoteType[];
  addNote: (
    title: string,
    text: string,
    imageUris?: string[],
    coverImageUri?: string
  ) => Promise<void>;
  editNote: (
    index: number,
    title: string,
    text: string,
    imageUris?: string[],
    coverImageUri?: string
  ) => Promise<void>;
  deleteNote: (index: number) => Promise<void>;
  loadNotesWithPassword: (
    sessionPassword: string,
    correctPassword: string
  ) => Promise<void>;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<NoteType[]>([]);

  const saveRawNotes = async (rawNotes: StoredNoteType[]) => {
    await AsyncStorage.setItem("plain_notes", JSON.stringify(rawNotes));
  };

  const loadRawNotes = async (): Promise<StoredNoteType[]> => {
    const stored = await AsyncStorage.getItem("plain_notes");
    return stored ? JSON.parse(stored) : [];
  };

  const loadNotesWithPassword = useCallback(
    async (sessionPassword: string, correctPassword: string) => {
      const rawNotes = await loadRawNotes();

      if (sessionPassword === correctPassword) {
        // Doğru şifre - notları direkt göster
        const displayNotes: NoteType[] = rawNotes.map((note) => ({
          title: note.title,
          content: note.content,
          images: note.images,
          coverImage: note.coverImage,
          imageCount: note.imageCount || (note.images?.length ?? 0),
        }));
        setNotes(displayNotes);
      } else {
        // Yanlış şifre - her seferinde farklı garbled text oluştur
        const garbledNotes: NoteType[] = [];
        for (const note of rawNotes) {
          try {
            const garbledTitle = await createGarbledText(
              note.title,
              sessionPassword
            );
            const garbledContent = await createGarbledText(
              note.content,
              sessionPassword
            );

            let garbledImages: string[] | undefined;
            if (note.images && note.images.length > 0) {
              garbledImages = [];
              for (const img of note.images) {
                const garbledImg = await createGarbledText(
                  img,
                  sessionPassword
                );
                garbledImages.push(garbledImg);
              }
            }

            let garbledCoverImage: string | undefined;
            if (note.coverImage) {
              garbledCoverImage = await createGarbledText(
                note.coverImage,
                sessionPassword
              );
            }

            garbledNotes.push({
              title: garbledTitle,
              content: garbledContent,
              images: garbledImages,
              coverImage: garbledCoverImage,
              imageCount: note.imageCount || 0,
            });
          } catch (err) {
            // Şifreleme hatası durumunda fallback
            garbledNotes.push({
              title: "⚠️ Şifreleme Hatası",
              content: "⚠️ Veri okunamadı",
              imageCount: note.imageCount || 0,
            });
          }
        }
        setNotes(garbledNotes);
      }
    },
    []
  );

  const addNote = useCallback(
    async (
      title: string,
      text: string,
      imageUris?: string[],
      coverImageUri?: string
    ) => {
      const rawNotes = await loadRawNotes();

      const newNote: StoredNoteType = {
        title,
        content: text,
        images: imageUris,
        coverImage: coverImageUri,
        imageCount: imageUris?.length || 0,
      };

      const updatedRawNotes = [...rawNotes, newNote];
      await saveRawNotes(updatedRawNotes);

      // Current notes'u da güncelle (doğru şifre varsayımıyla)
      const displayNote: NoteType = {
        title,
        content: text,
        images: imageUris,
        coverImage: coverImageUri,
        imageCount: imageUris?.length || 0,
      };
      setNotes((prevNotes) => [...prevNotes, displayNote]);
    },
    []
  );

  const editNote = useCallback(
    async (
      index: number,
      title: string,
      text: string,
      imageUris?: string[],
      coverImageUri?: string
    ) => {
      const rawNotes = await loadRawNotes();

      if (rawNotes[index]) {
        rawNotes[index] = {
          title,
          content: text,
          images: imageUris,
          coverImage: coverImageUri,
          imageCount: imageUris?.length || 0,
        };

        await saveRawNotes(rawNotes);

        // Current notes'u da güncelle
        setNotes((prevNotes) => {
          const updatedNotes = [...prevNotes];
          updatedNotes[index] = {
            title,
            content: text,
            images: imageUris,
            coverImage: coverImageUri,
            imageCount: imageUris?.length || 0,
          };
          return updatedNotes;
        });
      }
    },
    []
  );

  const deleteNote = useCallback(async (index: number) => {
    const rawNotes = await loadRawNotes();
    rawNotes.splice(index, 1);
    await saveRawNotes(rawNotes);

    setNotes((prevNotes) => {
      const updatedNotes = [...prevNotes];
      updatedNotes.splice(index, 1);
      return updatedNotes;
    });
  }, []);

  return (
    <NotesContext.Provider
      value={{ notes, addNote, editNote, deleteNote, loadNotesWithPassword }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within a NotesProvider");
  return context;
};
