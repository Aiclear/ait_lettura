CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    article_uuid TEXT NOT NULL,
    article_title TEXT NOT NULL,
    read_position INTEGER NOT NULL DEFAULT 0,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_uuid) REFERENCES articles(uuid)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_article_uuid ON bookmarks(article_uuid);