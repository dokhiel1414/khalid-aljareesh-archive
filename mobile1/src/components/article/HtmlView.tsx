/**
 * عارض HTML أصلي (بدون WebView) — يحوّل HTML مقالات tiptap إلى مكونات RN:
 * فقرات، عناوين، قوائم (مرقمة/منقطة)، اقتباسات، روابط، تنسيقات، أسطر، صور.
 * تصميم قراءة عربية مريح: سطر طويل كريم، حجم خط قابل للضبط، RTL كامل،
 * وحدود منطقية (start/end) صحيحة في الاتجاهين.
 */

import { useMemo, useState, type ReactNode } from "react";
import { parseDocument } from "htmlparser2";
import type { ChildNode, Element, Text as DomText } from "domhandler";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image as ExpoImage } from "expo-image";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing } from "@/theme/tokens";
import { toArabicDigits } from "@/utils/format";

interface HtmlViewProps {
  html: string;
  /** حجم الخط الأساس بالمضاعفات (من إعدادات القراءة). */
  fontScale?: number;
}

export function HtmlView({ html, fontScale = 1 }: HtmlViewProps) {
  const { colors } = useTheme();
  const nodes = useMemo(() => {
    try {
      return parseDocument(html).children;
    } catch {
      return [];
    }
  }, [html]);

  const styles = useMemo(() => buildStyles(colors, fontScale), [colors, fontScale]);

  return (
    <View style={styles.root} testID="article-body">
      {nodes.map((node, i) => (
        <BlockNode key={i} node={node} styles={styles} index={i} />
      ))}
    </View>
  );
}

// ─── أنماط ──────────────────────────────────────────────────────────────────
interface HtmlStyles {
  root: object;
  paragraph: object;
  heading1: object;
  heading2: object;
  heading3: object;
  heading4: object;
  quote: object;
  quoteText: object;
  list: object;
  listItem: object;
  marker: object;
  link: object;
  imageWrap: object;
}

function buildStyles(colors: ReturnType<typeof useTheme>["colors"], scale: number) {
  const base = 17 * scale;
  const line = Math.round(base * 1.95);
  return StyleSheet.create({
    root: { paddingHorizontal: spacing.xl },
    paragraph: {
      fontFamily: fonts.article,
      fontSize: base,
      lineHeight: line,
      color: colors.textPrimary,
      textAlign: "right",
      writingDirection: "rtl",
      marginBottom: spacing.lg,
    },
    heading1: { fontFamily: fonts.serifBold, fontSize: 24 * scale, lineHeight: 34 * scale, color: colors.textPrimary, textAlign: "right", writingDirection: "rtl", marginBottom: spacing.md, marginTop: spacing.sm },
    heading2: { fontFamily: fonts.serifBold, fontSize: 21 * scale, lineHeight: 30 * scale, color: colors.textPrimary, textAlign: "right", writingDirection: "rtl", marginBottom: spacing.md, marginTop: spacing.sm },
    heading3: { fontFamily: fonts.serifMedium, fontSize: 19 * scale, lineHeight: 28 * scale, color: colors.textPrimary, textAlign: "right", writingDirection: "rtl", marginBottom: spacing.md, marginTop: spacing.sm },
    heading4: { fontFamily: fonts.serifMedium, fontSize: 18 * scale, lineHeight: 26 * scale, color: colors.textSecondary, textAlign: "right", writingDirection: "rtl", marginBottom: spacing.md, marginTop: spacing.sm },
    quote: {
      borderStartWidth: 3,
      borderStartColor: colors.accent,
      paddingStart: spacing.lg,
      marginBottom: spacing.lg,
      marginTop: spacing.xs,
    },
    quoteText: { color: colors.textSecondary, fontStyle: undefined },
    list: { marginBottom: spacing.lg, paddingStart: spacing.xs },
    listItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.sm },
    marker: { fontFamily: fonts.article, fontSize: base, lineHeight: line, color: colors.accentStrong, marginEnd: spacing.sm, minWidth: 24, textAlign: "right" },
    link: { color: colors.accentStrong, textDecorationLine: "underline" },
    imageWrap: { borderRadius: radii.md, overflow: "hidden", marginBottom: spacing.lg },
  });
}

