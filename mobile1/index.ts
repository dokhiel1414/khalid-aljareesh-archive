/**
 * نقطة دخول مخصصة — RTL حقيقي قبل تحميل أي شاشة.
 * التطبيق عربي بالكامل: I18nManager.forceRTL قبل استيراد expo-router
 * حتى تُبنى كل المكونات والتنقل باتجاه يمين-إلى-يسار حقيقي
 * (وليس مجرد textAlign في النصوص).
 */

import { I18nManager } from "react-native";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

import "expo-router/entry";
