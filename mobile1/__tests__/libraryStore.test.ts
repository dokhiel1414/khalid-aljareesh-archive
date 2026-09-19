/**
 * اختبارات مكتبة المستخدم المحلية (zustand): مفضلة، سجل، مواضع، بحث أخير.
 */

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { toItemLike, useLibraryStore } from "@/store/libraryStore";

const ITEM = {
  id: "item-1",
  title: "درس في التوحيد",
  description: null,
  category: "AUDIO" as const,
  thumbnail: null,
  driveFileId: "file-1",
  driveLink: null,
};

function resetStore() {
  useLibraryStore.setState({
    favorites: [],
    recent: [],
    positions: {},
    recentSearches: [],
  });
}

beforeEach(resetStore);

describe("المفضلة", () => {
  it("تضيف وتزيل من المفضلة", () => {
    const { toggleFavorite, isFavorite } = useLibraryStore.getState();
    expect(isFavorite(ITEM.id)).toBe(false);
    toggleFavorite(ITEM);
    expect(isFavorite(ITEM.id)).toBe(true);
    toggleFavorite(ITEM);
    expect(isFavorite(ITEM.id)).toBe(false);
  });

  it("لا تُضاف مكررة", () => {
    const { toggleFavorite } = useLibraryStore.getState();
    toggleFavorite(ITEM);
    toggleFavorite(ITEM);
    expect(useLibraryStore.getState().favorites).toHaveLength(0);
  });
});

describe("سجل الاستماع", () => {
  it("يسجّل بلا تكرار ويضع الأحدث أولاً", () => {
    const { recordListen } = useLibraryStore.getState();
    recordListen(ITEM);
    recordListen({ ...ITEM, title: "درس آخر", id: "item-2" });
    recordListen(ITEM);
    const recent = useLibraryStore.getState().recent;
    expect(recent).toHaveLength(2);
    expect(recent[0].id).toBe(ITEM.id);
    expect(recent[1].id).toBe("item-2");
  });

  it("يحدّ السجل بحد أقصى", () => {
    const { recordListen } = useLibraryStore.getState();
    for (let i = 0; i < 55; i += 1) {
      recordListen({ ...ITEM, id: `item-${i}`, title: `درس ${i}` });
    }
    expect(useLibraryStore.getState().recent).toHaveLength(50);
  });
});

describe("مواضع الاستئناف", () => {
  it("يحفظ موضع الاستماع بالثواني الصحيحة", () => {
    useLibraryStore.getState().recordPosition("item-1", 65.9);
    expect(useLibraryStore.getState().positions["item-1"]).toBe(65);
  });
});

describe("البحث الأخير", () => {
  it("يضيف بلا تكرار وبحد أقصى ١٠", () => {
    const { addRecentSearch } = useLibraryStore.getState();
    for (let i = 1; i <= 12; i += 1) addRecentSearch(`بحث ${i}`);
    addRecentSearch("بحث 5");
    const searches = useLibraryStore.getState().recentSearches;
    expect(searches).toHaveLength(10);
    expect(searches[0]).toBe("بحث 5");
    expect(searches.filter((s) => s === "بحث 5")).toHaveLength(1);
  });

  it("يحذف ويمسح", () => {
    const { addRecentSearch, removeRecentSearch, clearRecentSearches } =
      useLibraryStore.getState();
    addRecentSearch("التوحيد");
    addRecentSearch("الصلاة");
    removeRecentSearch("التوحيد");
    expect(useLibraryStore.getState().recentSearches).toEqual(["الصلاة"]);
    clearRecentSearches();
    expect(useLibraryStore.getState().recentSearches).toEqual([]);
  });
});

describe("toItemLike", () => {
  it("يملأ الحقول الناقصة بقيم آمنة", () => {
    const like = toItemLike({ id: "x", title: "عنوان", category: "VIDEO" });
    expect(like).toEqual({
      id: "x",
      title: "عنوان",
      description: null,
      category: "VIDEO",
      thumbnail: null,
      driveFileId: null,
      driveLink: null,
      publishedAt: undefined,
      viewCount: undefined,
    });
  });
});
