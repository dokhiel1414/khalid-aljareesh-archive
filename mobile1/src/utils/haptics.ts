/**
 * لمسات اهتزازية هادئة ومقصودة — تُعطّل تلقائياً مع تقليل الحركة
 * أو من إعدادات التطبيق. لا اهتزاز إلا للتغذية الراجعة الواضحة.
 */

import * as Haptics from "expo-haptics";

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

async function safe(fn: () => Promise<unknown>): Promise<void> {
  if (!enabled) return;
  try {
    await fn();
  } catch {
    // بعض الأجهزة لا تدعم الاهتزاز — تجاهل بهدوء.
  }
}

/** نقرة خفيفة: اختيار/تبديل. */
export function tap(): Promise<void> {
  return safe(() => Haptics.selectionAsync());
}

/** تأكيد فعل: تشغيل/تنزيل/مشاركة تمت. */
export function confirm(): Promise<void> {
  return safe(() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm));
}

/** خطأ لطيف. */
export function warn(): Promise<void> {
  return safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

/** امتداد شريط التمرير أثناء السحب. */
export function tick(): Promise<void> {
  return safe(() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick));
}
