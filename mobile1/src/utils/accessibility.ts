/**
 * أدوات إمكانية الوصول — تفضيل تقليل الحركة (يُحترم في كل الحركات).
 */

import { AccessibilityInfo } from "react-native";

/** تفضيل النظام لتقليل الحركة (يُحدّث عند تغيّره). */
export function subscribeReducedMotion(cb: (reduced: boolean) => void): () => void {
  const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", cb);
  AccessibilityInfo.isReduceMotionEnabled().then(cb).catch(() => {});
  return () => sub.remove();
}

/** قراءة التفضيل مرة واحدة. */
export function isReducedMotionEnabled(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
}
