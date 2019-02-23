pub mod graphql;
pub mod models;
pub mod schema;

use super::super::orm::migration::New as Migration;

lazy_static! {
    pub static ref MIGRATION: Migration<'static> = Migration {
        name: "create-survey",
        version: "20190101053114",
        up: include_str!("up.sql"),
        down: include_str!("down.sql"),
    };
}
