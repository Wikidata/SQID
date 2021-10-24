use std::num::ParseIntError;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Property(pub(crate) u64);

impl Property {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl TryFrom<String> for Property {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(str.parse()?))
    }
}

impl From<Property> for String {
    fn from(property: Property) -> Self {
        format!("{}", property.0)
    }
}

impl From<u64> for Property {
    fn from(id: u64) -> Self {
        Self(id)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Class(pub(crate) u64);

impl Class {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl TryFrom<String> for Class {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(str.parse()?))
    }
}

impl From<Class> for String {
    fn from(class: Class) -> Self {
        format!("{}", class.0)
    }
}

impl From<u64> for Class {
    fn from(id: u64) -> Self {
        Self(id)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Qualifier(pub(crate) u64);

impl Qualifier {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl TryFrom<String> for Qualifier {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(str.parse()?))
    }
}

impl From<Qualifier> for String {
    fn from(qualifier: Qualifier) -> Self {
        format!("{}", qualifier.0)
    }
}

impl From<u64> for Qualifier {
    fn from(id: u64) -> Self {
        Self(id)
    }
}
