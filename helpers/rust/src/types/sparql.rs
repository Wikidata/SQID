use serde::{Deserialize, Serialize};

use super::{
    ids::{Entity, Item, Property, Qualifier, Reference},
    json::Type,
    Count,
};

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct PropertyLabelAndType {
    #[serde(rename = "id")]
    pub(crate) property: Entity,
    #[serde(rename = "label")]
    pub(crate) label: String,
    #[serde(rename = "type")]
    pub(crate) datatype: Type,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(untagged)]
pub enum PropertyUsageType {
    Statement(Property),
    Qualifier(Qualifier),
    Reference(Reference),
}

impl PropertyUsageType {
    pub fn property(&self) -> Property {
        match self {
            Self::Statement(property) => *property,
            Self::Qualifier(qualifier) => qualifier.to_property(),
            Self::Reference(reference) => reference.to_property(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct PropertyUsage {
    #[serde(rename = "p")]
    pub(crate) property: PropertyUsageType,
    #[serde(rename = "c")]
    pub(crate) count: Count,
}

impl PropertyUsage {
    pub fn property(&self) -> Property {
        self.property.property()
    }
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct ClassLabelAndUsage {
    #[serde(rename = "id")]
    pub(crate) class: Item,
    #[serde(rename = "label")]
    pub(crate) label: String,
    #[serde(rename = "c")]
    pub(crate) usage: Option<Count>,
}
