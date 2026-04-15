import { StateCreator } from "zustand";
import { invoke } from "@tauri-apps/api";
import { Bookmark } from "@/db";

export interface BookmarkSlice {
  bookmarks: Bookmark[];
  setBookmarks: (bookmarks: Bookmark[]) => void;
  loadBookmarks: () => Promise<Bookmark[]>;
  addBookmark: (
    articleUuid: string,
    articleTitle: string,
    readPosition: number,
  ) => Promise<number>;
  getBookmark: (articleUuid: string) => Promise<Bookmark | null>;
  deleteBookmark: (articleUuid: string) => Promise<number>;
  activeBookmark: Bookmark | null;
  setActiveBookmark: (bookmark: Bookmark | null) => void;
}

export const createBookmarkSlice: StateCreator<
  BookmarkSlice,
  [],
  [],
  BookmarkSlice
> = (set, get) => ({
  bookmarks: [],
  activeBookmark: null,

  setBookmarks: (bookmarks: Bookmark[]) => {
    set(() => ({ bookmarks }));
  },

  setActiveBookmark: (bookmark: Bookmark | null) => {
    set(() => ({ activeBookmark: bookmark }));
  },

  loadBookmarks: async (): Promise<Bookmark[]> => {
    try {
      const result = await invoke("get_all_bookmarks");
      const bookmarks = result as Bookmark[];
      set(() => ({ bookmarks }));
      return bookmarks;
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      return [];
    }
  },

  addBookmark: async (
    articleUuid: string,
    articleTitle: string,
    readPosition: number,
  ): Promise<number> => {
    try {
      const result = await invoke("add_bookmark", {
        articleUuid,
        articleTitle,
        readPosition,
      });
      return result as number;
    } catch (error) {
      console.error("Error adding bookmark:", error);
      return 0;
    }
  },

  getBookmark: async (articleUuid: string): Promise<Bookmark | null> => {
    try {
      const result = await invoke("get_bookmark", { articleUuid });
      return result as Bookmark | null;
    } catch (error) {
      console.error("Error getting bookmark:", error);
      return null;
    }
  },

  deleteBookmark: async (articleUuid: string): Promise<number> => {
    try {
      const result = await invoke("delete_bookmark", { articleUuid });
      const currentBookmarks = get().bookmarks;
      set(() => ({
        bookmarks: currentBookmarks.filter((b) => b.article_uuid !== articleUuid),
      }));
      return result as number;
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      return 0;
    }
  },
});
