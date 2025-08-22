# 📝 Encrypt Dairy

Encrypt Dairy, kişisel notlarınızı **güvenli bir şekilde şifreleyerek** saklamanıza yarayan bir React Native uygulamasıdır.  
Tüm notlar `expo-crypto` ile şifrelenir ve cihazda yalnızca **şifrelenmiş** biçimde saklanır.  
Doğru anahtar girilmediği sürece notlara erişilemez.

---

## 🚀 Özellikler
- 🔒 Not ekleme, okuma ve silme
- 🔑 `expo-crypto` ile AES/SHA tabanlı şifreleme ve çözme
- 💾 `AsyncStorage` üzerinde güvenli veri saklama
- ❌ Yanlış şifre girildiğinde:
  - Notlar **çözümlenmeden (şifreli halde)** gösterilir
  - UI’daki butonlar devre dışı kalır (hiçbir işlem yapılamaz)
- 📱 Hafif ve kullanıcı dostu arayüz

---

## 📦 Kurulum

1. Repoyu klonla:
   ```bash
   git clone https://github.com/hsemihaktas/EncryptNotes.git
   cd EncryptNotes
   ```

2. Bağımlılıkları yükle:
   ```bash
   npm install
   # veya
   yarn install
   ```

3. Uygulamayı çalıştır:
   ```bash
   npx expo start
   ```

---

## ⚙️ Kullanım

1. Uygulamayı aç ve **master şifre** belirle.  
2. Yeni bir not ekle – not otomatik olarak **şifrelenmiş** şekilde kaydedilir.  
3. Doğru şifre girildiğinde notlar **çözümlenmiş** olarak görüntülenir.  
4. Yanlış şifre girersen:
   - Notlar çözümlenmez → şifreli hali görünür  
   - Butonlar devre dışı kalır → hiçbir işlem yapılamaz  

---

## 🛠️ Kullanılan Teknolojiler
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [expo-crypto](https://docs.expo.dev/versions/latest/sdk/crypto/)

---


