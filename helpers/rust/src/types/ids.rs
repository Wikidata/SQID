use std::{marker::PhantomData, num::ParseIntError, str::FromStr};

use serde::{
    de::{self, Visitor},
    Deserialize, Deserializer, Serialize, Serializer,
};

#[derive(Debug, PartialEq, Eq, Hash, Deserialize, Serialize)]
pub struct Property(#[serde(with = "crate::types::ids")] pub(crate) u64);

impl Property {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl FromStr for Property {
    type Err = ParseIntError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Property(u64::from_str(s)?))
    }
}

impl ToString for Property {
    fn to_string(&self) -> String {
        format!("{}", self.0)
    }
}

impl From<u64> for Property {
    fn from(id: u64) -> Self {
        Self(id)
    }
}

#[derive(Debug, PartialEq, Eq, Hash, Deserialize, Serialize)]
pub struct Class(#[serde(with = "crate::types::ids")] pub(crate) u64);

impl Class {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl FromStr for Class {
    type Err = ParseIntError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Class(u64::from_str(s)?))
    }
}

impl ToString for Class {
    fn to_string(&self) -> String {
        format!("{}", self.0)
    }
}

impl From<u64> for Class {
    fn from(id: u64) -> Self {
        Self(id)
    }
}

#[derive(Debug, PartialEq, Eq, Hash, Deserialize, Serialize)]
pub struct Qualifier(#[serde(with = "crate::types::ids")] pub(crate) u64);

impl Qualifier {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl FromStr for Qualifier {
    type Err = ParseIntError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Qualifier(u64::from_str(s)?))
    }
}

impl ToString for Qualifier {
    fn to_string(&self) -> String {
        format!("{}", self.0)
    }
}

impl From<u64> for Qualifier {
    fn from(id: u64) -> Self {
        Self(id)
    }
}

pub(crate) fn deserialize<'de, T, D>(deserializer: D) -> Result<T, D::Error>
where
    T: Deserialize<'de> + FromStr<Err = ParseIntError> + From<u64>,
    D: Deserializer<'de>,
{
    struct StringOrNumber<T>(PhantomData<fn() -> T>);

    impl<'de, T> Visitor<'de> for StringOrNumber<T>
    where
        T: Deserialize<'de> + FromStr<Err = ParseIntError> + From<u64>,
    {
        type Value = T;

        fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
            formatter.write_str("string or number")
        }

        fn visit_str<E>(self, value: &str) -> Result<T, E>
        where
            E: de::Error,
            T: FromStr,
        {
            Ok(FromStr::from_str(value).map_err(de::Error::custom)?)
        }

        fn visit_u64<E>(self, value: u64) -> Result<T, E>
        where
            E: de::Error,
        {
            Ok(value.into())
        }
    }

    deserializer.deserialize_any(StringOrNumber(PhantomData))
}

pub(crate) fn serialize<T, S>(t: T, serializer: S) -> Result<S::Ok, S::Error>
where
    T: ToString,
    S: Serializer,
{
    serializer.serialize_str(&t.to_string())
}
