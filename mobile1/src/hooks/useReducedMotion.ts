/**
 * خطاف تفضيل تقليل الحركة — كل حركة زخرفية تتحقق منه.
 */

import { useEffect, useState } from "react";

import { subscribeReducedMotion } from "@/utils/accessibility";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => subscribeReducedMotion(setReduced), []);

  return reduced;
}
