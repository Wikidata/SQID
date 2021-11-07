use chrono::{Date, DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use strum::{Display, EnumIter, EnumString};

use super::{
    ids::{Item, Property, Qualifier},
    is_zero,
    sparql::{PropertyLabelAndType, PropertyUsage, PropertyUsageType},
    ClassLabelAndUsage,
};

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize, Display, EnumString, EnumIter,
)]
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
    #[strum(
        to_string = "MusicalNotation",
        serialize = "http://wikiba.se/ontology#MusicalNotation"
    )]
    #[serde(alias = "http://wikiba.se/ontology#MusicalNotation")]
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
    pub(crate) all_subclassces: usize,
    #[serde(rename = "sc", skip_serializing_if = "Vec::is_empty")]
    pub(crate) superclasses: Vec<Item>,
    #[serde(rename = "sb", skip_serializing_if = "Vec::is_empty")]
    pub(crate) non_empty_superclasses: Vec<Item>,
    #[serde(rename = "r", skip_serializing_if = "HashMap::is_empty")]
    pub(crate) related_properties: HashMap<Property, usize>,
}

impl ClassRecord {
    pub(crate) fn update_label_and_usage(&mut self, label: String, usage: Option<usize>) {
        let _ = self.label.insert(label);
        if let Some(direct_instances) = usage {
            self.direct_instances = direct_instances
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

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
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
    pub(crate) dump_date: Option<Date<Utc>>,
    #[serde(rename = "propertyStatistics")]
    pub(crate) properties: EntityStatistics,
    #[serde(rename = "itemStatistics")]
    pub(crate) items: EntityStatistics,
    #[serde(skip_serializing_if = "HashMap::is_empty")]
    pub(crate) sites: HashMap<String, SiteRecord>,
}

pub(crate) mod formats {
    use super::*;
    use serde::{Deserializer, Serializer};

    pub(crate) mod timestamp {
        use super::*;
        use chrono::TimeZone;

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
                    let default = Utc.datetime_from_str(&s, FORMAT);
                    let extended = Utc.datetime_from_str(&s, EXTENDED);

                    Ok(Some(
                        default.or(extended).map_err(serde::de::Error::custom)?,
                    ))
                }
                None => Ok(None),
            }
        }

        #[cfg(test)]
        mod test {
            use chrono::NaiveDate;
            use test_env_log::test;

            use super::*;

            #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
            struct Data(#[serde(with = "super")] Option<DateTime<Utc>>);

            const TEXT: &str = r#""2016-04-19T08:23:40""#;
            const TEXT_WITH_TIMEZONE: &str = r#""2016-04-19T08:23:40+0000""#;

            #[test]
            fn test_deserialize() {
                let date =
                    Utc.from_utc_datetime(&NaiveDate::from_ymd(2016, 4, 19).and_hms(8, 23, 40));
                let result: Result<Data, _> = serde_json::from_str(TEXT);
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(Some(date)));
            }

            #[test]
            fn test_deserialize_with_timezone() {
                let date =
                    Utc.from_utc_datetime(&NaiveDate::from_ymd(2016, 4, 19).and_hms(8, 23, 40));
                let result: Result<Data, _> = serde_json::from_str(TEXT_WITH_TIMEZONE);
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(Some(date)));
            }

            #[test]
            fn test_serialize() {
                let date =
                    Utc.from_utc_datetime(&NaiveDate::from_ymd(2016, 4, 19).and_hms(8, 23, 40));
                let result = serde_json::to_string(&Data(Some(date)));
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

        pub fn serialize<S>(date: &Option<Date<Utc>>, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            match date {
                Some(date) => serializer.serialize_str(&format!("{}", date.format(FORMAT))),
                None => serializer.serialize_none(),
            }
        }

        pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<Date<Utc>>, D::Error>
        where
            D: Deserializer<'de>,
        {
            let s: Option<String> = Option::deserialize(deserializer)?;
            match s {
                Some(s) => Ok(Some(
                    NaiveDate::parse_from_str(&s, FORMAT)
                        .map(|date| Date::from_utc(date, Utc))
                        .map_err(serde::de::Error::custom)?,
                )),
                None => Ok(None),
            }
        }

        #[cfg(test)]
        mod test {
            use chrono::{NaiveDate, TimeZone};
            use test_env_log::test;

            use super::*;

            #[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
            struct Data(#[serde(with = "super")] Option<Date<Utc>>);

            const TEXT: &str = r#""20160419""#;

            #[test]
            fn test_deserialize() {
                let date = Utc.from_utc_date(&NaiveDate::from_ymd(2016, 4, 19));
                let result = serde_json::from_str::<Data>(TEXT);
                log::debug!("{:?}", result);
                assert!(result.is_ok());
                assert_eq!(result.unwrap(), Data(Some(date)));
            }

            #[test]
            fn test_serialize() {
                let date = Utc.from_utc_date(&NaiveDate::from_ymd(2016, 4, 19));
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
