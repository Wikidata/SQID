use std::{
    convert::{TryFrom, TryInto},
    num::ParseIntError,
};

use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};

const ENTITY: &str = "http://www.wikidata.org/entity/";
const PROPERTY: &str = "http://www.wikidata.org/prop/";
const QUALIFIER: &str = "http://www.wikidata.org/prop/qualifier/";
const REFERENCE: &str = "http://www.wikidata.org/prop/reference/";

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash)]
pub enum EntityKind {
    Item,
    Property,
    Lexeme,
    Sense(Lexeme),
    Form(Lexeme),
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
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

    pub fn lexeme(id: u64) -> Self {
        Self {
            id,
            kind: EntityKind::Lexeme,
        }
    }

    pub fn sense(sense: Sense) -> Self {
        Self {
            id: sense.1,
            kind: EntityKind::Sense(sense.0),
        }
    }

    pub fn form(form: Form) -> Self {
        Self {
            id: form.1,
            kind: EntityKind::Form(form.0),
        }
    }

    pub fn as_item(&self) -> Option<Item> {
        match self.kind {
            EntityKind::Item => Some(Item::new(self.id)),
            _ => None,
        }
    }

    pub fn as_property(&self) -> Option<Property> {
        match self.kind {
            EntityKind::Property => Some(Property::new(self.id)),
            _ => None,
        }
    }

    pub fn as_lexeme(&self) -> Option<Lexeme> {
        match self.kind {
            EntityKind::Lexeme => Some(Lexeme::new(self.id)),
            _ => None,
        }
    }

    pub fn as_sense(&self) -> Option<Sense> {
        match self.kind {
            EntityKind::Sense(lexeme) => Some(Sense::new(lexeme, self.id)),
            _ => None,
        }
    }

    pub fn as_form(&self) -> Option<Form> {
        match self.kind {
            EntityKind::Form(lexeme) => Some(Form::new(lexeme, self.id)),
            _ => None,
        }
    }
}

impl TryFrom<String> for Entity {
    type Error = anyhow::Error;

    fn try_from(str: String) -> Result<Self> {
        let item = format!("{}Q", ENTITY);
        let prop = format!("{}P", ENTITY);
        let lex = format!("{}P", ENTITY);

        if let Some(qid) = str.strip_prefix(&item).or_else(|| str.strip_prefix('Q')) {
            Ok(Self::item(qid.parse().context("Failed to parse QID")?))
        } else if let Some(pid) = str.strip_prefix(&prop).or_else(|| str.strip_prefix('P')) {
            Ok(Self::property(pid.parse().context("Failed to parse PID")?))
        } else if let Some(lid) = str.strip_prefix(&lex).or_else(|| str.strip_prefix('L')) {
            if let Ok(lid) = lid.parse() {
                Ok(Self::lexeme(lid))
            } else if let Ok(sense) = Sense::try_from(lid.to_string()) {
                Ok(Self::sense(sense))
            } else if let Ok(form) = Form::try_from(lid.to_string()) {
                Ok(Self::form(form))
            } else {
                Err(anyhow!("Failed to parse LID"))
            }
        } else {
            Err(anyhow!("Invalid entity prefix: {:?}", str))
        }
    }
}

