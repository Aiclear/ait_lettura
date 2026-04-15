import React, { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArticleDetail } from "@/components/ArticleView/Detail";
import {
  ScrollBox,
  ScrollBoxRefObject,
} from "@/components/ArticleView/ScrollBox";
import { ReadingOptions } from "./ReadingOptions";
import { ToolbarItemNavigator } from "./ToolBar";
import { StarAndRead } from "@/layout/Article/StarAndRead";
import { PlayerSwitcher } from "@/components/PodcastPlayer/PlayerSwitch";
import { IconButton, Separator, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { ArticleResItem } from "@/db";
import { X, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/helpers/errorHandler";
import { useBearStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";

export interface ArticleViewProps {
  article: ArticleResItem | null;
  goNext?: () => void;
  goPrev?: () => void;
  closable?: boolean;
  onClose?: () => void;
}

export function View(props: ArticleViewProps) {
  const { t } = useTranslation();
  const scrollBoxRef = useRef<ScrollBoxRefObject>(null);
  const [hasBookmark, setHasBookmark] = React.useState(false);
  const [bookmarkPosition, setBookmarkPosition] = React.useState(0);
  const [hasScrolledToBookmark, setHasScrolledToBookmark] = React.useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = React.useState(false);

  const store = useBearStore(
    useShallow((state) => ({
      activeBookmark: state.activeBookmark,
      setActiveBookmark: state.setActiveBookmark,
      getBookmark: state.getBookmark,
      addBookmark: state.addBookmark,
      deleteBookmark: state.deleteBookmark,
    })),
  );

  const renderPlaceholder = () => {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--gray-6)]"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium text-[var(--gray-12)] mb-2">
          {t("Ready to Read")}
        </h2>
        <p className="text-[var(--gray-11)] text-base">
          {t("Select an article from your subscribe to start reading")}
        </p>
      </div>
    );
  };

  const scrollToBookmarkPosition = useCallback((position: number) => {
    if (scrollBoxRef.current && position > 0) {
      setTimeout(() => {
        scrollBoxRef.current?.scrollToPosition(position);
        setHasScrolledToBookmark(true);
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (store.activeBookmark && props.article) {
      if (store.activeBookmark.article_uuid === props.article.uuid) {
        setHasBookmark(true);
        setBookmarkPosition(store.activeBookmark.read_position);
        scrollToBookmarkPosition(store.activeBookmark.read_position);
        store.setActiveBookmark(null);
        return;
      }
    }
    setHasScrolledToBookmark(false);
  }, [store.activeBookmark, props.article, store.setActiveBookmark, scrollToBookmarkPosition]);

  useEffect(() => {
    if (props.article && !store.activeBookmark) {
      checkBookmark(props.article.uuid);
    }
  }, [props.article, store.activeBookmark]);

  useEffect(() => {
    if (hasBookmark && bookmarkPosition > 0 && !hasScrolledToBookmark && !store.activeBookmark) {
      scrollToBookmarkPosition(bookmarkPosition);
    }
  }, [hasBookmark, bookmarkPosition, hasScrolledToBookmark, store.activeBookmark, scrollToBookmarkPosition]);

  const checkBookmark = async (articleUuid: string) => {
    try {
      const bookmark = await store.getBookmark(articleUuid);
      if (bookmark && bookmark.read_position !== undefined) {
        setHasBookmark(true);
        setBookmarkPosition(Number(bookmark.read_position) || 0);
      } else {
        setHasBookmark(false);
        setBookmarkPosition(0);
      }
    } catch (error) {
      console.error("Error checking bookmark:", error);
      setHasBookmark(false);
      setBookmarkPosition(0);
    }
  };

  const toggleBookmark = async () => {
    if (!props.article) return;

    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);

    try {
      if (hasBookmark) {
        const result = await store.deleteBookmark(props.article.uuid);
        if (result > 0) {
          setHasBookmark(false);
          setBookmarkPosition(0);
          showSuccessToast(t("Bookmark removed"));
        } else {
          showErrorToast(new Error("No rows affected"), t("Failed to remove bookmark"));
        }
      } else {
        const scrollPosition = scrollBoxRef.current?.getScrollPosition() || 0;
        const result = await store.addBookmark(
          props.article.uuid,
          props.article.title,
          scrollPosition,
        );
        if (result > 0) {
          setHasBookmark(true);
          setBookmarkPosition(scrollPosition);
          showSuccessToast(t("Bookmark added"));
        } else {
          showErrorToast(new Error("No rows affected"), t("Failed to add bookmark"));
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      showErrorToast(error, hasBookmark ? t("Failed to remove bookmark") : t("Failed to add bookmark"));
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div
        className={
          "h-[var(--app-toolbar-height)] flex items-center justify-end px-3 gap-2 border-b relative z-10 shrink-0"
        }
      >
        {props.article && (
          <>
            <StarAndRead article={props.article} />
            <Tooltip content={hasBookmark ? t("Remove bookmark") : t("Add bookmark")}>
              <IconButton
                size="2"
                variant="ghost"
                color={hasBookmark ? "blue" : "gray"}
                className="text-[var(--gray-12)]"
                onClick={toggleBookmark}
                disabled={isBookmarkLoading}
              >
                {isBookmarkLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : hasBookmark ? (
                  <BookmarkCheck size={16} />
                ) : (
                  <Bookmark size={16} />
                )}
              </IconButton>
            </Tooltip>
            <Separator orientation={"vertical"} className="mx-1" />
          </>
        )}
        {props.goNext && props.goPrev && (
          <>
            <ToolbarItemNavigator goNext={props.goNext} goPrev={props.goPrev} />
            <Separator orientation="vertical" className="mx-1" />
          </>
        )}
        {props.article && (
          <>
            <ReadingOptions article={props.article} />
            <Separator orientation="vertical" className="mx-1" />
          </>
        )}

        <PlayerSwitcher />

        {props.closable && (
          <>
            <Separator orientation="vertical" className="mx-1" />
            <IconButton
              size="2"
              variant="ghost"
              color="gray"
              className="text-[var(--gray-12)]"
              onClick={props.onClose}
            >
              <X size={16} />
            </IconButton>
          </>
        )}
      </div>
      <AnimatePresence>
        <motion.article
          key={props.article?.uuid || "view"}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <ScrollBox
            className="h-[calc(100vh_-_var(--app-toolbar-height))]"
            ref={scrollBoxRef}
          >
            <div className="font-[var(--reading-font-body)] min-h-full m-auto sm:px-5 sm:max-w-xl lg:px-10 lg:max-w-5xl">
              {" "}
              {props.article ? (
                <ArticleDetail article={props.article} />
              ) : (
                renderPlaceholder()
              )}
            </div>
          </ScrollBox>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
