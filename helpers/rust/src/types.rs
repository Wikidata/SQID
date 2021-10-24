use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::PathBuf};

mod ids;

use ids::*;

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

#[derive(Debug, PartialEq, Eq, Hash, Deserialize, Serialize)]
enum Type {
    WikibaseItem,
    WikibaseProperty,
    WikibaseLexeme,
    WikibaseForm,
    WikibaseSense,
    WikibaseMediaInfo,
    String,
    Url,
    CommonsMedia,
    Time,
    GlobeCoordinate,
    Quantity,
    Monolingualtext,
    ExternalId,
    Math,
    GeoShape,
    TabularData,
}

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
struct PropertyRecord {
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
    instance_of: Vec<Class>,
    #[serde(rename = "qs")]
    with_qualifiers: HashMap<Qualifier, usize>,
    #[serde(rename = "r")]
    related_properties: HashMap<Property, usize>,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
struct Properties(HashMap<Property, PropertyRecord>);

#[derive(Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(default)]
struct ClassRecord {
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
    superclasses: Vec<Class>,
    #[serde(rename = "sb")]
    non_empty_superclasses: Vec<Class>,
    #[serde(rename = "r")]
    related_properties: HashMap<Property, usize>,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
struct Classes(HashMap<Class, ClassRecord>);

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct Statistics {
    #[serde(rename = "propertyUpdate", with = "formats::timestamp")]
    property_update: DateTime<Utc>,
    #[serde(rename = "classUpdate", with = "formats::timestamp")]
    class_update: DateTime<Utc>,
    #[serde(rename = "dumpDate", with = "formats::date")]
    dump_date: Date<Utc>,
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
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(date));
            }

            #[test]
            fn test_serialize() {
                let date =
                    Utc.from_utc_datetime(&NaiveDate::from_ymd(2016, 4, 19).and_hms(8, 23, 40));
                let result = serde_json::to_string(&Data(date));
                log::debug!("{:?}", result);
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
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(date));
            }

            #[test]
            fn test_serialize() {
                let date = Utc.from_utc_date(&NaiveDate::from_ymd(2016, 4, 19));
                let result = serde_json::to_string(&Data(date));
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), TEXT);
            }
        }
    }
}

#[cfg(test)]
mod test {
    use std::{fs::File, io::Read};
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
                instance_of: vec![Class::new(22965162)],
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
}
