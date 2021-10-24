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

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
struct PropertyRecord {
    #[serde(rename = "l", default)]
    label: Option<String>,
    #[serde(rename = "d")]
    datatype: Option<Type>,
    #[serde(rename = "i", default)]
    in_items: usize,
    #[serde(rename = "s", default)]
    in_statements: usize,
    #[serde(rename = "q", default)]
    in_qualifiers: usize,
    #[serde(rename = "e", default)]
    in_references: usize,
    #[serde(rename = "u", default)]
    url_pattern: Option<String>,
    #[serde(rename = "pc", default)]
    instance_of: Vec<Class>,
    #[serde(rename = "qs", default)]
    with_qualifiers: HashMap<Qualifier, usize>,
    #[serde(rename = "r", default)]
    related_properties: HashMap<Property, usize>,
}

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
struct Properties(HashMap<Property, PropertyRecord>);

#[derive(Debug, PartialEq, Eq, Deserialize, Serialize)]
struct ClassRecord {
    #[serde(rename = "l", default)]
    label: Option<String>,
    #[serde(rename = "i", default)]
    direct_instances: usize,
    #[serde(rename = "s", default)]
    direct_subclasses: usize,
    #[serde(rename = "ai", default)]
    all_instances: usize,
    #[serde(rename = "as", default)]
    all_subclassces: usize,
    #[serde(rename = "sc", default)]
    superclasses: Vec<Class>,
    #[serde(rename = "sb", default)]
    non_empty_superclasses: Vec<Class>,
    related_properties: HashMap<Property, usize>,
}

#[cfg(test)]
mod test {
    use std::{fs::File, io::Read};

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
        println!("{:?}", property);

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
        println!("{:?}", properties);
        assert!(properties.is_ok());
    }
}
