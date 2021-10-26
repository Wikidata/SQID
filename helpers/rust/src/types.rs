use chrono::{Date, DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::PathBuf};
use strum::{Display, EnumIter, EnumString};

mod ids;

pub use ids::{Entity, Item, Property, Qualifier, Reference};

/// Holds settings given on the command line, particularly the path to
/// the data directories.
#[derive(Debug)]
pub(crate) struct Settings {
    data_directory: Box<PathBuf>,
}

impl Settings {
    pub fn new(data: &str) -> Self {
        Self {
            data_directory: Box::new(data.into()),
        }
    }
}

#[derive(Debug)]
struct PrefixKey {}

#[derive(Debug)]
enum PropertyUsageType {}

#[derive(Debug, PartialEq, Eq, Hash, Deserialize, Serialize, Display, EnumString, EnumIter)]
pub enum Type {
    #[strum(
        to_string = "WikibaseItem",
        serialize = "http://wikiba.se/ontology#WikibaseItem"
    )]
    #[serde(alias = "http://wikiba.se/ontology#WikibaseItem")]
    WikibaseItem,
    #[strum(
        to_string = "WikibaseProperty",
        serialize = "http://wikiba.se/ontology#WikibaseProperty"
    )]
    #[serde(alias = "http://wikiba.se/ontology#WikibaseProperty")]
    WikibaseProperty,
    #[strum(
        to_string = "WikibaseLexeme",
        serialize = "http://wikiba.se/ontology#WikibaseLexeme"
    )]
    #[serde(alias = "http://wikiba.se/ontology#WikibaseLexeme")]
    WikibaseLexeme,
    #[strum(
        to_string = "WikibaseForm",
        serialize = "http://wikiba.se/ontology#WikibaseForm"
    )]
    #[serde(alias = "http://wikiba.se/ontology#WikibaseForm")]
    WikibaseForm,
    #[strum(
        to_string = "WikibaseSense",
        serialize = "http://wikiba.se/ontology#WikibaseSense"
    )]
    #[serde(alias = "http://wikiba.se/ontology#WikibaseSense")]
    WikibaseSense,
    #[strum(
        to_string = "WikibaseMediaInfo",
        serialize = "http://wikiba.se/ontology#WikibaseMediaInfo"
    )]
    #[serde(alias = "http://wikiba.se/ontology#WikibaseMediaInfo")]
    WikibaseMediaInfo,
    #[strum(to_string = "String", serialize = "http://wikiba.se/ontology#String")]
    #[serde(alias = "http://wikiba.se/ontology#String")]
    String,
    #[strum(to_string = "Url", serialize = "http://wikiba.se/ontology#Url")]
    #[serde(alias = "http://wikiba.se/ontology#Url")]
    Url,
    #[strum(
        to_string = "CommonsMedia",
        serialize = "http://wikiba.se/ontology#CommonsMedia"
    )]
    #[serde(alias = "http://wikiba.se/ontology#CommonsMedia")]
    CommonsMedia,
    #[strum(to_string = "Time", serialize = "http://wikiba.se/ontology#Time")]
    #[serde(alias = "http://wikiba.se/ontology#Time")]
    Time,
    #[strum(
        to_string = "GlobeCoordinate",
        serialize = "http://wikiba.se/ontology#GlobeCoordinate"
    )]
    #[serde(alias = "http://wikiba.se/ontology#GlobeCoordinate")]
    GlobeCoordinate,
    #[strum(
        to_string = "Quantity",
        serialize = "http://wikiba.se/ontology#Quantity"
    )]
    #[serde(alias = "http://wikiba.se/ontology#Quantity")]
    Quantity,
    #[strum(
        to_string = "Monolingualtext",
        serialize = "http://wikiba.se/ontology#Monolingualtext"
    )]
    #[serde(alias = "http://wikiba.se/ontology#Monolingualtext")]
    Monolingualtext,
    #[strum(
        to_string = "ExternalId",
        serialize = "http://wikiba.se/ontology#ExternalId"
    )]
    #[serde(alias = "http://wikiba.se/ontology#ExternalId")]
    ExternalId,
    #[strum(to_string = "Math", serialize = "http://wikiba.se/ontology#Math")]
    #[serde(alias = "http://wikiba.se/ontology#Math")]
    Math,
    #[strum(
        to_string = "GeoShape",
        serialize = "http://wikiba.se/ontology#GeoShape"
    )]
    #[serde(alias = "http://wikiba.se/ontology#GeoShape")]
    GeoShape,
    #[strum(
        to_string = "TabularData",
        serialize = "http://wikiba.se/ontology#TabularData"
    )]
    #[serde(alias = "http://wikiba.se/ontology#TabularData")]
    TabularData,
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct PropertyRecord {
    #[serde(rename = "l")]
    label: Option<String>,
    #[serde(rename = "d")]
    datatype: Option<Type>,
    #[serde(rename = "i")]
    in_items: usize,
    #[serde(rename = "s")]
    in_statements: usize,
    #[serde(rename = "q")]
    in_qualifiers: usize,
    #[serde(rename = "e")]
    in_references: usize,
    #[serde(rename = "u")]
    url_pattern: Option<String>,
    #[serde(rename = "pc")]
    instance_of: Vec<Item>,
    #[serde(rename = "qs")]
    with_qualifiers: HashMap<Qualifier, usize>,
    #[serde(rename = "r")]
    related_properties: HashMap<Property, usize>,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct Properties(HashMap<Property, PropertyRecord>);

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct ClassRecord {
    #[serde(rename = "l")]
    label: Option<String>,
    #[serde(rename = "i")]
    direct_instances: usize,
    #[serde(rename = "s")]
    direct_subclasses: usize,
    #[serde(rename = "ai")]
    all_instances: usize,
    #[serde(rename = "as")]
    all_subclassces: usize,
    #[serde(rename = "sc")]
    superclasses: Vec<Item>,
    #[serde(rename = "sb")]
    non_empty_superclasses: Vec<Item>,
    #[serde(rename = "r")]
    related_properties: HashMap<Property, usize>,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct Classes(HashMap<Item, ClassRecord>);

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct EntityStatistics {
    #[serde(rename = "cDesc")]
    descriptions: usize,
    #[serde(rename = "cStmts")]
    statements: usize,
    #[serde(rename = "cLabels")]
    labels: usize,
    #[serde(rename = "cAliases")]
    aliases: usize,
    #[serde(rename = "c")]
    count: usize,
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
pub struct SiteRecord {
    #[serde(rename = "u")]
    url_pattern: Option<String>,
    #[serde(rename = "g")]
    group: Option<String>,
    #[serde(rename = "l")]
    language: Option<String>,
    #[serde(rename = "i")]
    items: usize,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Statistics {
    #[serde(rename = "propertyUpdate", with = "formats::timestamp")]
    property_update: DateTime<Utc>,
    #[serde(rename = "classUpdate", with = "formats::timestamp")]
    class_update: DateTime<Utc>,
    #[serde(rename = "dumpDate", with = "formats::date")]
    dump_date: Date<Utc>,
    #[serde(rename = "propertyStatistics")]
    properties: EntityStatistics,
    #[serde(rename = "itemStatistics")]
    items: EntityStatistics,
    sites: HashMap<String, SiteRecord>,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct PropertyLabelAndType {
    #[serde(rename = "id")]
    property: Entity,
    #[serde(rename = "label")]
    label: String,
    #[serde(rename = "type")]
    datatype: Type,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct PropertyUsage {
    #[serde(rename = "p")]
    property: Property,
    #[serde(rename = "c")]
    count: usize,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct ClassLabelAndUsage {
    #[serde(rename = "id")]
    class: Item,
    #[serde(rename = "label")]
    label: String,
    #[serde(rename = "c")]
    usage: Option<usize>,
}

pub(crate) mod formats {
    use super::*;
    use serde::{Deserializer, Serializer};

    pub(crate) mod timestamp {
        use super::*;
        use chrono::TimeZone;

        const FORMAT: &str = "%Y-%m-%dT%H:%M:%S";

        pub fn serialize<S>(date: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            serializer.serialize_str(&format!("{}", date.format(FORMAT)))
        }

        pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
        where
            D: Deserializer<'de>,
        {
            Utc.datetime_from_str(&String::deserialize(deserializer)?, FORMAT)
                .map_err(serde::de::Error::custom)
        }

        #[cfg(test)]
        mod test {
            use chrono::NaiveDate;
            use test_env_log::test;

            use super::*;

            #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
            struct Data(#[serde(with = "super")] DateTime<Utc>);

            const TEXT: &str = r#""2016-04-19T08:23:40""#;

            #[test]
            fn test_deserialize() {
                let date =
                    Utc.from_utc_datetime(&NaiveDate::from_ymd(2016, 4, 19).and_hms(8, 23, 40));
                let result: Result<Data, _> = serde_json::from_str(TEXT);
                log::debug!(target: "types::formats::timestamp", "{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(date));
            }

            #[test]
            fn test_serialize() {
                let date =
                    Utc.from_utc_datetime(&NaiveDate::from_ymd(2016, 4, 19).and_hms(8, 23, 40));
                let result = serde_json::to_string(&Data(date));
                log::debug!(target: "types::formats::timestamp", "{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), TEXT);
            }
        }
    }

    pub(crate) mod date {
        use chrono::NaiveDate;

        use super::*;

        const FORMAT: &str = "%Y%m%d";

        pub fn serialize<S>(date: &Date<Utc>, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            serializer.serialize_str(&format!("{}", date.format(FORMAT)))
        }

        pub fn deserialize<'de, D>(deserializer: D) -> Result<Date<Utc>, D::Error>
        where
            D: Deserializer<'de>,
        {
            NaiveDate::parse_from_str(&String::deserialize(deserializer)?, FORMAT)
                .map(|date| Date::from_utc(date, Utc))
                .map_err(serde::de::Error::custom)
        }

        #[cfg(test)]
        mod test {
            use chrono::{NaiveDate, TimeZone};
            use test_env_log::test;

            use super::*;

            #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
            struct Data(#[serde(with = "super")] Date<Utc>);

            const TEXT: &str = r#""20160419""#;

            #[test]
            fn test_deserialize() {
                let date = Utc.from_utc_date(&NaiveDate::from_ymd(2016, 4, 19));
                let result = serde_json::from_str::<Data>(TEXT);
                log::debug!(target: "types::formats::date", "{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(date));
            }

            #[test]
            fn test_serialize() {
                let date = Utc.from_utc_date(&NaiveDate::from_ymd(2016, 4, 19));
                let result = serde_json::to_string(&Data(date));
                log::debug!(target: "types::formats::date", "{:?}", result);
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
    use test_env_log::test;

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
        log::debug!(target: "types", "{:?}", property);

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
        log::debug!(target: "types", "{:?}", properties);
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
        log::debug!(target: "types", "{:?}", classes);
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
        log::debug!(target: "types", "{:?}", statistics);
        assert!(statistics.is_ok());
    }

    #[test]
    fn deserialise_type() {
        for variant in Type::iter() {
            let string = format!(r#""http://wikiba.se/ontology#{}""#, variant);
            log::trace!(target: "types", "testing {:?} {:?}", variant, string);
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

        let mut rdr = csv::Reader::from_reader(data.as_bytes());
        let result: Vec<PropertyLabelAndType> = rdr.deserialize().flatten().collect();
        assert!(result.len() == 2);
    }
}
