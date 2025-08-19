import { decode as atob, encode as btoa } from "base-64";
import * as Crypto from "expo-crypto";

/**
 * Notu şifreler.
 * Kullanıcının şifresini SHA-256 hashleyip ilk 5 karakterini ekliyoruz.
 */
export const encryptNote = async (note: string, password: string) => {
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  // not + hash’in ilk 5 karakteri
  return btoa(note + key.slice(0, 5));
};

/**
 * Notu çözmeye çalışır.
 * Doğru şifre girildiyse anlamlı text gelir.
 * Yanlış şifre girildiyse “çözülemeyen garip string” döner.
 */
export const decryptNote = async (
  encryptedNote: string,
  password: string
): Promise<string> => {
  try {
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    const decoded = atob(encryptedNote);

    if (decoded.endsWith(key.slice(0, 5))) {
      // Doğru şifre
      return decoded.replace(key.slice(0, 5), "");
    }

    // Yanlış şifre → decoded + password karakterlerini birleştirip shuffle
    const combined = [...decoded.split(""), ...password.split("")];

    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    // Orijinal mesaj uzunluğunda döndür
    return combined.slice(0, decoded.length).join("");
  } catch (e) {
    return "⚠️ Decrypt Error";
  }
};


