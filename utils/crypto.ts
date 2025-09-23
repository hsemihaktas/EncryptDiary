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
 * Rastgele garbled text oluşturur - sadece harfler, her çağrıda farklı sonuç
 */
export const createGarbledText = async (
  originalText: string,
  sessionPassword: string
) => {
  try {
    // Sadece harfler için alphabet
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Her seferinde farklı sonuç için çoklu randomness
    const timestamp = Date.now().toString();
    const randomSeed = Math.random().toString();
    const textLength = originalText.length.toString();

    // Unique seed oluştur
    const combinedSeed =
      sessionPassword + timestamp + randomSeed + textLength + Math.random();
    const hashSeed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combinedSeed
    );

    // Hash'ten numeric seed çıkar
    let numericSeed = 0;
    for (let i = 0; i < hashSeed.length; i++) {
      numericSeed += hashSeed.charCodeAt(i);
    }

    // Seeded random fonksiyonu (her çağrıda farklı olacak)
    let seed = numericSeed + Math.floor(Math.random() * 1000000);
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Orijinal text uzunluğu kadar (minimum 8 karakter) garbled text oluştur
    const targetLength = Math.max(originalText.length, 8);
    let garbledText = "";

    for (let i = 0; i < targetLength; i++) {
      // Her karakter için farklı randomness
      const randomIndex = Math.floor(seededRandom() * alphabet.length);
      const additionalRandom = Math.floor(Math.random() * alphabet.length);
      const finalIndex = (randomIndex + additionalRandom + i) % alphabet.length;
      garbledText += alphabet[finalIndex];
    }

    // Ekstra randomness ekle
    const extraRandom = Math.floor(Math.random() * 5) + 3; // 3-7 ekstra karakter
    for (let i = 0; i < extraRandom; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      garbledText += alphabet[randomIndex];
    }

    return garbledText;
  } catch (e) {
    // Fallback: pure random alfabetik string
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let fallbackText = "";
    const length =
      Math.max(originalText.length, 8) + Math.floor(Math.random() * 5);
    for (let i = 0; i < length; i++) {
      fallbackText += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return fallbackText;
  }
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
