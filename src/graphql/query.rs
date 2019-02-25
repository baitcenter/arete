use juniper::FieldResult;
use validator::Validate;

use super::super::{env::VERSION, i18n, plugins::nut};
use super::{BigSerial, Context, Handler};

pub struct Query;

graphql_object!(Query: Context |&self| {
    field apiVersion() -> &str {
         VERSION
    }

    field listLocaleByLang(&executor, lang: String) -> FieldResult<Vec<i18n::graphql::Item>> {
        __graphql!(executor, &i18n::graphql::ByLang{lang: lang.clone()})
    }
    field availableLanguage(&executor) -> FieldResult<Vec<String>> {
        __graphql!(executor, &i18n::graphql::Languages)
    }
    field currentUser(&executor) -> FieldResult<Option<nut::graphql::users::Info>> {
        __graphql!(executor, &nut::graphql::users::Current)
    }

    field userLogs(&executor, limit: BigSerial) -> FieldResult<Vec<nut::graphql::users::Log>> {
        __graphql!(executor, &nut::graphql::users::Logs{limit: limit.0})
    }
    field indexUser(&executor) -> FieldResult<Vec<nut::graphql::users::Info>> {
        __graphql!(executor, &nut::graphql::users::Index{})
    }
    field showUser(&executor, uid: String) -> FieldResult<nut::graphql::users::Info> {
        __graphql!(executor, &nut::graphql::users::Show{uid: uid.clone()})
    }
    field getUserAuthority(&executor, uid: String) -> FieldResult<Vec<nut::graphql::users::Authority>> {
        __graphql!(executor, &nut::graphql::users::GetAuthority{uid: uid.clone()})
    }

    field indexLeaveWord(&executor, limit: BigSerial) -> FieldResult<Vec<nut::graphql::leave_words::LeaveWord>> {
        __graphql!(executor, &nut::graphql::leave_words::Index{limit: limit.0})
    }
});
