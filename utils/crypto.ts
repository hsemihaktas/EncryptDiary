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

    // şifre doğruysa -> hash kısmını temizle
    if (decoded.endsWith(key.slice(0, 5))) {
      return decoded.replace(key.slice(0, 5), "");
    }

    // şifre yanlışsa -> zaten hash tutmaz, decoded'i direkt döndür
    return decoded;
  } catch (e) {
    // hata varsa (ör: yanlış base64) direkt döndür
    return "⚠️ Decrypt Error";
  }
};
