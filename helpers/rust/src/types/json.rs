use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use std::collections::{HashMap, HashSet};
use strum::{Display, EnumIter, EnumString};

use super::{
    ids::{Item, Property, Qualifier},
    is_zero,
    sparql::{PropertyLabelAndType, PropertyUsage, PropertyUsageType},
    ClassLabelAndUsage,
};

const ENGLISH: &str = "en";

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize, Display, EnumString, EnumIter,
)]
pub enum Type {
    #[strum(
        to_string = "WikibaseItem",
        serialize = "http://wikiba.se/ontology#WikibaseItem"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#WikibaseItem",
        alias = "wikibase-item"
    )]
    WikibaseItem,
    #[strum(
        to_string = "WikibaseProperty",
        serialize = "http://wikiba.se/ontology#WikibaseProperty"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#WikibaseProperty",
        alias = "wikibase-property"
    )]
    WikibaseProperty,
    #[strum(
        to_string = "WikibaseLexeme",
        serialize = "http://wikiba.se/ontology#WikibaseLexeme"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#WikibaseLexeme",
        alias = "wikibase-lexeme"
    )]
    WikibaseLexeme,
    #[strum(
        to_string = "WikibaseForm",
        serialize = "http://wikiba.se/ontology#WikibaseForm"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#WikibaseForm",
        alias = "wikibase-form"
    )]
    WikibaseForm,
    #[strum(
        to_string = "WikibaseSense",
        serialize = "http://wikiba.se/ontology#WikibaseSense"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#WikibaseSense",
        alias = "wikibase-sense"
    )]
    WikibaseSense,
    #[strum(
        to_string = "WikibaseMediaInfo",
        serialize = "http://wikiba.se/ontology#WikibaseMediaInfo"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#WikibaseMediaInfo",
        alias = "wikibase-media-info"
    )]
    WikibaseMediaInfo,
    #[strum(to_string = "String", serialize = "http://wikiba.se/ontology#String")]
    #[serde(alias = "http://wikiba.se/ontology#String", alias = "string")]
    String,
    #[strum(to_string = "Url", serialize = "http://wikiba.se/ontology#Url")]
    #[serde(alias = "http://wikiba.se/ontology#Url", alias = "url")]
    Url,
    #[strum(
        to_string = "CommonsMedia",
        serialize = "http://wikiba.se/ontology#CommonsMedia"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#CommonsMedia",
        alias = "commonsMedia"
    )]
    CommonsMedia,
    #[strum(to_string = "Time", serialize = "http://wikiba.se/ontology#Time")]
    #[serde(alias = "http://wikiba.se/ontology#Time", alias = "time")]
    Time,
    #[strum(
        to_string = "GlobeCoordinate",
        serialize = "http://wikiba.se/ontology#GlobeCoordinate"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#GlobeCoordinate",
        alias = "globe-coordinate"
    )]
    GlobeCoordinate,
    #[strum(
        to_string = "Quantity",
        serialize = "http://wikiba.se/ontology#Quantity"
    )]
    #[serde(alias = "http://wikiba.se/ontology#Quantity", alias = "quantity")]
    Quantity,
    #[strum(
        to_string = "Monolingualtext",
        serialize = "http://wikiba.se/ontology#Monolingualtext"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#Monolingualtext",
        alias = "monolingualtext"
    )]
    Monolingualtext,
    #[strum(
        to_string = "ExternalId",
        serialize = "http://wikiba.se/ontology#ExternalId"
    )]
    #[serde(alias = "http://wikiba.se/ontology#ExternalId", alias = "external-id")]
    ExternalId,
    #[strum(to_string = "Math", serialize = "http://wikiba.se/ontology#Math")]
    #[serde(alias = "http://wikiba.se/ontology#Math", alias = "math")]
    Math,
    #[strum(
        to_string = "GeoShape",
        serialize = "http://wikiba.se/ontology#GeoShape"
    )]
    #[serde(alias = "http://wikiba.se/ontology#GeoShape", alias = "geo-shape")]
    GeoShape,
    #[strum(
        to_string = "TabularData",
        serialize = "http://wikiba.se/ontology#TabularData"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#TabularData",
        alias = "tabular-data"
    )]
    TabularData,
    #[strum(
        to_string = "MusicalNotation",
        serialize = "http://wikiba.se/ontology#MusicalNotation"
    )]
    #[serde(
        alias = "http://wikiba.se/ontology#MusicalNotation",
        alias = "musical-notation"
    )]
    MusicalNotation,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub enum PropertyClassification {
    #[serde(rename = "f")]
    Family,
    #[serde(rename = "h")]
    Hierarchy,
    #[serde(rename = "i")]
    Ids,
    #[serde(rename = "m")]
    Media,
    #[serde(rename = "o")]
    Other,
    #[serde(rename = "w")]
    Wiki,
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct PropertyRecord {
    #[serde(rename = "l", skip_serializing_if = "Option::is_none")]
    pub(crate) label: Option<String>,
    #[serde(rename = "d", skip_serializing_if = "Option::is_none")]
    pub(crate) datatype: Option<Type>,
    #[serde(rename = "i", skip_serializing_if = "is_zero")]
    pub(crate) in_items: usize,
    #[serde(rename = "s", skip_serializing_if = "is_zero")]
    pub(crate) in_statements: usize,
    #[serde(rename = "q", skip_serializing_if = "is_zero")]
    pub(crate) in_qualifiers: usize,
    #[serde(rename = "e", skip_serializing_if = "is_zero")]
    pub(crate) in_references: usize,
    #[serde(rename = "u", skip_serializing_if = "Option::is_none")]
    pub(crate) url_pattern: Option<String>,
    #[serde(rename = "pc", skip_serializing_if = "Vec::is_empty")]
    pub(crate) instance_of: Vec<Item>,
    #[serde(rename = "qs", skip_serializing_if = "HashMap::is_empty")]
    pub(crate) with_qualifiers: HashMap<Qualifier, usize>,
    #[serde(rename = "r", skip_serializing_if = "HashMap::is_empty")]
    pub(crate) related_properties: HashMap<Property, usize>,
    #[serde(skip)]
    pub(crate) cooccurrences: HashMap<Property, usize>,
}

impl PropertyRecord {
    pub fn update_label_and_type(&mut self, label: String, datatype: Type) {
        self.label = Some(label);
        self.datatype = Some(datatype);
    }

    pub fn update_usage(&mut self, usage: &PropertyUsage) {
        match usage.property {
            PropertyUsageType::Statement(_) => self.in_statements += usage.count,
            PropertyUsageType::Qualifier(_) => self.in_qualifiers += usage.count,
            PropertyUsageType::Reference(_) => self.in_references += usage.count,
        }
    }

    pub fn project_to_usage(&self) -> PropertyUsageRecord {
        PropertyUsageRecord {
            label: None,
            in_items: self.in_items,
            in_statements: self.in_statements,
            in_qualifiers: self.in_qualifiers,
            in_references: self.in_references,
            instance_of: self.instance_of.clone(),
            with_qualifiers: self.with_qualifiers.clone(),
        }
    }

    fn is_id(&self) -> bool {
        matches!(self.datatype, Some(Type::ExternalId))
            || self.instance_of.iter().any(|class| class.is_ids_class())
    }

    fn is_media(&self) -> bool {
        matches!(self.datatype, Some(Type::CommonsMedia))
            || self.instance_of.iter().any(|class| class.is_media_class())
    }

    fn is_human_relation(&self) -> bool {
        self.instance_of
            .iter()
            .any(|class| class.is_human_relations_class())
    }

    pub fn classification(&self, property_id: &Property) -> PropertyClassification {
        if property_id.is_hierarchy_property() {
            PropertyClassification::Hierarchy
        } else if self.is_id() {
            PropertyClassification::Ids
        } else if self.is_human_relation() {
            PropertyClassification::Family
        } else if self.is_media() {
            PropertyClassification::Media
        } else if property_id.is_wiki_property()
            || self.instance_of.iter().any(|class| class.is_wiki_class())
        {
            PropertyClassification::Wiki
        } else {
            PropertyClassification::Other
        }
    }
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct PropertyUsageRecord {
    #[serde(rename = "l", skip_serializing_if = "Option::is_none")]
    pub(crate) label: Option<String>,
    #[serde(rename = "i", skip_serializing_if = "is_zero")]
    pub(crate) in_items: usize,
    #[serde(rename = "s", skip_serializing_if = "is_zero")]
    pub(crate) in_statements: usize,
    #[serde(rename = "q", skip_serializing_if = "is_zero")]
    pub(crate) in_qualifiers: usize,
    #[serde(rename = "e", skip_serializing_if = "is_zero")]
    pub(crate) in_references: usize,
    #[serde(rename = "pc", skip_serializing_if = "Vec::is_empty")]
    pub(crate) instance_of: Vec<Item>,
    #[serde(rename = "qs", skip_serializing_if = "HashMap::is_empty")]
    pub(crate) with_qualifiers: HashMap<Qualifier, usize>,
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
pub struct Properties(pub(crate) HashMap<Property, PropertyRecord>);

impl Properties {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Default::default()
    }

    pub(crate) fn update_labels_and_types<I: Iterator<Item = PropertyLabelAndType>>(
        &mut self,
        iterator: I,
    ) {
        iterator.for_each(|item| {
            if let Some(property) = item.property.as_property() {
                let entry = self.0.entry(property).or_default();
                entry.update_label_and_type(item.label, item.datatype);
            };
        });
    }

    pub(crate) fn update_usage<I: Iterator<Item = PropertyUsage>>(&mut self, iterator: I) {
        iterator.for_each(|usage| {
            let entry = self.0.entry(usage.property()).or_default();
            entry.update_usage(&usage);
        });
    }
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct ClassRecord {
    #[serde(rename = "l", skip_serializing_if = "Option::is_none")]
    pub(crate) label: Option<String>,
    #[serde(rename = "i", skip_serializing_if = "is_zero")]
    pub(crate) direct_instances: usize,
    #[serde(rename = "s", skip_serializing_if = "is_zero")]
    pub(crate) direct_subclasses: usize,
    #[serde(rename = "ai", skip_serializing_if = "is_zero")]
    pub(crate) all_instances: usize,
    #[serde(rename = "as", skip_serializing_if = "is_zero")]
    pub(crate) all_subclasses: usize,
    #[serde(rename = "sc", skip_serializing_if = "HashSet::is_empty")]
    pub(crate) superclasses: HashSet<Item>,
    #[serde(rename = "sb", skip_serializing_if = "HashSet::is_empty")]
    pub(crate) non_empty_subclasses: HashSet<Item>,
    #[serde(rename = "r", skip_serializing_if = "HashMap::is_empty")]
    pub(crate) related_properties: HashMap<Property, usize>,
    #[serde(skip)]
    pub(crate) cooccurrences: HashMap<Property, usize>,
    #[serde(skip)]
    pub(crate) direct_superclasses: HashSet<Item>,
}

impl ClassRecord {
    pub(crate) fn update_label_and_usage(&mut self, label: String, usage: Option<usize>) {
        let _ = self.label.insert(label);
        if let Some(direct_instances) = usage {
            self.direct_instances = direct_instances
        }
    }

    pub(crate) fn project_to_hierarchy(&self) -> ClassRecord {
        ClassRecord {
            label: None,
            direct_instances: self.direct_instances,
            direct_subclasses: self.direct_subclasses,
            all_instances: self.all_instances,
            all_subclasses: self.all_subclasses,
            superclasses: self.superclasses.clone(),
            non_empty_subclasses: self.non_empty_subclasses.clone(),
            related_properties: self.related_properties.clone(),
            cooccurrences: HashMap::new(),
            direct_superclasses: HashSet::new(),
        }
    }
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct Classes(pub(crate) HashMap<Item, ClassRecord>);

impl Classes {
    pub(crate) fn update_labels_and_usage<I: Iterator<Item = ClassLabelAndUsage>>(
        &mut self,
        iterator: I,
    ) {
        iterator.for_each(|item| {
            let entry = self.0.entry(item.class).or_default();
            entry.update_label_and_usage(item.label, item.usage);
        });
    }
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct EntityStatistics {
    #[serde(rename = "cDesc")]
    pub(crate) descriptions: usize,
    #[serde(rename = "cStmts")]
    pub(crate) statements: usize,
    #[serde(rename = "cLabels")]
    pub(crate) labels: usize,
    #[serde(rename = "cAliases")]
    pub(crate) aliases: usize,
    #[serde(rename = "c")]
    pub(crate) count: usize,
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct SiteRecord {
    #[serde(rename = "u", skip_serializing_if = "Option::is_none")]
    pub(crate) url_pattern: Option<String>,
    #[serde(rename = "g", skip_serializing_if = "Option::is_none")]
    pub(crate) group: Option<String>,
    #[serde(rename = "l", skip_serializing_if = "Option::is_none")]
    pub(crate) language: Option<String>,
    #[serde(rename = "i")]
    pub(crate) items: usize,
}

impl SiteRecord {
    pub fn new(group: String, language: String, url_pattern: String) -> Self {
        Self {
            group: Some(group),
            language: Some(language),
            url_pattern: Some(url_pattern),
            items: 0,
        }
    }
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Statistics {
    #[serde(
        rename = "propertyUpdate",
        with = "formats::timestamp",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub(crate) property_update: Option<DateTime<Utc>>,
    #[serde(
        rename = "classUpdate",
        with = "formats::timestamp",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub(crate) class_update: Option<DateTime<Utc>>,
    #[serde(
        rename = "dumpDate",
        with = "formats::date",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub(crate) dump_date: Option<NaiveDate>,
    #[serde(rename = "propertyStatistics")]
    pub(crate) properties: EntityStatistics,
    #[serde(rename = "itemStatistics")]
    pub(crate) items: EntityStatistics,
    #[serde(skip_serializing_if = "HashMap::is_empty")]
    pub(crate) sites: HashMap<String, SiteRecord>,
}

impl Statistics {
    pub(crate) fn update_sitelinks(
        &mut self,
        sitelinks: impl Iterator<Item = (String, SiteRecord)>,
    ) {
        sitelinks.for_each(|(site, record)| {
            *self.sites.entry(site).or_default() = record;
        });
    }
}

pub(crate) mod dump {
    use super::*;
    use crate::types::ids::Entity;

    #[derive(Debug, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase", tag = "type")]
    pub enum Record {
        Item {
            id: Item,
            sitelinks: HashMap<String, Sitelink>,
            #[serde(flatten)]
            common: CommonData,
        },
        Property {
            id: Property,
            datatype: Type,
            #[serde(flatten)]
            common: CommonData,
        },
    }

    #[derive(Debug, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct CommonData {
        #[serde(skip_serializing_if = "HashMap::is_empty")]
        pub(crate) labels: HashMap<String, LanguageValue>,
        #[serde(skip_serializing_if = "HashMap::is_empty")]
        pub(crate) descriptions: HashMap<String, LanguageValue>,
        #[serde(skip_serializing_if = "HashMap::is_empty")]
        pub(crate) aliases: HashMap<String, Vec<LanguageValue>>,
        #[serde(skip_serializing_if = "HashMap::is_empty")]
        pub(crate) claims: HashMap<Property, Vec<Statement>>,
        lastrevid: usize,
        #[serde(
            with = "formats::timestamp",
            default,
            skip_serializing_if = "Option::is_none"
        )]
        modified: Option<DateTime<Utc>>,
    }

    impl CommonData {
        pub(crate) fn label_for(&self, language: &str) -> Option<String> {
            self.labels.get(language).map(|label| label.value.clone())
        }

        pub(crate) fn label(&self) -> Option<String> {
            self.label_for(ENGLISH)
        }
    }

    #[derive(Debug, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase", tag = "type")]
    pub enum Statement {
        Statement {
            id: String,
            mainsnak: Snak,
            #[serde(default)]
            rank: Rank,
            #[serde(default)]
            qualifiers: HashMap<Property, Vec<Snak>>,
            #[serde(default, skip_serializing_if = "Vec::is_empty")]
            qualifiers_order: Vec<Property>,
            #[serde(default, skip_serializing_if = "Vec::is_empty")]
            references: Vec<Reference>,
        },
    }

    impl Statement {
        pub fn mainsnak(&self) -> &Snak {
            match self {
                Statement::Statement { mainsnak, .. } => mainsnak,
            }
        }

        pub fn qualifiers(&self) -> impl Iterator<Item = (&Property, &Vec<Snak>)> {
            match self {
                Statement::Statement { qualifiers, .. } => qualifiers.iter(),
            }
        }

        pub fn references(&self) -> impl Iterator<Item = &Reference> {
            match self {
                Statement::Statement { references, .. } => references.iter(),
            }
        }

        pub fn rank(&self) -> Rank {
            match self {
                Statement::Statement { rank, .. } => *rank,
            }
        }
    }

    #[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct Sitelink {
        site: String,
        title: String,
        badges: Vec<Item>,
    }

    #[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct LanguageValue {
        language: String,
        value: String,
    }

    #[derive(Copy, Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub enum Rank {
        Normal,
        Preferred,
        Deprecated,
    }

    impl Default for Rank {
        fn default() -> Self {
            Self::Normal
        }
    }

    #[allow(variant_size_differences, clippy::enum_variant_names)]
    #[derive(Debug, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "lowercase", tag = "snaktype")]
    pub enum Snak {
        Value {
            property: Property,
            datatype: Type,
            datavalue: DataValue,
        },
        SomeValue {
            property: Property,
        },
        NoValue {
            property: Property,
        },
    }

    impl Snak {
        pub fn as_data_value(&self) -> Option<&DataValue> {
            match self {
                Snak::Value {
                    property: _,
                    datatype: _,
                    datavalue,
                } => Some(datavalue),
                _ => None,
            }
        }
    }

    #[derive(Default, Debug, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "kebab-case")]
    pub struct Reference {
        hash: String,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        snaks_order: Vec<Property>,
        #[serde(skip_serializing_if = "HashMap::is_empty")]
        pub(crate) snaks: HashMap<Property, Vec<Snak>>,
    }

    #[derive(Debug, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "kebab-case", tag = "type")]
    pub enum DataValue {
        String {
            value: String,
        },
        WikibaseEntityid {
            value: EntityId,
        },
        #[serde(rename = "globecoordinate")]
        GlobeCoordinate {
            value: GlobeCoordinate,
        },
        Quantity {
            value: Quantity,
        },
        Time {
            value: Time,
        },
        #[serde(rename = "monolingualtext")]
        MonolingualText {
            value: MonolingualText,
        },
    }

    impl DataValue {
        pub fn as_entity_id(&self) -> Option<&EntityId> {
            match self {
                DataValue::WikibaseEntityid { value } => Some(value),
                _ => None,
            }
        }
    }

    #[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
    #[serde(rename_all = "kebab-case")]
    pub struct EntityId {
        pub(crate) entity_type: EntityType,
        pub(crate) id: Entity,
        #[serde(skip_serializing_if = "Option::is_none")]
        numeric_id: Option<u64>,
    }

    #[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
    #[serde(rename_all = "lowercase")]
    pub enum EntityType {
        Item,
        Property,
        Lexeme,
        Sense,
        Form,
    }

    #[derive(Debug, PartialEq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct GlobeCoordinate {
        latitude: f64,
        longitude: f64,
        #[serde(default = "GlobeCoordinate::default_globe")]
        globe: Item,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        altitude: Option<f64>,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        precision: Option<f64>,
    }

    impl GlobeCoordinate {
        fn default_globe() -> Item {
            Item::new(2)
        }
    }

    #[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct Quantity {
        amount: String,
        unit: Item,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        upperbound: Option<String>,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        lowerbound: Option<String>,
    }

    #[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
    pub struct Time {
        #[serde(
            skip, // FIXME
            with = "formats::dump_timestamp",
            default,
            skip_serializing_if = "Option::is_none"
        )]
        time: Option<DateTime<Utc>>,
        timezone: i16,
        before: u64,
        after: u64,
        precision: TimePrecision,
        calendarmodel: Item,
    }

    #[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct MonolingualText {
        language: String,
        text: String,
    }

    #[derive(Debug, PartialEq, Eq, Deserialize_repr, Serialize_repr)]
    #[repr(u8)]
    pub enum TimePrecision {
        BillionYears = 0,
        HundredMillionYears = 1,
        TenMillionYears = 2,
        MillionYears = 3,
        HundredThousandYears = 4,
        TenThousandYears = 5,
        Millenium = 6,
        Century = 7,
        Decade = 8,
        Year = 9,
        Month = 10,
        Day = 11,
        Hour = 12,
        Minute = 13,
        Second = 14,
    }
}

