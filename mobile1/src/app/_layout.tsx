/**
 * التخطيط الجذر — ترتيب بدء التشغيل:
 * 1) خطوط الهوية (ThmanyahSerif + TradArabicMorph)
 * 2) استعادة كاش الاستعلامات الدائم (بيانات محفوظة تظهر فوراً دون شبكة)
 * 3) ثم المزودون: الإيماءات، المناطق الآمنة، TanStack Query، المظهر
 * 4) تهيئة المحرك الصوتي (وضع صوت خلفي + شاشة قفل) مرة واحدة
 */

import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { fonts } from "@/theme/tokens";
import { queryClient, queryPersister } from "@/api/queryClient";
import { initAudioEngine } from "@/services/audioEngine";

void SplashScreen.preventAutoHideAsync().catch(() => {});

/** أسماء الخطوط = مفاتيح الرموز في tokens (تطابق تام). */
const FONT_SOURCES: Record<string, number> = {
  [fonts.serifLight]: require("../../assets/fonts/thmanyahserifdisplay-Light.otf"),
  [fonts.serifRegular]: require("../../assets/fonts/thmanyahserifdisplay-Regular.otf"),
  [fonts.serifMedium]: require("../../assets/fonts/thmanyahserifdisplay-Medium.otf"),
  [fonts.serifBold]: require("../../assets/fonts/thmanyahserifdisplay-Bold.otf"),
  [fonts.serifBlack]: require("../../assets/fonts/thmanyahserifdisplay-Black.otf"),
  [fonts.article]: require("../../assets/fonts/traditional-arabic-morph.ttf"),
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_SOURCES);
  const [cacheReady, setCacheReady] = useState(false);

  // استعادة الكاش الدائم قبل أول رسم — وإلا قد تومض الشاشات فارغة.
  useEffect(() => {
    // persistQueryClient يُعيد [إلغاء الاشتراك، وعد الإكمال].
    const [unsubscribe, hydrated] = persistQueryClient({
      queryClient,
      persister: queryPersister,
      maxAge: 24 * 60 * 60 * 1000,
      buster: "v1",
    });
    hydrated.then(() => setCacheReady(true));
    return unsubscribe;
  }, []);

  const ready = (fontsLoaded || !!fontError) && cacheReady;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <StackShell />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** الغلاف الداخلي — بعد ThemeProvider (يقرأ ألوان المظهر). */
function StackShell() {
  const { colors } = useTheme();

  // أزرار شريط النظام السفلية فاتحة (خلفية داكنة من إعداد التطبيق edge-to-edge).
  useEffect(() => {
    NavigationBar.setStyle("light");
  }, []);

  // تهيئة المحرك الصوتي (مرة واحدة في عمر التطبيق).
  useEffect(() => {
    initAudioEngine();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.headerText,
          headerTitleStyle: { fontFamily: fonts.serifMedium, fontSize: 17 },
          headerTitleAlign: "center",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="search" options={{ title: "البحث", headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: "" }} />
        <Stack.Screen name="topic/[slug]" options={{ title: "" }} />
        <Stack.Screen name="downloads" options={{ title: "التنزيلات" }} />
        <Stack.Screen name="favorites" options={{ title: "المفضلة" }} />
        <Stack.Screen name="history" options={{ title: "سجل الاستماع" }} />
        <Stack.Screen name="settings" options={{ title: "الإعدادات" }} />
        <Stack.Screen name="contact" options={{ title: "تواصل معنا" }} />
        <Stack.Screen name="groups" options={{ title: "المجموعات والقنوات" }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