impl From<Entity> for String {
    fn from(entity: Entity) -> Self {
        match entity.kind {
            EntityKind::Item => format!("Q{}", entity.id),
            EntityKind::Property => format!("P{}", entity.id),
            EntityKind::Lexeme => format!("L{}", entity.id),
            EntityKind::Sense(lexeme) => format!("L{}-S{}", lexeme.0, entity.id),
            EntityKind::Form(lexeme) => format!("L{}-F{}", lexeme.0, entity.id),
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

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Item(pub(crate) u64);

pub mod classes {
    use super::Item;

    /// Wikidata property for human relationships
    pub const HUMAN_RELATIONS: Item = Item(229642321);
    /// Wikidata property for Commons
    pub const MEDIA: Item = Item(18610173);
    /// Wikidata property about Wikimedia categories
    pub const WIKIMEDIA_CATEGORIES: Item = Item(18667213);
    /// Wikidata property giving Wikimedia list
    pub const WIKIMEDIA_LIST: Item = Item(22969221);
    /// Wikidata property representing a unique identifier
    pub const UNIQUE_IDENTIFIER: Item = Item(19847637);
    /// Wikidata property for authority control
    pub const AUTHORITY_CONTROL: Item = Item(18614948);
    /// Wikidata property for authority control for people
    pub const AUTHORITY_CONTROL_PEOPLE: Item = Item(19595382);
    /// Wikidata property for authority control for places
    pub const AUTHORITY_CONTROL_PLACES: Item = Item(19829908);
    /// Wikidata property for authority control for works
    pub const AUTHORITY_CONTROL_WORKS: Item = Item(19833377);
    /// Wikidata property for authority control for cultural heritage identification
    pub const AUTHORITY_CONTROL_HERITAGE: Item = Item(18618628);
    /// Wikidata property for authority control for organisations
    pub const AUTHORITY_CONTROL_ORGANISATIONS: Item = Item(21745557);
    /// Wikidata property for authority control for substances
    pub const AUTHORITY_CONTROL_SUBSTANCES: Item = Item(19833835);
    /// Wikidata property for identification in the film industry
    pub const FILM_INDUSTRY_ID: Item = Item(22964274);
}

impl Item {
    pub fn new(id: u64) -> Self {
        Self(id)
    }

    pub fn is_ids_class(&self) -> bool {
        matches!(
            *self,
            classes::UNIQUE_IDENTIFIER
                | classes::AUTHORITY_CONTROL
                | classes::AUTHORITY_CONTROL_PEOPLE
                | classes::AUTHORITY_CONTROL_PLACES
                | classes::AUTHORITY_CONTROL_WORKS
                | classes::AUTHORITY_CONTROL_HERITAGE
                | classes::AUTHORITY_CONTROL_ORGANISATIONS
                | classes::AUTHORITY_CONTROL_SUBSTANCES
                | classes::FILM_INDUSTRY_ID
        )
    }

    pub fn is_human_relations_class(&self) -> bool {
        matches!(*self, classes::HUMAN_RELATIONS)
    }

    pub fn is_media_class(&self) -> bool {
        matches!(*self, classes::MEDIA)
    }

    pub fn is_wiki_class(&self) -> bool {
        matches!(
            *self,
            classes::WIKIMEDIA_CATEGORIES | classes::WIKIMEDIA_LIST
        )
    }
}

impl TryFrom<String> for Item {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(
            str.strip_prefix(&format!("{}Q", ENTITY))
                .or_else(|| str.strip_prefix('Q'))
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

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Property(pub(crate) u64);

pub mod properties {
    use super::Property;

    /// Instance of
    pub const INSTANCE_OF: Property = Property(31);
    /// Subclass of
    pub const SUBCLASS_OF: Property = Property(279);
    /// Topic's main category
    pub const TOPIC_MAIN_CATEGORY: Property = Property(910);
    /// Topic's Main Wikimedia portal
    pub const TOPIC_MAIN_WIKIMEDIA_PORTAL: Property = Property(1151);
    /// Wikipedia portal's main topic
    pub const PORTAL_MAIN_TOPIC: Property = Property(1204);
}

impl Property {
    pub fn new(id: u64) -> Self {
        Self(id)
    }

    pub fn is_hierarchy_property(&self) -> bool {
        matches!(*self, properties::INSTANCE_OF | properties::SUBCLASS_OF)
    }

    pub fn is_wiki_property(&self) -> bool {
        matches!(
            *self,
            properties::TOPIC_MAIN_CATEGORY
                | properties::TOPIC_MAIN_WIKIMEDIA_PORTAL
                | properties::PORTAL_MAIN_TOPIC
        )
    }
}

impl TryFrom<String> for Property {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(
            str.strip_prefix(&format!("{}P", PROPERTY))
                .or_else(|| str.strip_prefix('P'))
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

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Qualifier(pub(crate) u64);

impl Qualifier {
    pub fn new(id: u64) -> Self {
        Self(id)
    }

    pub(crate) fn to_property(self) -> Property {
        Property(self.0)
    }
}

impl From<Property> for Qualifier {
    fn from(prop: Property) -> Self {
        Self(prop.0)
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

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Reference(pub(crate) u64);

impl Reference {
    pub fn new(id: u64) -> Self {
        Self(id)
    }

    pub(crate) fn to_property(self) -> Property {
        Property(self.0)
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

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Lexeme(pub(crate) u64);

impl Lexeme {
    fn new(id: u64) -> Self {
        Self(id)
    }
}

impl TryFrom<String> for Lexeme {
    type Error = ParseIntError;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        Ok(Self(
            str.strip_prefix(&format!("{}L", ENTITY))
                .or_else(|| str.strip_prefix('L'))
                .unwrap_or(&str)
                .parse()?,
        ))
    }
}

impl From<Lexeme> for String {
    fn from(lexeme: Lexeme) -> Self {
        format!("{}", lexeme.0)
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Sense(pub(crate) Lexeme, pub(crate) u64);

impl Sense {
    fn new(lexeme: Lexeme, id: u64) -> Self {
        Self(lexeme, id)
    }
}

impl TryFrom<String> for Sense {
    type Error = anyhow::Error;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        let (lexeme, sense) = str.rsplit_once('-').context("Failed splitting sense ID")?;
        Ok(Self(
            lexeme
                .to_string()
                .try_into()
                .context("Failed to parse lexeme ID")?,
            sense.strip_prefix('S').unwrap_or(sense).parse()?,
        ))
    }
}

impl From<Sense> for String {
    fn from(sense: Sense) -> Self {
        format!("{}-S{}", sense.0 .0, sense.1)
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct Form(pub(crate) Lexeme, pub(crate) u64);

impl Form {
    fn new(lexeme: Lexeme, id: u64) -> Self {
        Self(lexeme, id)
    }
}

impl TryFrom<String> for Form {
    type Error = anyhow::Error;

    fn try_from(str: String) -> Result<Self, Self::Error> {
        let (lexeme, form) = str.rsplit_once('-').context("Failed splitting form ID")?;
        Ok(Self(
            lexeme
                .to_string()
                .try_into()
                .context("Failed to parse lexeme ID")?,
            form.strip_prefix('F').unwrap_or(form).parse()?,
        ))
    }
}

impl From<Form> for String {
    fn from(sense: Form) -> Self {
        format!("{}-F{}", sense.0 .0, sense.1)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use std::convert::TryInto;

    use test_log::test;

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
