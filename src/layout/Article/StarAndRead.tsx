import { IconButton, Tooltip, Dialog, Flex, Text, Button, Box, Heading, ScrollArea } from "@radix-ui/themes";
import { CheckCircle2, Circle, Star, Bookmark, BookmarkCheck, Trash2, Play } from "lucide-react";
import { ArticleReadStatus, ArticleStarStatus } from "@/typing";
import React, { useEffect, useState } from "react";
import { ArticleResItem, Bookmark as BookmarkType } from "@/db";
import * as dataAgent from "@/helpers/dataAgent";
import { useTranslation } from "react-i18next";
import { useBearStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";

export interface StarAndReadProps {
  article: ArticleResItem;
}

export function StarAndRead(props: StarAndReadProps) {
  const { article } = props;
  const { t } = useTranslation();
  const [readStatus, setReadStatus] = useState<number>();
  const [starred, setStarred] = useState<number>();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);

  const store = useBearStore(
    useShallow((state) => ({
      loadBookmarks: state.loadBookmarks,
      addBookmark: state.addBookmark,
      removeBookmark: state.removeBookmark,
      setBookmarks: state.setBookmarks,
      article: state.article,
    })),
  );

  function toggleReadStatus() {
    let newStatus: number = 1;

    if (readStatus === ArticleReadStatus.UNREAD) {
      newStatus = ArticleReadStatus.READ;
    } else {
      newStatus = ArticleReadStatus.UNREAD;
    }

    dataAgent.updateArticleReadStatus(article.uuid, newStatus).then(() => {
      article.read_status = newStatus;
      setReadStatus(newStatus);
    });
  }

  function toggleStarStatus() {
    let newStarrStatus: number = 1;

    if (starred === ArticleStarStatus.UNSTAR) {
      newStarrStatus = ArticleStarStatus.STARRED;
    } else {
      newStarrStatus = ArticleStarStatus.UNSTAR;
    }

    dataAgent.updateArticleStarStatus(article.uuid, newStarrStatus).then(() => {
      article.starred = newStarrStatus;
      setStarred(newStarrStatus);
    });
  }

  function getCurrentScrollPosition() {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      return scrollContainer.scrollTop;
    }
    return window.scrollY;
  }

  async function createBookmark() {
    setIsCreatingBookmark(true);
    try {
      const position = getCurrentScrollPosition();
      const newBookmark = await dataAgent.createBookmark(
        article.uuid,
        article.title,
        position.toString(),
        "",
      );
      store.addBookmark(newBookmark);
      setBookmarks([...bookmarks, newBookmark]);
    } catch (error) {
      console.error("Failed to create bookmark:", error);
    } finally {
      setIsCreatingBookmark(false);
    }
  }

  async function loadBookmarks() {
    try {
      const loadedBookmarks = await dataAgent.getBookmarks({
        article_uuid: article.uuid,
      });
      setBookmarks(loadedBookmarks);
      store.setBookmarks(loadedBookmarks);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  }

  async function deleteBookmark(uuid: string) {
    try {
      await dataAgent.deleteBookmark(uuid);
      store.removeBookmark(uuid);
      setBookmarks(bookmarks.filter((b) => b.uuid !== uuid));
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    }
  }

  function goToBookmarkPosition(position: string) {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: parseInt(position, 10),
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: parseInt(position, 10),
        behavior: 'smooth'
      });
    }
    setIsBookmarkDialogOpen(false);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  useEffect(() => {
    setReadStatus(article.read_status);
  }, [article.read_status]);

  useEffect(() => {
    setStarred(article.starred);
  }, [article.starred]);

  useEffect(() => {
    if (article.uuid) {
      loadBookmarks();
    }
  }, [article.uuid]);

  return (
    <div className="flex items-center gap-4">
      {article.starred === ArticleStarStatus.UNSTAR && (
        <Tooltip content={t("Star it")}>
          <IconButton
            variant="ghost"
            size="2"
            color="gray"
            className="text-[var(--gray-12)]"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              toggleStarStatus();
            }}
          >
            <Star size={16} />
          </IconButton>
        </Tooltip>
      )}
      {article.starred === ArticleStarStatus.STARRED && (
        <Tooltip content={t("Unstar it")}>
          <IconButton
            variant="ghost"
            size="2"
            className="!text-[#fe9e2b] !hover:text-[#fe9e2b]"
            color="gray"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              toggleStarStatus();
            }}
          >
            <Star size={16} fill={"currentColor"} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip content={t("Add bookmark")}>
        <IconButton
          variant="ghost"
          size="2"
          color="gray"
          className="text-[var(--gray-12)]"
          loading={isCreatingBookmark}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            createBookmark();
          }}
        >
          <Bookmark size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip content={t("View bookmarks")}>
        <IconButton
          variant="ghost"
          size="2"
          color="gray"
          className="text-[var(--gray-12)]"
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            setIsBookmarkDialogOpen(true);
          }}
        >
          <BookmarkCheck size={16} />
        </IconButton>
      </Tooltip>
      {article.read_status === ArticleReadStatus.UNREAD && (
        <Tooltip content={t("Mark as read")}>
          <IconButton
            variant="ghost"
            size="2"
            color="gray"
            className="text-[var(--gray-12)]"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              toggleReadStatus();
            }}
          >
            <Circle size={16} />
          </IconButton>
        </Tooltip>
      )}
      {article.read_status === ArticleReadStatus.READ && (
        <Tooltip content={t("Mark as unread")}>
          <IconButton
            variant="ghost"
            size="2"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              toggleReadStatus();
            }}
          >
            <CheckCircle2 size={16} />
          </IconButton>
        </Tooltip>
      )}

      <Dialog.Root open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>
            <Flex align="center" gap="2">
              <Bookmark size={20} />
              {t("Bookmarks")} - {article.title}
            </Flex>
          </Dialog.Title>
          <Dialog.Description size="2" mb="4">
            {t("Manage your reading bookmarks")}
          </Dialog.Description>

          <Box mb="4">
            <Button
              size="2"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                createBookmark();
              }}
              loading={isCreatingBookmark}
            >
              <Bookmark size={14} className="mr-2" />
              {t("Add current position")}
            </Button>
          </Box>

          <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 300 }}>
            {bookmarks.length === 0 ? (
              <Text size="2" color="gray" align="center" className="block py-8">
                {t("No bookmarks yet. Add one to save your reading position!")}
              </Text>
            ) : (
              <Flex direction="column" gap="3">
                {bookmarks.map((bookmark) => (
                  <Flex
                    key={bookmark.uuid}
                    align="center"
                    justify="between"
                    className="p-3 bg-[var(--gray-a3)] rounded-md"
                  >
                    <Flex direction="column" gap="1" className="flex-1 min-w-0">
                      <Text size="1" weight="medium" className="truncate">
                        {bookmark.article_title}
                      </Text>
                      <Text size="1" color="gray">
                        {formatDate(bookmark.create_date)}
                      </Text>
                      {bookmark.note && (
                        <Text size="1" color="gray" className="italic">
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
                          onClick={(e: React.MouseEvent<HTMLElement>) => {
                            e.stopPropagation();
                            goToBookmarkPosition(bookmark.position);
                          }}
                        >
                          <Play size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content={t("Delete bookmark")}>
                        <IconButton
                          size="2"
                          variant="ghost"
                          color="red"
                          onClick={(e: React.MouseEvent<HTMLElement>) => {
                            e.stopPropagation();
                            deleteBookmark(bookmark.uuid);
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Tooltip>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            )}
          </ScrollArea>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                {t("Close")}
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
