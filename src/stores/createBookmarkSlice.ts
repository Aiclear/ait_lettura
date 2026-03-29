import { StateCreator } from "zustand";
import { Bookmark } from "@/db";
import * as dataAgent from "@/helpers/dataAgent";

export interface BookmarkSlice {
  bookmarks: Bookmark[];
  setBookmarks: (bookmarks: Bookmark[]) => void;
  loadBookmarks: (article_uuid?: string) => Promise<Bookmark[]>;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (uuid: string) => void;
  createBookmark: (
    article_uuid: string,
    article_title: string,
    position: number,
    note?: string,
  ) => Promise<Bookmark>;
  updateBookmark: (
    uuid: string,
    position?: number,
    note?: string,
  ) => Promise<Bookmark>;
  deleteBookmark: (uuid: string) => Promise<number>;
}

export const createBookmarkSlice: StateCreator<
  BookmarkSlice,
  [],
  [],
  BookmarkSlice
> = (set, get) => ({
  bookmarks: [],
  setBookmarks: (bookmarks: Bookmark[]) => {
    set(() => ({ bookmarks }));
  },

  loadBookmarks: async (article_uuid?: string) => {
    const bookmarks = await dataAgent.getBookmarks({ article_uuid });
    set(() => ({ bookmarks }));
    return bookmarks;
  },

  addBookmark: (bookmark: Bookmark) => {
    set((state) => ({
      bookmarks: [bookmark, ...state.bookmarks],
    }));
  },

  removeBookmark: (uuid: string) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.uuid !== uuid),
    }));
  },

  createBookmark: async (
    article_uuid: string,
    article_title: string,
    position: number,
    note?: string,
  ) => {
    const bookmark = await dataAgent.createBookmark(
      article_uuid,
      article_title,
      position.toString(),
      note,
    );
    set((state) => ({
      bookmarks: [bookmark, ...state.bookmarks],
    }));
    return bookmark;
  },

  updateBookmark: async (
    uuid: string,
    position?: number,
    note?: string,
  ) => {
    const bookmark = await dataAgent.updateBookmark(
      uuid,
      position?.toString(),
      note,
    );
    set((state) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.uuid === uuid ? bookmark : b,
      ),
    }));
    return bookmark;
  },

  deleteBookmark: async (uuid: string) => {
    const result = await dataAgent.deleteBookmark(uuid);
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.uuid !== uuid),
    }));
    return result;
  },
});
