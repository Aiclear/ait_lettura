use actix_web::{get, post, delete, put, web, Responder, Result};
use serde::{Deserialize, Serialize};

use crate::feed;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBookmarkParam {
  article_uuid: String,
  article_title: String,
  position: String,
  note: Option<String>,
}

#[post("/api/bookmarks")]
pub async fn handle_create_bookmark(
  body: web::Json<CreateBookmarkParam>,
) -> Result<impl Responder> {
  let body = body.into_inner();
  let request = feed::bookmark::CreateBookmarkRequest {
    article_uuid: body.article_uuid,
    article_title: body.article_title,
    position: body.position,
    note: body.note,
  };
  let res = feed::bookmark::Bookmark::create_bookmark(request);

  Ok(web::Json(res))
}

#[get("/api/bookmarks")]
pub async fn handle_get_bookmarks(
  query: web::Query<feed::bookmark::BookmarkFilter>,
) -> Result<impl Responder> {
  let filter = feed::bookmark::BookmarkFilter {
    article_uuid: query.article_uuid.clone(),
    limit: query.limit.clone(),
    offset: query.offset.clone(),
  };
  let res = feed::bookmark::Bookmark::get_bookmarks(filter);

  Ok(web::Json(res))
}

#[get("/api/bookmarks/{uuid}")]
pub async fn handle_get_bookmark_by_uuid(
  uuid: web::Path<String>,
) -> Result<impl Responder> {
  let res = feed::bookmark::Bookmark::get_bookmark_by_uuid(uuid.to_string());

  Ok(web::Json(res))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateBookmarkParam {
  position: Option<String>,
  note: Option<String>,
}

#[put("/api/bookmarks/{uuid}")]
pub async fn handle_update_bookmark(
  uuid: web::Path<String>,
  body: web::Json<UpdateBookmarkParam>,
) -> Result<impl Responder> {
  let body = body.into_inner();
  let request = feed::bookmark::UpdateBookmarkRequest {
    position: body.position,
    note: body.note,
  };
  let res = feed::bookmark::Bookmark::update_bookmark(uuid.to_string(), request);

  Ok(web::Json(res))
}

#[delete("/api/bookmarks/{uuid}")]
pub async fn handle_delete_bookmark(
  uuid: web::Path<String>,
) -> Result<impl Responder> {
  let res = feed::bookmark::Bookmark::delete_bookmark(uuid.to_string());

  Ok(web::Json(res))
}

pub fn config(cfg: &mut web::ServiceConfig) {
  cfg
    .service(handle_create_bookmark)
    .service(handle_get_bookmarks)
    .service(handle_get_bookmark_by_uuid)
    .service(handle_update_bookmark)
    .service(handle_delete_bookmark);
}
