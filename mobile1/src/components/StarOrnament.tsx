/**
 * نجمة إسلامية ثمانية — الزخرفة الهادئة المتكررة للهوية (مقتبسة من الموقع).
 * SVG خالص، مخفية عن شجرة إمكانية الوصول (زخرفة فقط).
 */

import Svg, { Path } from "react-native-svg";

import { rawColors } from "@/theme/tokens";

interface StarOrnamentProps {
  size?: number;
  color?: string;
  opacity?: number;
}

/** نجمة ثمانية مبنية من مربعين متداخلين — رسم هندسي إسلامي بسيط ورصين. */
export function StarOrnament({
  size = 24,
  color = rawColors.gold,
  opacity = 1,
}: StarOrnamentProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* مربع مستقيم */}
      <Path
        d="M24 6 L42 24 L24 42 L6 24 Z"
        fill={color}
        opacity={opacity * 0.35}
      />
      {/* مربع مائل 45° */}
      <Path
        d="M24 11.3 L36.7 24 L24 36.7 L11.3 24 Z"
        fill={color}
        opacity={opacity}
        transform="rotate(45 24 24)"
      />
      {/* نقطة مركزية */}
      <Path d="M24 20.2 a3.8 3.8 0 1 0 0.01 0 Z" fill={color} opacity={opacity} />
    </Svg>
  );
}

/** زخرفة بسيطة بثمانية أذرع (للفواصل والخلفيات). */
export function StarBurst({
  size = 20,
  color = rawColors.gold,
  opacity = 0.5,
}: StarOrnamentProps) {
  const r = size / 2;
  const points: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * i) / 4;
    const x = r + r * 0.92 * Math.cos(angle);
    const y = r + r * 0.92 * Math.sin(angle);
    points.push(`${i % 2 === 0 ? x : x * 0.62},${i % 2 === 0 ? y : y * 0.62}`);
  }
  const polygon = points.map((p, i) => `${i === 0 ? "M" : "L"}${p}`).join(" ") + " Z";

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d={polygon} fill={color} opacity={opacity} />
    </Svg>
  );
}
