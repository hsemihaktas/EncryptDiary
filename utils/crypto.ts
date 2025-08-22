import { decode as atob, encode as btoa } from "base-64";
import * as Crypto from "expo-crypto";

// UTF-8 ile güvenli encode/decode
function encodeUtf8(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeUtf8(str: string) {
  return decodeURIComponent(escape(atob(str)));
}

/**
 * Notu şifreler.
 * Kullanıcının şifresini SHA-256 hashleyip ilk 5 karakterini ekliyoruz.
 */
export const encryptNote = async (note: string, password: string) => {
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return encodeUtf8(note + key.slice(0, 5)); // 🔥 burada artık UTF-8 güvenli
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
    const decoded = decodeUtf8(encryptedNote); // 🔥 burada da decodeUtf8

    if (decoded.endsWith(key.slice(0, 5))) {
      return decoded.replace(key.slice(0, 5), "");
    }

    // Yanlış şifre → random shuffle
    const combined = [...decoded.split(""), ...password.split("")];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined.slice(0, decoded.length).join("");
  } catch (e) {
    return "⚠️ Decrypt Error";
  }
};
