use std::ops::Deref;

use rocket_contrib::json::Json;

use super::super::super::super::super::{errors::JsonResult, orm::Database};
use super::super::super::super::nut::api::users::Administrator;

use super::super::models::log::{Dao as LogDao, Item as Log};

#[get("/logs?<limit>")]
pub fn index(db: Database, limit: i64, _user: Administrator) -> JsonResult<Vec<Log>> {
    let db = db.deref();
    let items = LogDao::all(db, limit)?;
    Ok(Json(items))
}
