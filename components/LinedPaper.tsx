// components/LinedPaper.tsx
import React from "react";
import { StyleSheet as RNStyleSheet, View } from "react-native";

export default function LinedPaper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.paper}>
      {/* Sol kırmızı margin çizgisi */}
      <View style={RNStyleSheet.absoluteFill} pointerEvents="none">
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
