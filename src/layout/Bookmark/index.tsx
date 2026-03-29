import React, { useEffect, useState } from "react";
import { useBearStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";
import { Bookmark as BookmarkType } from "@/db";
import {
  Box,
  Heading,
  Text,
  Flex,
  IconButton,
  Tooltip,
  ScrollArea,
  Card,
  Badge,
} from "@radix-ui/themes";
import { Bookmark, Trash2, Play, Clock, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as dataAgent from "@/helpers/dataAgent";
import { useNavigate } from "react-router-dom";
import { RouteConfig } from "@/config";

export const BookmarkPage = React.memo(function () {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const store = useBearStore(
    useShallow((state) => ({
      setArticle: state.setArticle,
      setFeed: state.setFeed,
      viewMeta: state.viewMeta,
      setViewMeta: state.setViewMeta,
    })),
  );

  useEffect(() => {
    loadAllBookmarks();
  }, []);

  async function loadAllBookmarks() {
    setIsLoading(true);
    try {
      const loadedBookmarks = await dataAgent.getBookmarks({});
      setBookmarks(loadedBookmarks);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteBookmark(uuid: string) {
    try {
      await dataAgent.deleteBookmark(uuid);
      setBookmarks(bookmarks.filter((b) => b.uuid !== uuid));
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    }
  }

  async function goToBookmark(bookmark: BookmarkType) {
    try {
      const article = await dataAgent.getArticleByUuid(bookmark.article_uuid);
      const feed = await dataAgent.getFeedByUuid(article.feed_uuid);

      store.setFeed(feed);
      store.setViewMeta({
        id: feed.id,
        uuid: feed.uuid,
        item_type: "channel",
        title: feed.title,
      });
      store.setArticle(article);

      navigate(RouteConfig.LOCAL_FEED.replace(":uuid", feed.uuid));

      setTimeout(() => {
        const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: parseInt(bookmark.position, 10),
            behavior: 'smooth'
          });
        }
      }, 500);
    } catch (error) {
      console.error("Failed to go to bookmark:", error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    const key = bookmark.article_uuid;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkType[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="h-[var(--app-toolbar-height)] flex items-center px-4 border-b shrink-0">
        <Flex align="center" gap="3">
          <Bookmark size={24} />
          <Heading size="5">{t("Bookmarks")}</Heading>
          <Badge size="2" variant="soft">{bookmarks.length}</Badge>
        </Flex>
      </div>

      <ScrollArea type="auto" scrollbars="vertical" className="flex-1">
        <Box p="4">
          {isLoading ? (
            <Text align="center" color="gray" className="block py-8">
              {t("Loading bookmarks...")}
            </Text>
          ) : bookmarks.length === 0 ? (
            <Box className="text-center py-16">
              <Bookmark size={64} className="mx-auto mb-4 text-[var(--gray-6)]" />
              <Heading size="4" mb="2">{t("No bookmarks yet")}</Heading>
              <Text color="gray">
                {t("Start reading articles and add bookmarks to save your reading positions!")}
              </Text>
            </Box>
          ) : (
            <Flex direction="column" gap="4">
              {Object.entries(groupedBookmarks).map(([articleUuid, articleBookmarks]) => (
                <Card key={articleUuid} className="p-4">
                  <Flex align="center" gap="3" mb="3">
                    <FileText size={20} className="text-[var(--gray-11)]" />
                    <Heading size="4" className="flex-1 truncate">
                      {articleBookmarks[0]?.article_title || t("Unknown article")}
                    </Heading>
                    <Badge size="1" variant="soft">
                      {articleBookmarks.length} {articleBookmarks.length === 1 ? t("bookmark") : t("bookmarks")}
                    </Badge>
                  </Flex>

                  <Flex direction="column" gap="2">
                    {articleBookmarks.map((bookmark) => (
                      <Flex
                        key={bookmark.uuid}
                        align="center"
                        justify="between"
                        className="p-3 bg-[var(--gray-a3)] rounded-md"
                      >
                        <Flex direction="column" gap="1" className="flex-1 min-w-0">
                          <Flex align="center" gap="2">
                            <Clock size={12} className="text-[var(--gray-11)]" />
                            <Text size="1" color="gray">
                              {formatDate(bookmark.create_date)}
                            </Text>
                          </Flex>
                          {bookmark.note && (
                            <Text size="2" className="italic">
                              {bookmark.note}
                            </Text>
                          )}
                        </Flex>
                        <Flex gap="2">
                          <Tooltip content={t("Go to bookmark")}>
                            <IconButton
                              size="2"
                              variant="ghost"
                              color="gray"
                              onClick={() => goToBookmark(bookmark)}
                            >
                              <Play size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content={t("Delete bookmark")}>
                            <IconButton
                              size="2"
                              variant="ghost"
                              color="red"
                              onClick={() => deleteBookmark(bookmark.uuid)}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </Tooltip>
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </Box>
      </ScrollArea>
    </div>
  );
});
