/**
 * التنزيلات — الصوتيات المحفوظة للاستماع دون اتصال:
 * تقدم التنزيل، إلغاء، حذف، إعادة محاولة، وملخص مساحة التخزين.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { HardDrive, RotateCw, Trash2, X } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";
import { formatBytes, toArabicDigits } from "@/utils/format";
import { EmptyState } from "@/components/ui/States";
import { useDownloadsStore } from "@/store/downloadsStore";
import { availableDiskSpace, cancelDownload, deleteDownload, downloadsDiskUsage, startDownload } from "@/services/downloads";
import { fetchItem } from "@/api/endpoints";
import { confirm } from "@/utils/haptics";

export default function DownloadsScreen() {
  const { colors } = useTheme();
  const records = useDownloadsStore((s) => s.records);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    void downloadsDiskUsage().then(setUsage);
  }, [records]);

  const entries = useMemo(
    () =>
      Object.values(records).sort(
        (a, b) => (b.downloadedAt ?? 0) - (a.downloadedAt ?? 0),
      ),
    [records],
  );

  const retry = useCallback(async (id: string) => {
    void confirm();
    try {
      const { item } = await fetchItem(id);
      await startDownload({
        id: item.id,
        title: item.title,
        driveFileId: item.driveFileId,
        driveLink: item.driveLink,
      });
    } catch {
      // يبقى السجل كما هو (خطأ) — يمكن المحاولة لاحقاً.
    }
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "التنزيلات" }} />
      <View style={styles.flex}>
        {entries.length > 0 ? (
          <>
            <View style={[styles.storage, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.storageIcon}>
                <HardDrive size={18} color={colors.accentStrong} />
              </View>
              <Text style={[styles.storageText, { color: colors.textSecondary }]}>
                مساحة التنزيلات: {formatBytes(usage)} — المتاح على الجهاز:{" "}
                {formatBytes(availableDiskSpace())}
              </Text>
            </View>

            <View style={styles.list}>
              {entries.map((record) => (
                <View
                  key={record.id}
                  style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  testID={`download-row-${record.id}`}
                >
                  <View style={styles.rowTexts}>
                    <Text
                      numberOfLines={2}
                      style={[styles.rowTitle, { color: colors.textPrimary }]}
                    >
                      {record.title}
                    </Text>
                    <Text style={[styles.rowStatus, { color: colors.textMuted }]}>
                      {record.status === "downloading"
                        ? `جارٍ التنزيل ${toArabicDigits(Math.round(record.progress * 100))}٪`
                        : record.status === "done"
                          ? `محمّل — ${formatBytes(record.bytes)}`
                          : "تعذّر التنزيل"}
                    </Text>
                    {record.status === "downloading" ? (
                      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.round(record.progress * 100)}%`, backgroundColor: colors.accent },
                          ]}
                        />
                      </View>
                    ) : null}
                  </View>

                  {record.status === "downloading" ? (
                    <RowButton
                      icon={<X size={17} color={colors.textMuted} />}
                      label="إلغاء التنزيل"
                      onPress={() => void cancelDownload(record.id)}
                    />
                  ) : record.status === "error" ? (
                    <RowButton
                      icon={<RotateCw size={17} color={colors.accentStrong} />}
                      label="إعادة المحاولة"
                      onPress={() => void retry(record.id)}
                    />
                  ) : (
                    <RowButton
                      icon={<Trash2 size={17} color={colors.error} />}
                      label="حذف التنزيل"
                      onPress={() => {
                        void confirm();
                        void deleteDownload(record.id);
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <EmptyState
            title="لا توجد تنزيلات"
            hint="حمّل الصوتيات من شاشة المادة أو المشغل للاستماع دون اتصال."
          />
        )}
      </View>
    </>
  );
}

function RowButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.rowButton, pressed && { opacity: 0.6 }]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  storage: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  storageIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  storageText: {
    flex: 1,
    fontFamily: fonts.serifRegular,
    fontSize: 12.5,
    lineHeight: 19,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    minHeight: touch.target + 24,
  },
  rowTexts: { flex: 1, gap: 3 },
  rowTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 14,
    lineHeight: 21,
  },
  rowStatus: {
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: { height: 3 },
  rowButton: {
    width: touch.target,
    height: touch.target,
    alignItems: "center",
    justifyContent: "center",
  },
});