// ─── عقدة كتلة ──────────────────────────────────────────────────────────────
function BlockNode({ node, styles, index }: { node: ChildNode; styles: HtmlStyles; index: number }) {
  if (node.type === "text") return null;

  const el = node as Element;
  const children = el.children ?? [];

  switch (el.name) {
    case "p":
      return (
        <Text style={styles.paragraph}>
          <InlineNodes nodes={children} styles={styles} />
        </Text>
      );
    case "h1":
      return (
        <Text style={styles.heading1}>
          <InlineNodes nodes={children} styles={styles} />
        </Text>
      );
    case "h2":
      return (
        <Text style={styles.heading2}>
          <InlineNodes nodes={children} styles={styles} />
        </Text>
      );
    case "h3":
      return (
        <Text style={styles.heading3}>
          <InlineNodes nodes={children} styles={styles} />
        </Text>
      );
    case "h4":
    case "h5":
    case "h6":
      return (
        <Text style={styles.heading4}>
          <InlineNodes nodes={children} styles={styles} />
        </Text>
      );
    case "blockquote":
      return (
        <View style={styles.quote}>
          <Text style={[styles.paragraph, styles.quoteText, { marginBottom: 0 }]}>
            <InlineNodes nodes={children} styles={styles} />
          </Text>
        </View>
      );
    case "ul":
      return (
        <View style={styles.list}>
          {children.map((li, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.marker}>•</Text>
              <Text style={[styles.paragraph, { flex: 1, marginBottom: 0 }]}>
                <InlineNodes nodes={(li as Element).children ?? []} styles={styles} />
              </Text>
            </View>
          ))}
        </View>
      );
    case "ol":
      return (
        <View style={styles.list}>
          {children.map((li, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.marker}>{toArabicDigits(i + 1)}.</Text>
              <Text style={[styles.paragraph, { flex: 1, marginBottom: 0 }]}>
                <InlineNodes nodes={(li as Element).children ?? []} styles={styles} />
              </Text>
            </View>
          ))}
        </View>
      );
    case "img": {
      const src = el.attribs?.src;
      if (!src) return null;
      return <ArticleImage uri={src} styles={styles} />;
    }
    case "br":
      return <Text style={styles.paragraph}>{"\n"}</Text>;
    default:
      // أي عقدة غير معروفة (div, section, table...) — اعرض محتواها كفقرات.
      return (
        <>
          {children.map((child, i) => (
            <BlockNode key={i} node={child} styles={styles} index={index * 100 + i} />
          ))}
        </>
      );
  }
}

/** صورة مقال — عرض كامل مع نسبة أبعاد مقيسة تلقائياً. */
function ArticleImage({ uri, styles }: { uri: string; styles: HtmlStyles }) {
  const { width } = useWindowDimensions();
  const [aspect, setAspect] = useState(4 / 3);
  const containerWidth = width - spacing.xl * 2;

  return (
    <View style={styles.imageWrap}>
      <ExpoImage
        source={{ uri }}
        contentFit="cover"
        onLoad={(e) => {
          const h = (e as unknown as { source?: { height?: number; width?: number } }).source;
          if (h?.height && h.width) setAspect(h.width / h.height);
        }}
        style={{ width: containerWidth, aspectRatio: aspect }}
        accessibilityLabel="صورة داخل المقال"
        cachePolicy="memory-disk"
      />
    </View>
  );
}

// ─── عقد داخلية (سطرية) ─────────────────────────────────────────────────────
function InlineNodes({ nodes, styles }: { nodes: ChildNode[]; styles: HtmlStyles }) {
  const out: ReactNode[] = [];
  const pushText = (text: string, keyPrefix: string) => {
    if (text) out.push(<Text key={keyPrefix}>{text}</Text>);
  };

  let textBuffer = "";
  nodes.forEach((node, i) => {
    if (node.type === "text") {
      textBuffer += (node as DomText).data ?? "";
      return;
    }
    pushText(textBuffer, `t${i}`);
    textBuffer = "";
    const el = node as Element;
    const childNodes = el.children ?? [];

    switch (el.name) {
      case "strong":
      case "b":
        out.push(
          <Text key={i} style={{ fontFamily: fonts.serifBold, fontWeight: "700" }}>
            <InlineNodes nodes={childNodes} styles={styles} />
          </Text>,
        );
        break;
      case "em":
      case "i":
        out.push(
          <Text key={i} style={{ fontStyle: "italic" }}>
            <InlineNodes nodes={childNodes} styles={styles} />
          </Text>,
        );
        break;
      case "a": {
        const href = el.attribs?.href;
        out.push(
          <Pressable
            key={i}
            onPress={() => {
              if (href && /^https?:/.test(href)) void Linking.openURL(href);
            }}
            accessibilityRole="link"
            accessibilityLabel={el.attribs?.title ?? undefined}
          >
            <Text style={styles.link}>
              <InlineNodes nodes={childNodes} styles={styles} />
            </Text>
          </Pressable>,
        );
        break;
      }
      case "br":
        out.push(<Text key={i}>{"\n"}</Text>);
        break;
      case "u":
      case "s":
        out.push(
          <Text key={i} style={{ textDecorationLine: el.name === "u" ? "underline" : "line-through" }}>
            <InlineNodes nodes={childNodes} styles={styles} />
          </Text>,
        );
        break;
      default:
        out.push(<InlineNodes key={i} nodes={childNodes} styles={styles} />);
    }
  });
  pushText(textBuffer, "tail");

  return <>{out}</>;
}
