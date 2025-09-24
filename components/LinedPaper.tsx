// components/LinedPaper.tsx
import React, { useState } from "react";
import { StyleSheet as RNStyleSheet, View } from "react-native";

const LINE_HEIGHT = 28; // satır aralığı

export default function LinedPaper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [h, setH] = useState(0);
  const lineCount = Math.ceil(h / LINE_HEIGHT) + 1;

  return (
    <View
      style={styles.paper}
      onLayout={(e) => setH(e.nativeEvent.layout.height)}
    >
      {/* Çizgiler (interaction'ı engellemesin diye pointerEvents=none) */}
      <View style={RNStyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: lineCount }).map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: i * LINE_HEIGHT,
              left: 0,
              right: 0,
              borderBottomWidth: RNStyleSheet.hairlineWidth,
              borderBottomColor: "#d7d7d7",
            }}
          />
        ))}

        {/* Sol kırmızı margin çizgisi */}
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 24,
            width: 2,
            backgroundColor: "rgba(255, 0, 0, 0.35)",
          }}
        />
      </View>

      {children}
    </View>
  );
}

const styles = RNStyleSheet.create({
  paper: {
    flex: 1,
    backgroundColor: "#fffef7",
  },
});
