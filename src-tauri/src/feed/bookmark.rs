use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::db::establish_connection;
use crate::models;
use crate::schema;

#[derive(Debug, Serialize, Deserialize)]
pub struct BookmarkFilter {
  pub article_uuid: Option<String>,
  pub limit: Option<i32>,
  pub offset: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBookmarkRequest {
  pub article_uuid: String,
  pub article_title: String,
  pub position: String,
  pub note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateBookmarkRequest {
  pub position: Option<String>,
  pub note: Option<String>,
}

pub struct Bookmark {}

impl Bookmark {
  pub fn create_bookmark(request: CreateBookmarkRequest) -> Result<models::Bookmark, String> {
    let mut connection = establish_connection();

    let bookmark_uuid = Uuid::new_v4().hyphenated().to_string();

    let new_bookmark = models::NewBookmark {
      uuid: bookmark_uuid.clone(),
      article_uuid: request.article_uuid,
      article_title: request.article_title,
      position: request.position,
      note: request.note,
    };

    let result = diesel::insert_into(schema::bookmarks::dsl::bookmarks)
      .values(&new_bookmark)
      .execute(&mut connection);

    match result {
      Ok(_) => {
        let bookmark = schema::bookmarks::dsl::bookmarks
          .filter(schema::bookmarks::uuid.eq(&bookmark_uuid))
          .first::<models::Bookmark>(&mut connection)
          .map_err(|e| format!("Failed to load bookmark: {}", e))?;
        Ok(bookmark)
      }
      Err(e) => Err(format!("Failed to create bookmark: {}", e)),
    }
  }

  pub fn get_bookmarks(filter: BookmarkFilter) -> Result<Vec<models::Bookmark>, String> {
    let mut connection = establish_connection();
    let mut query = schema::bookmarks::dsl::bookmarks.into_boxed();

    if let Some(article_uuid) = filter.article_uuid {
      query = query.filter(schema::bookmarks::article_uuid.eq(article_uuid));
    }

    query = query.order(schema::bookmarks::create_date.desc());

    if let Some(limit) = filter.limit {
      query = query.limit(limit as i64);
    }

    if let Some(offset) = filter.offset {
      query = query.offset(offset as i64);
    }

    query
      .load::<models::Bookmark>(&mut connection)
      .map_err(|e| format!("Failed to load bookmarks: {}", e))
  }

  pub fn get_bookmark_by_uuid(uuid: String) -> Result<Option<models::Bookmark>, String> {
    let mut connection = establish_connection();
    let result = schema::bookmarks::dsl::bookmarks
      .filter(schema::bookmarks::uuid.eq(&uuid))
      .first::<models::Bookmark>(&mut connection);

    match result {
      Ok(bookmark) => Ok(Some(bookmark)),
      Err(diesel::result::Error::NotFound) => Ok(None),
      Err(e) => Err(format!("Failed to load bookmark: {}", e)),
    }
  }

  pub fn update_bookmark(uuid: String, request: UpdateBookmarkRequest) -> Result<models::Bookmark, String> {
    let mut connection = establish_connection();

    let result = diesel::update(schema::bookmarks::dsl::bookmarks.filter(schema::bookmarks::uuid.eq(&uuid)))
      .set((
        request.position.map(|pos| schema::bookmarks::position.eq(pos)),
        request.note.map(|n| schema::bookmarks::note.eq(n)),
      ))
      .execute(&mut connection);

    match result {
      Ok(_) => {
        let bookmark = schema::bookmarks::dsl::bookmarks
          .filter(schema::bookmarks::uuid.eq(&uuid))
          .first::<models::Bookmark>(&mut connection)
          .map_err(|e| format!("Failed to load updated bookmark: {}", e))?;
        Ok(bookmark)
      }
      Err(e) => Err(format!("Failed to update bookmark: {}", e)),
    }
  }

  pub fn delete_bookmark(uuid: String) -> Result<usize, String> {
    let mut connection = establish_connection();

    let result = diesel::delete(schema::bookmarks::dsl::bookmarks.filter(schema::bookmarks::uuid.eq(&uuid)))
      .execute(&mut connection);

    match result {
      Ok(r) => Ok(r),
      Err(e) => Err(format!("Failed to delete bookmark: {}", e)),
    }
  }
}
