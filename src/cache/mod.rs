#[cfg(feature = "redis")]
pub mod redis;

use std::time::Duration;

use serde::{de::DeserializeOwned, ser::Serialize};

use super::errors::Result;

#[cfg(feature = "redis")]
pub use self::redis::*;

pub trait Provider {
    fn get<K, V, F>(&self, key: &K, ttl: Duration, fun: F) -> Result<V>
    where
        F: FnOnce() -> Result<V>,
        K: Serialize,
        V: DeserializeOwned + Serialize;
    fn clear(&self) -> Result<()>;
}