pub(crate) mod formats {
    use super::*;
    use serde::{Deserializer, Serializer};

    pub(crate) mod timestamp {
        use super::*;
        use chrono::NaiveDateTime;

        const FORMAT: &str = "%Y-%m-%dT%H:%M:%S";
        const EXTENDED: &str = "%Y-%m-%dT%H:%M:%S%z";

        pub fn serialize<S>(date: &Option<DateTime<Utc>>, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            match date {
                Some(date) => serializer.serialize_str(&format!("{}", date.format(FORMAT))),
                None => serializer.serialize_none(),
            }
        }

        pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<DateTime<Utc>>, D::Error>
        where
            D: Deserializer<'de>,
        {
            let s: Option<String> = Option::deserialize(deserializer)?;
            match s {
                Some(s) => {
                    let default = NaiveDateTime::parse_from_str(&s, FORMAT)
                        .map(|date| DateTime::from_naive_utc_and_offset(date, Utc));
                    let extended =
                        DateTime::parse_from_str(&s, EXTENDED).map(|date| date.with_timezone(&Utc));

                    Ok(Some(
                        default.or(extended).map_err(serde::de::Error::custom)?,
                    ))
                }
                None => Ok(None),
            }
        }

        #[cfg(test)]
        mod test {
            use chrono::{NaiveDate, TimeZone};
            use test_log::test;

