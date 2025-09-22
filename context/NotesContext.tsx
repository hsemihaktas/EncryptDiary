import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { encryptNote } from "../utils/crypto";

type NoteType = {
  encTitle: string; // şifrelenmiş başlık
  encContent: string; // şifrelenmiş içerik
  encImages?: string[]; // şifrelenmiş resimler array'i (base64)
};

type NotesContextType = {
  notes: NoteType[];
  addNote: (
    title: string,
    text: string,
    password: string,
    imageUris?: string[]
  ) => Promise<void>;
  editNote: (
    index: number,
    title: string,
    text: string,
    password: string,
    imageUris?: string[]
  ) => Promise<void>;
  deleteNote: (index: number) => Promise<void>;
  reloadNotes: () => Promise<void>;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<NoteType[]>([]);

  const loadNotes = async () => {
    const stored = await AsyncStorage.getItem("SECURE_NOTES");
    if (stored) setNotes(JSON.parse(stored));
  };

  const saveNotes = async (newNotes: NoteType[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem("SECURE_NOTES", JSON.stringify(newNotes));
  };

  const addNote = async (
    title: string,
    text: string,
    password: string,
    imageUris?: string[]
  ) => {
    const encTitle = await encryptNote(title, password);
    const encContent = await encryptNote(text, password);

    let encImages: string[] | undefined;
    if (imageUris && imageUris.length > 0) {
      encImages = [];
      for (const imageUri of imageUris) {
        const encImage = await encryptNote(imageUri, password);
        encImages.push(encImage);
      }
    }

    const newNote: NoteType = { encTitle, encContent, encImages };
    await saveNotes([...notes, newNote]);
  };

  const editNote = async (
    index: number,
    title: string,
    text: string,
    password: string,
    imageUris?: string[]
  ) => {
    const encTitle = await encryptNote(title, password);
    const encContent = await encryptNote(text, password);

    let encImages: string[] | undefined;
    if (imageUris && imageUris.length > 0) {
      encImages = [];
      for (const imageUri of imageUris) {
        const encImage = await encryptNote(imageUri, password);
        encImages.push(encImage);
      }
    }

    const updated = [...notes];
    updated[index] = { encTitle, encContent, encImages };
    await saveNotes(updated);
  };

  const deleteNote = async (index: number) => {
    const newNotes = [...notes];
    newNotes.splice(index, 1);
    setNotes(newNotes);
    await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
  };

  const reloadNotes = async () => {
    const stored = await AsyncStorage.getItem("SECURE_NOTES");
    if (stored) setNotes(JSON.parse(stored));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <NotesContext.Provider
      value={{ notes, addNote, editNote, deleteNote, reloadNotes }}
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
