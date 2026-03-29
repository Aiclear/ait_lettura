-- Your SQL goes here
CREATE TABLE bookmarks (
    id           INTEGER  NOT NULL
                          PRIMARY KEY,
    uuid         VARCHAR  NOT NULL
                          UNIQUE,
    article_uuid VARCHAR  NOT NULL,
    article_title VARCHAR NOT NULL,
    position     VARCHAR  NOT NULL,
    note         TEXT,
    create_date  DATETIME NOT NULL
                          DEFAULT CURRENT_TIMESTAMP,
    update_date  DATETIME NOT NULL
                          DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (
        article_uuid
    )
    REFERENCES articles (uuid) MATCH [FULL]
    ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_article_uuid ON bookmarks (article_uuid);
CREATE INDEX idx_bookmarks_create_date ON bookmarks (create_date);