            use super::*;

            #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
            struct Data(#[serde(with = "super")] Option<DateTime<Utc>>);

            const TEXT: &str = r#""2016-04-19T08:23:40""#;
            const TEXT_WITH_TIMEZONE: &str = r#""2016-04-19T08:23:40+0000""#;

            #[test]
            fn deserialize() {
                let date = Utc.from_utc_datetime(
                    &NaiveDate::from_ymd_opt(2016, 4, 19)
                        .unwrap()
                        .and_hms_opt(8, 23, 40)
                        .unwrap(),
                );
                let result: Result<Data, _> = serde_json::from_str(TEXT);
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(Some(date)));
            }

            #[test]
            fn deserialize_with_timezone() {
                let date = Utc.from_utc_datetime(
                    &NaiveDate::from_ymd_opt(2016, 4, 19)
                        .unwrap()
                        .and_hms_opt(8, 23, 40)
                        .unwrap(),
                );
                let result: Result<Data, _> = serde_json::from_str(TEXT_WITH_TIMEZONE);
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(Some(date)));
            }

            #[test]
            fn serialize() {
                let date = Utc.from_utc_datetime(
                    &NaiveDate::from_ymd_opt(2016, 4, 19)
                        .unwrap()
                        .and_hms_opt(8, 23, 40)
                        .unwrap(),
                );
                let result = serde_json::to_string(&Data(Some(date)));
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), TEXT);
            }
        }
    }

    pub(crate) mod date {
        use chrono::ParseError;

        use super::*;

        const FORMAT: &str = "%Y%m%d";

        pub fn date_from_str(s: &str) -> Result<NaiveDate, ParseError> {
            NaiveDate::parse_from_str(s, FORMAT)
        }

        pub fn serialize<S>(date: &Option<NaiveDate>, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            match date {
                Some(date) => serializer.serialize_str(&format!("{}", date.format(FORMAT))),
                None => serializer.serialize_none(),
            }
        }

        pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<NaiveDate>, D::Error>
        where
            D: Deserializer<'de>,
        {
            let s: Option<String> = Option::deserialize(deserializer)?;
            match s {
                Some(ref s) => Ok(Some(date_from_str(s).map_err(serde::de::Error::custom)?)),
                None => Ok(None),
            }
        }

        #[cfg(test)]
        mod test {
            use chrono::NaiveDate;
            use test_log::test;

            use super::*;

            #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
            struct Data(#[serde(with = "super")] Option<NaiveDate>);

            const TEXT: &str = r#""20160419""#;

            #[test]
            fn deserialize() {
                let date = NaiveDate::from_ymd_opt(2016, 4, 19).unwrap();
                let result = serde_json::from_str::<Data>(TEXT);
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(Some(date)));
            }

            #[test]
            fn serialize() {
                let date = NaiveDate::from_ymd_opt(2016, 4, 19).unwrap();
                let result = serde_json::to_string(&Data(Some(date)));
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), TEXT);
            }
        }
    }
}

