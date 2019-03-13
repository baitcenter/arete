use actix_web::http::StatusCode;

use super::super::{
    errors::{Error, Result},
    i18n::I18n,
    jwt::Jwt,
    orm::Connection,
    plugins::nut::{
        graphql::users::{Action, Token},
        models::{
            policy::{Dao as PolicyDao, Role},
            user::{Dao as UserDao, Item as User},
        },
    },
    request::{ClientIp, Home, Locale, Token as Auth},
};
use super::context::Context;

pub struct Session {
    pub lang: String,
    pub home: String,
    pub user: Option<User>,
    pub client_ip: Option<String>,
}

impl Session {
    pub fn new(
        ctx: &Context,
        home: Home,
        client_ip: ClientIp,
        locale: Option<Locale>,
        token: Option<Auth>,
    ) -> Self {
        if let Ok(db) = ctx.db() {
            return Self {
                home: home.0,
                user: Self::user(&ctx.jwt, &db, token),
                client_ip: Some(client_ip.0),
                lang: Self::locale(&db, locale),
            };
        }

        Self {
            home: home.0,
            user: None,
            client_ip: Some(client_ip.0),
            lang: Locale::default().0,
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

    fn user(jwt: &Jwt, db: &Connection, token: Option<Auth>) -> Option<User> {
        if let Some(token) = token {
            if let Ok(token) = jwt.parse::<Token>(&token.0) {
                let token = token.claims;
                if token.act == Action::SignIn {
                    if let Ok(user) = UserDao::by_uid(db, &token.uid) {
                        if let Ok(_) = user.available() {
                            return Some(user);
                        }
                    }
                }
            }
        };

        None
    }

    fn locale(db: &Connection, locale: Option<Locale>) -> String {
        if let Some(it) = locale {
            if I18n::exist(db, &it.0) {
                return it.0;
            }
        }
        Locale::default().0
    }
}
