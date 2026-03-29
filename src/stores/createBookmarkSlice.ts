import { StateCreator } from "zustand";
import { BookmarkResItem } from "@/db";
import * as dataAgent from "@/helpers/dataAgent";
import { showSuccessToast, showErrorToast } from "@/helpers/errorHandler";

export interface BookmarkSlice {
  bookmarks: BookmarkResItem[];
  setBookmarks: (bookmarks: BookmarkResItem[]) => void;
  getBookmarks: () => Promise<BookmarkResItem[]>;
  createBookmark: (
    articleUuid: string,
    articleTitle: string,
    feedUuid: string,
    feedTitle: string,
    readPosition: number,
  ) => Promise<BookmarkResItem | null>;
  getBookmarkByArticle: (articleUuid: string) => Promise<BookmarkResItem | null>;
  deleteBookmark: (uuid: string) => Promise<void>;
  updateBookmarkPosition: (uuid: string, readPosition: number) => Promise<void>;
}

export const createBookmarkSlice: StateCreator<BookmarkSlice, [], [], BookmarkSlice> = (set, get) => ({
  bookmarks: [],
  setBookmarks: (bookmarks: BookmarkResItem[]) => {
    set(() => ({ bookmarks }));
  },
  getBookmarks: async () => {
    try {
      const response = await dataAgent.getBookmarks();
      const bookmarks = response.data;
      set(() => ({ bookmarks }));
      return bookmarks;
    } catch (error) {
      showErrorToast(error, "Failed to load bookmarks");
      return [];
    }
  },
  createBookmark: async (
    articleUuid: string,
    articleTitle: string,
    feedUuid: string,
    feedTitle: string,
    readPosition: number,
  ) => {
    try {
      const bookmark = await dataAgent.createBookmark(
        articleUuid,
        articleTitle,
        feedUuid,
        feedTitle,
        readPosition,
      );
      showSuccessToast("Bookmark created successfully");
      await get().getBookmarks();
      return bookmark as BookmarkResItem;
    } catch (error) {
      showErrorToast(error, "Failed to create bookmark");
      return null;
    }
  },
  getBookmarkByArticle: async (articleUuid: string) => {
    try {
      const response = await dataAgent.getBookmarkByArticle(articleUuid);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  deleteBookmark: async (uuid: string) => {
    try {
      await dataAgent.deleteBookmark(uuid);
      showSuccessToast("Bookmark deleted successfully");
      await get().getBookmarks();
    } catch (error) {
      showErrorToast(error, "Failed to delete bookmark");
    }
  },
  updateBookmarkPosition: async (uuid: string, readPosition: number) => {
    try {
      await dataAgent.updateBookmarkPosition(uuid, readPosition);
      await get().getBookmarks();
    } catch (error) {
      showErrorToast(error, "Failed to update bookmark position");
    }
  },
});
