/**
 * شاشة المشغّل الكامل — تُفتح من الشريط المصغّر (modal من الأسفل).
 * السطح داكن دائماً (هوية المشغّل) — يرسم نفسه في FullPlayer.
 */

import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FullPlayer } from "@/features/audio/FullPlayer";

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom, paddingTop: insets.top }}>
      <FullPlayer />
    </View>
  );
}
