/**
 * اختبارات روابط Google Drive — استخراج المعرفات وبناء روابط البث/التحميل.
 */

import {
  driveDownloadUrl,
  driveStreamUrl,
  driveThumbnailUrl,
  driveViewUrl,
  extractDriveFileId,
  resolveItemThumbnail,
  resolveStreamUrl,
} from "@/utils/drive";
import { API_BASE_URL } from "@/constants/site";

const FILE_ID = "AbCdEfGhIjKlMnOpQrSt";

describe("extractDriveFileId", () => {
  it("يستخرج من صيغ روابط Drive الشائعة", () => {
    expect(
      extractDriveFileId(`https://drive.google.com/file/d/${FILE_ID}/view`),
    ).toBe(FILE_ID);
    expect(
      extractDriveFileId(`https://drive.google.com/open?id=${FILE_ID}`),
    ).toBe(FILE_ID);
    expect(
      extractDriveFileId(`https://drive.google.com/uc?export=download&id=${FILE_ID}`),
    ).toBe(FILE_ID);
  });

  it("يعيد null لروابط غير Drive", () => {
    expect(extractDriveFileId("https://example.com/file")).toBeNull();
    expect(extractDriveFileId(null)).toBeNull();
    expect(extractDriveFileId(undefined)).toBeNull();
  });
});

describe("روابط Drive المبنية", () => {
  it("يبني رابط البث عبر بروكسي الموقع", () => {
    expect(driveStreamUrl(FILE_ID)).toBe(
      `${API_BASE_URL}/api/stream?id=${FILE_ID}`,
    );
  });

  it("يبني روابط التحميل والمصغرة والعرض", () => {
    expect(driveDownloadUrl(FILE_ID)).toContain(
      "drive.usercontent.google.com/download",
    );
    expect(driveDownloadUrl(FILE_ID)).toContain(FILE_ID);
    expect(driveThumbnailUrl(FILE_ID)).toContain("drive.google.com/thumbnail");
    expect(driveViewUrl(FILE_ID)).toContain(`/file/d/${FILE_ID}/view`);
  });
});

describe("resolveItemThumbnail / resolveStreamUrl", () => {
  it("يفضّل المصغرة المخصصة ثم مصغرة Drive", () => {
    expect(resolveItemThumbnail("https://img/1.jpg", FILE_ID)).toBe(
      "https://img/1.jpg",
    );
    expect(resolveItemThumbnail(null, FILE_ID)).toBe(driveThumbnailUrl(FILE_ID));
    expect(resolveItemThumbnail(null, null)).toBeNull();
  });

  it("يحل رابط البث من المعرف أو من الرابط", () => {
    expect(resolveStreamUrl(FILE_ID, null)).toBe(driveStreamUrl(FILE_ID));
    expect(
      resolveStreamUrl(null, `https://drive.google.com/file/d/${FILE_ID}/view`),
    ).toBe(driveStreamUrl(FILE_ID));
    expect(resolveStreamUrl(null, null)).toBeNull();
  });
});