#[cfg(test)]
mod test {
    use indoc::indoc;
    use std::{fs::File, io::Read};
    use strum::IntoEnumIterator;
    use test_log::test;

    use super::*;

    #[test]
    fn deserialise_property_record() {
        let property: Result<PropertyRecord, _> = serde_json::from_str(
            r#"{ "qs": { "166": 1, "582": 1, "580": 1 },
                 "e": 0,
                 "d": "WikibaseItem",
                 "i": 39562,
                 "l": "director of photography",
                 "q": 5,
                 "pc": [ "22965162" ],
                 "s": 41545,
                 "r": { "214": 0, "1265": 1422, "131": 0, "2530": 21 }
               }"#,
        );
        log::debug!("{:?}", property);

        let mut qualifiers = HashMap::new();
        qualifiers.insert(Qualifier::new(582), 1);
        qualifiers.insert(Qualifier::new(580), 1);
        qualifiers.insert(Qualifier::new(166), 1);

        let mut related = HashMap::new();
        related.insert(Property::new(214), 0);
        related.insert(Property::new(1265), 1422);
        related.insert(Property::new(131), 0);
        related.insert(Property::new(2530), 21);

        assert!(property.is_ok());
        assert_eq!(
            property.unwrap(),
            PropertyRecord {
                label: Some("director of photography".to_string()),
                datatype: Some(Type::WikibaseItem),
                in_items: 39562,
                in_statements: 41545,
                in_qualifiers: 5,
                in_references: 0,
                url_pattern: None,
                instance_of: vec![Item::new(22965162)],
                with_qualifiers: qualifiers,
                related_properties: related,
                cooccurrences: HashMap::new(),
            }
        );
    }

    #[test]
    fn deserialise_example_properties() {
        let mut data = String::new();
        assert!(File::open("../../data/exampleData/properties.json")
            .unwrap()
            .read_to_string(&mut data)
            .is_ok());

        let properties: Result<Properties, _> = serde_json::from_str(&data);
        log::debug!("{:?}", properties);
        assert!(properties.is_ok());
    }

    #[test]
    fn deserialise_example_classes() {
        let mut data = String::new();
        assert!(File::open("../../data/exampleData/classes.json")
            .unwrap()
            .read_to_string(&mut data)
            .is_ok());

        let classes: Result<Classes, _> = serde_json::from_str(&data);
        log::debug!("{:?}", classes);
        assert!(classes.is_ok());
    }

    #[test]
    fn deserialise_example_statistics() {
        let mut data = String::new();
        assert!(File::open("../../data/exampleData/statistics.json")
            .unwrap()
            .read_to_string(&mut data)
            .is_ok());

        let statistics: Result<Statistics, _> = serde_json::from_str(&data);
        log::debug!("{:?}", statistics);
        assert!(statistics.is_ok());
    }

    #[test]
    fn deserialise_type() {
        for variant in Type::iter() {
            let string = format!(r#""http://wikiba.se/ontology#{}""#, variant);
            log::debug!("testing {:?} {:?}", variant, string);
            assert_eq!(serde_json::from_str::<Type>(&string).unwrap(), variant);
        }
    }

    #[test]
    fn deserialise_property_label_and_type() {
        let data: &str = indoc! {r#"
          id,label,type
          http://www.wikidata.org/entity/P4774,biological phase,http://wikiba.se/ontology#WikibaseItem
          http://www.wikidata.org/entity/P4773,MobyGames company ID,http://wikiba.se/ontology#ExternalId
        "#};

        let mut reader = csv::Reader::from_reader(data.as_bytes());
        let result: Vec<Result<PropertyLabelAndType, _>> = reader.deserialize().collect();
        assert!(result.iter().flatten().count() == 2);
    }

    #[test]
    fn deserialise_property_usage() {
        let data: &str = indoc! { r#"
          p,c
          http://www.wikidata.org/prop/P279,3210992
          http://www.wikidata.org/prop/statement/P279,3210983
          http://www.wikidata.org/prop/direct/P279,3209980
          http://www.wikidata.org/prop/qualifier/P279,174
          http://www.wikidata.org/prop/reference/P279,9"#};
        let mut reader = csv::Reader::from_reader(data.as_bytes());
        let usage: Vec<Result<PropertyUsage, _>> = reader.deserialize().collect();
        usage
            .iter()
            .for_each(|result| log::debug!("result: {:?}", result));

        log::debug!(
            "{:?}",
            serde_json::from_str::<PropertyUsage>(
                r#"{"p": "http://www.wikidata.org/prop/P279", "c": 3210992}"#
            )
        );
        log::debug!(
            "{:?}",
            serde_json::from_str::<PropertyUsage>(
                r#"{"p": "http://www.wikidata.org/prop/qualifier/P279", "c": 3210992}"#
            )
        );
        log::debug!(
            "{:?}",
            serde_json::from_str::<PropertyUsage>(
                r#"{"p": "http://www.wikidata.org/prop/reference/P279", "c": 3210992}"#
            )
        );

        let mut reader = csv::Reader::from_reader(data.as_bytes());
        let headers = reader.headers().unwrap().clone();
        reader.into_records().for_each(|record| {
            log::debug!("record: {:?}", record);
            log::debug!(
                "record: {:?}",
                record.unwrap().deserialize::<PropertyUsage>(Some(&headers))
            );
        });

        assert!(usage.iter().flatten().count() == 3);
    }
}
