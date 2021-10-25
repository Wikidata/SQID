use std::num::ParseIntError;

use serde::{Deserialize, Serialize};

const ENTITY: &str = "http://www.wikidata.org/entity/";
const PROPERTY: &str = "http://www.wikidata.org/prop/";
const QUALIFIER: &str = "http://www.wikidata.org/prop/qualifier/";
const REFERENCE: &str = "http://www.wikidata.org/prop/reference/";

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum EntityKind {
    Item,
    Property,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Entity {
    id: u64,
    kind: EntityKind,
}

impl Entity {
    pub fn item(id: u64) -> Self {
        Self {
            id,
            kind: EntityKind::Item,
        }
    }

    pub fn property(id: u64) -> Self {
        Self {
            id,
            kind: EntityKind::Property,
        }
    }
}

impl TryFrom<String> for Entity {
    type Error = anyhow::Error;

    fn try_from(str: String) -> anyhow::Result<Self> {
        use anyhow::Context;

        let item = format!("{}Q", ENTITY);
        let prop = format!("{}P", ENTITY);

        if let Some(qid) = str.strip_prefix(&item) {
            Ok(Self::item(qid.parse().context("Failed to parse QID")?))
        } else if let Some(pid) = str.strip_prefix(&prop) {
            Ok(Self::property(pid.parse().context("Failed to parse PID")?))
        } else {
            anyhow::bail!("Invalid entity prefix")
        }
    }
}

impl From<Entity> for String {
    fn from(entity: Entity) -> Self {
        match entity.kind {
            EntityKind::Item => format!("Q{}", entity.id),
            EntityKind::Property => format!("P{}", entity.id),
        }
    }
}

impl From<Item> for Entity {
    fn from(item: Item) -> Self {
        Self {
            id: item.0,
            kind: EntityKind::Item,
        }
    }
}

impl From<Property> for Entity {
    fn from(property: Property) -> Self {
        Self {
            id: property.0,
            kind: EntityKind::Property,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Item(pub(crate) u64);

impl Item {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl TryFrom<String> for Item {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(
            str.strip_prefix(&format!("{}Q", ENTITY))
                .unwrap_or(&str)
                .parse()?,
        ))
    }
}

impl From<Item> for String {
    fn from(class: Item) -> Self {
        format!("{}", class.0)
    }
}

impl From<u64> for Item {
    fn from(id: u64) -> Self {
        Self(id)
    }
}

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
        Ok(Self(
            str.strip_prefix(&format!("{}P", PROPERTY))
                .unwrap_or(&str)
                .parse()?,
        ))
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
pub struct Qualifier(pub(crate) u64);

impl Qualifier {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl TryFrom<String> for Qualifier {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(
            str.strip_prefix(&format!("{}P", QUALIFIER))
                .unwrap_or(&str)
                .parse()?,
        ))
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

#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Reference(pub(crate) u64);

impl Reference {
    pub fn new(id: u64) -> Self {
        Self(id)
    }
}

impl TryFrom<String> for Reference {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(
            str.strip_prefix(&format!("{}P", REFERENCE))
                .unwrap_or(&str)
                .parse()?,
        ))
    }
}

impl From<Reference> for String {
    fn from(reference: Reference) -> Self {
        format!("{}", reference.0)
    }
}

impl From<u64> for Reference {
    fn from(id: u64) -> Self {
        Self(id)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use std::convert::TryInto;

    use test_env_log::test;

    #[test]
    fn entity_from_string() {
        assert_eq!(
            Entity::try_from("http://www.wikidata.org/entity/Q42".to_string()).unwrap(),
            Entity::item(42),
        );
        assert_eq!(
            Entity::try_from("http://www.wikidata.org/entity/P31".to_string()).unwrap(),
            Entity::property(31)
        );
        assert!(Entity::try_from("http://www.wikidata.org/prop/P31".to_string()).is_err());
    }

    #[test]
    fn item_from_string() {
        assert_eq!(
            "http://www.wikidata.org/entity/Q42".to_string().try_into(),
            Ok(Item(42))
        );
        assert!(Item::try_from("http://www.wikidata.org/entity/P31".to_string()).is_err());
    }

    #[test]
    fn property_from_string() {
        assert_eq!(
            "http://www.wikidata.org/prop/P31".to_string().try_into(),
            Ok(Property(31))
        );
        assert!(
            Property::try_from("http://www.wikidata.org/prop/qualifier/P31".to_string()).is_err()
        );
        assert!(
            Property::try_from("http://www.wikidata.org/prop/reference/P31".to_string()).is_err()
        );
        assert!(Property::try_from("http://www.wikidata.org/entity/Q42".to_string()).is_err());
    }

    #[test]
    fn qualifier_from_string() {
        assert_eq!(
            "http://www.wikidata.org/prop/qualifier/P31"
                .to_string()
                .try_into(),
            Ok(Qualifier(31))
        );
        assert!(Qualifier::try_from("http://www.wikidata.org/prop/P31".to_string()).is_err());
        assert!(
            Qualifier::try_from("http://www.wikidata.org/prop/reference/P31".to_string()).is_err()
        );
        assert!(Qualifier::try_from("http://www.wikidata.org/entity/Q42".to_string()).is_err());
    }

    #[test]
    fn reference_from_string() {
        assert_eq!(
            "http://www.wikidata.org/prop/reference/P31"
                .to_string()
                .try_into(),
            Ok(Reference(31))
        );
        assert!(Reference::try_from("http://www.wikidata.org/prop/P31".to_string()).is_err());
        assert!(
            Reference::try_from("http://www.wikidata.org/prop/qualifier/P31".to_string()).is_err()
        );
        assert!(Reference::try_from("http://www.wikidata.org/entity/Q42".to_string()).is_err());
    }
}
