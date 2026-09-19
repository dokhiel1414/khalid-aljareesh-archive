/**
 * تواصل معنا — نموذج بسيط يرسل إلى POST /api/contact (نفس عقد الموقع).
 * حقل website: honeypot يُترك فارغاً دائماً (لصد البوتات مثل الموقع).
 */

import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { Check, Send } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";
import { Button } from "@/components/ui/Buttons";
import { postContact } from "@/api/endpoints";
import { confirm } from "@/utils/haptics";

type FormState = "idle" | "sending" | "sent" | "error";

export default function ContactScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorText, setErrorText] = useState("");

  const canSubmit = name.trim().length > 0 && message.trim().length > 0 && state !== "sending";

  const submit = async () => {
    if (!canSubmit) return;
    void confirm();
    setState("sending");
    setErrorText("");
    try {
      await postContact({
        name: name.trim(),
        email: email.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
        // honeypot — يبقى فارغاً دائماً (مثل الموقع).
        website: "",
      });
      setState("sent");
    } catch (error) {
      setState("error");
      setErrorText(
        error instanceof Error ? error.message : "تعذّر الإرسال — تحقق من اتصالك.",
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "تواصل معنا" }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {state === "sent" ? (
            <View style={styles.sentWrap} testID="contact-sent">
              <View style={[styles.sentIcon, { backgroundColor: colors.accent }]}>
                <Check size={30} color="#1F1205" />
              </View>
              <Text style={[styles.sentTitle, { color: colors.textPrimary }]}>
                وصلت رسالتك
              </Text>
              <Text style={[styles.sentHint, { color: colors.textMuted }]}>
                شكراً لتواصلك مع المكتبة — نطّلع على الرسالة في أقرب وقت.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.intro, { color: colors.textSecondary }]}>
                اقتراح، ملاحظة على مادة، أو استفسار — يسعدنا وصول رسالتك.
              </Text>

              <Field label="الاسم *">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="اسمك الكريم"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                  testID="contact-name"
                />
              </Field>
              <Field label="البريد الإلكتروني (اختياري)">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                  testID="contact-email"
                />
              </Field>
              <Field label="الموضوع (اختياري)">
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="موضوع الرسالة"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                  testID="contact-subject"
                />
              </Field>
              <Field label="الرسالة *">
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="اكتب رسالتك هنا…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={6}
                  style={[
                    styles.input,
                    styles.messageInput,
                    { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  textAlignVertical="top"
                  testID="contact-message"
                />
              </Field>

              {state === "error" ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errorText}</Text>
              ) : null}

              <View style={styles.submitWrap}>
                <Button
                  label={state === "sending" ? "جارٍ الإرسال…" : "إرسال الرسالة"}
                  icon={<Send size={17} color="#1F1205" />}
                  variant="gold"
                  onPress={() => void submit()}
                  disabled={!canSubmit}
                  testID="contact-submit"
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.giant,
  },
  intro: {
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md, gap: spacing.xs },
  fieldLabel: {
    fontFamily: fonts.serifMedium,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    fontFamily: fonts.serifRegular,
    fontSize: 15,
    lineHeight: 22,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: spacing.md,
    minHeight: touch.target,
    textAlign: "right",
    writingDirection: "rtl",
  },
  messageInput: {
    minHeight: 140,
    paddingTop: spacing.md,
  },
  errorText: {
    fontFamily: fonts.serifRegular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  submitWrap: {
    marginTop: spacing.sm,
  },
  sentWrap: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.giant,
    paddingHorizontal: spacing.xl,
  },
  sentIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  sentTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    lineHeight: 30,
  },
  sentHint: {
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
  },
});
