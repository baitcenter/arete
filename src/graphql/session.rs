use std::ops::Deref;

use hyper::{Request, StatusCode};

use super::super::{
    errors::{Error, Result},
    i18n::I18n,
    jwt::Jwt,
    orm::Connection,
    plugins::nut::{
        graphql::mutation::users::{Action, Token},
        models::{
            policy::{Dao as PolicyDao, Role},
            user::{Dao as UserDao, Item as User},
        },
    },
    request::{FromRequest, Locale, Token as TokenS},
};
use super::context::Context;

pub struct Session {
    pub client_ip: Option<String>,
    pub user: Option<User>,
    pub lang: String,
}

impl Session {
    const DEFAULT_LANG: &'static str = "en-US";
    pub fn new<S>(ctx: &Context, req: &Request<S>) -> Self {
        if let Ok(db) = ctx.db() {
            let db = db.deref();
            return Self {
                user: match Self::user(&ctx.jwt, db, req) {
                    Ok(v) => v,
                    Err(e) => {
                        error!("{}", e);
                        None
                    }
                },
                lang: Self::locale(db, req),
            };
        }

        Self {
            user: None,
            lang: Self::DEFAULT_LANG.to_string(),
        }
    }

    pub fn administrator(&self, db: &Connection) -> Result<&User> {
        let user = self.current_user()?;
        if PolicyDao::can(db, &user.id, &Role::Admin, &None) {
            return Ok(user);
        }
        Err(Error::Http(StatusCode::FORBIDDEN).into())
    }

    pub fn auth(&self, db: &Connection, role: &Role, resource: &Option<String>) -> Result<&User> {
        let user = self.current_user()?;
        if PolicyDao::can(db, &user.id, role, resource) {
            return Ok(user);
        }
        self.administrator(db)
    }

    pub fn current_user(&self) -> Result<&User> {
        match self.user {
            Some(ref v) => Ok(v),
            None => Err(Error::Http(StatusCode::UNAUTHORIZED).into()),
        }
    }

    fn user<S>(jwt: &Jwt, db: &Connection, req: &Request<S>) -> Result<Option<User>> {
        if let Some(token) = TokenS::from_request(req) {
            let token = jwt.parse::<Token>(&token.0)?.claims;
            if token.act == Action::SignIn {
                if let Ok(user) = UserDao::by_uid(db, &token.uid) {
                    if let Ok(_) = user.available() {
                        return Ok(Some(user));
                    }
                }
            }
        };

        Ok(None)
    }

    fn locale<S>(db: &Connection, req: &Request<S>) -> String {
        if let Some(it) = Locale::from_request(req) {
            if I18n::exist(db, &it.0) {
                return it.0;
            }
        }
        Self::DEFAULT_LANG.to_string()
    }
}
