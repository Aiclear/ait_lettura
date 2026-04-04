import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bookmark as BookmarkIcon, Clock, Trash2, ChevronRight } from "lucide-react";
import { Card, Button, Separator, Badge, ScrollArea, Flex, Text, Box } from "@radix-ui/themes";
import { invoke } from "@tauri-apps/api";
import { withErrorToast } from "@/helpers/errorHandler";

interface BookmarkItem {
  id: number;
  uuid: string;
  article_uuid: string;
  article_title: string;
  read_position: number;
  create_date: string;
}

export function BookmarkPage() {
  const { t } = useTranslation();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const result = await invoke("get_all_bookmarks");
      setBookmarks(result as BookmarkItem[]);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (articleUuid: string) => {
    try {
      await invoke("delete_bookmark", { articleUuid });
      loadBookmarks();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

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
      </div>

      <ScrollArea className="h-[calc(100vh_-_var(--app-toolbar-height)_-_2rem)]">
        {bookmarks.length > 0 ? (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.uuid} className="p-4 hover:shadow-md transition-shadow">
                <Flex justify="between" align="start">
                  <div className="flex-1">
                    <Flex align="center" gap="2" mb="2">
                      <BookmarkIcon size={18} className="text-blue-600" />
                      <Text className="font-medium truncate">
                        {bookmark.article_title}
                      </Text>
                    </Flex>
                    <Flex gap="2" className="text-sm text-[var(--gray-10)]">
                      <Flex align="center" gap="1">
                        <Clock size={14} />
                        <span>{formatDate(bookmark.create_date)}</span>
                      </Flex>
                    </Flex>
                  </div>
                  <Button
                    variant="ghost"
                    size="2"
                    color="red"
                    onClick={() => deleteBookmark(bookmark.article_uuid)}
                  >
                    <Trash2 size={16} />
                  </Button>
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
