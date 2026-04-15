import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bookmark as BookmarkIcon, Clock, Trash2, ChevronRight, ExternalLink } from "lucide-react";
import { Card, Button, ScrollArea, Flex, Text, Tooltip, IconButton } from "@radix-ui/themes";
import { useBearStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";
import { Bookmark, ArticleResItem } from "@/db";
import { RouteConfig } from "@/config";
import * as dataAgent from "@/helpers/dataAgent";
import { showErrorToast } from "@/helpers/errorHandler";
import { clsx } from "clsx";

export function BookmarkPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const store = useBearStore(
    useShallow((state) => ({
      bookmarks: state.bookmarks,
      loadBookmarks: state.loadBookmarks,
      deleteBookmark: state.deleteBookmark,
      setArticle: state.setArticle,
      setActiveBookmark: state.setActiveBookmark,
    })),
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      await store.loadBookmarks();
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = useCallback(
    async (articleUuid: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await store.deleteBookmark(articleUuid);
      } catch (error) {
        showErrorToast(error, t("Failed to delete bookmark"));
      }
    },
    [store.deleteBookmark, t],
  );

  const handleOpenBookmark = useCallback(
    async (bookmark: Bookmark) => {
      try {
        const response = await dataAgent.getArticleDetail(bookmark.article_uuid, {});
        if (response && response.data) {
          const article = response.data as ArticleResItem;
          store.setActiveBookmark(bookmark);
          store.setArticle(article);
          navigate(RouteConfig.LOCAL_ALL);
        }
      } catch (error) {
        showErrorToast(error, t("Failed to open article"));
      }
    },
    [store.setActiveBookmark, store.setArticle, navigate, t],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--gray-12)]">{t("Loading...")}</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[var(--gray-12)]">
          {t("Bookmarks")}
        </h2>
        <div className="text-sm text-[var(--gray-10)]">
          {store.bookmarks.length} {t("items")}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh_-_var(--app-toolbar-height)_-_2rem)]">
        {store.bookmarks.length > 0 ? (
          <div className="space-y-3">
            {store.bookmarks.map((bookmark) => (
              <Card
                key={bookmark.uuid}
                className={clsx(
                  "p-4 hover:shadow-md transition-shadow cursor-pointer group",
                  "border border-transparent hover:border-[var(--accent-6)]",
                )}
                onClick={() => handleOpenBookmark(bookmark)}
              >
                <Flex justify="between" align="start" gap="3">
                  <div className="flex-1 min-w-0">
                    <Flex align="center" gap="2" mb="2">
                      <BookmarkIcon size={18} className="text-blue-600 shrink-0" />
                      <Text className="font-medium truncate text-[var(--gray-12)]">
                        {bookmark.article_title}
                      </Text>
                      <ExternalLink
                        size={14}
                        className="text-[var(--gray-8)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      />
                    </Flex>
                    <Flex gap="4" className="text-sm text-[var(--gray-10)]">
                      <Flex align="center" gap="1">
                        <Clock size={14} />
                        <span>{formatDate(bookmark.create_date)}</span>
                      </Flex>
                      {bookmark.read_position > 0 && (
                        <Flex align="center" gap="1">
                          <span>
                            {t("Reading position")}: {Math.round(bookmark.read_position)}px
                          </span>
                        </Flex>
                      )}
                    </Flex>
                  </div>
                  <Tooltip content={t("Delete bookmark")}>
                    <IconButton
                      variant="ghost"
                      size="2"
                      color="red"
                      onClick={(e) => handleDeleteBookmark(bookmark.article_uuid, e)}
                      className="shrink-0"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <BookmarkIcon size={48} className="text-[var(--gray-6)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--gray-12)] mb-2">
              {t("No bookmarks yet")}
            </h3>
            <p className="text-[var(--gray-10)] text-center max-w-md">
              {t("Save articles to read later by clicking the bookmark icon")}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
