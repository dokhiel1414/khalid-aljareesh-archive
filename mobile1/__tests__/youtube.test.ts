/**
 * اختبارات أدوات يوتيوب — كشف الروابط وبناء روابط المشاهدة/المصغرات.
 */

import {
  extractYouTubeId,
  isYouTube,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/utils/youtube";

const VIDEO_ID = "dQw4w9WgXcQ";

describe("extractYouTubeId", () => {
  it("يستخرج من صيغ يوتيوب المختلفة", () => {
    expect(extractYouTubeId(`https://www.youtube.com/watch?v=${VIDEO_ID}`)).toBe(
      VIDEO_ID,
    );
    expect(
      extractYouTubeId(`https://www.youtube.com/watch?v=${VIDEO_ID}&t=30s`),
    ).toBe(VIDEO_ID);
    expect(extractYouTubeId(`https://youtube.com/shorts/${VIDEO_ID}`)).toBe(
      VIDEO_ID,
    );
    expect(extractYouTubeId(`https://www.youtube.com/embed/${VIDEO_ID}`)).toBe(
      VIDEO_ID,
    );
    expect(extractYouTubeId(`https://youtu.be/${VIDEO_ID}`)).toBe(VIDEO_ID);
  });

  it("يعيد null لغير اليوتيوب", () => {
    expect(extractYouTubeId("https://example.com/video.mp4")).toBeNull();
    expect(extractYouTubeId(null)).toBeNull();
  });
});

describe("isYouTube", () => {
  it("يميز روابط يوتيوب", () => {
    expect(isYouTube(`https://youtu.be/${VIDEO_ID}`)).toBe(true);
    expect(isYouTube("https://drive.google.com/file/d/x")).toBe(false);
  });
});

describe("روابط يوتيوب المبنية", () => {
  it("يبني رابط المشاهدة والمصغرة", () => {
    expect(youtubeWatchUrl(VIDEO_ID)).toBe(
      `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    );
    expect(youtubeThumbnailUrl(VIDEO_ID)).toBe(
      `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`,
    );
  });
});
