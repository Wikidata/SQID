use anyhow::{Context, Result};
use indoc::indoc;
use reqwest::blocking::{Client, Response};

use crate::types::{ClassLabelAndUsage, PropertyLabelAndType, PropertyUsage};

pub const SERVICE_URL: &str = "https://query.wikidata.org/sparql";
pub const USER_AGENT: &str = "SQID/2.0 (https://github.com/Wikidata/SQID)";
pub const TOOL_BANNER: &str = "#TOOL:SQID Rust Helper\n";

pub(crate) fn query(query: &str) -> Result<Response> {
    log::trace!(target: "sqid::sparql", "query {:?}", query);
    let client = Client::builder()
        .timeout(None)
        .user_agent(USER_AGENT)
        .build()
        .context("Failed to build reqwest client")?;
    let request = client
        .get(SERVICE_URL)
        .header(reqwest::header::ACCEPT, "text/csv")
        .query(&[("query", format!("{}{}", TOOL_BANNER, query))])
        .build()
        .context("Failed to build reqwest request")?;
    let response = client
        .execute(request)
        .context("Failed to perform SPARQL query");
    log::trace!(target: "sqid::sparql", "query {:?}, got response {:?}", query, response);
    response
}

pub fn properties() -> Result<Vec<PropertyLabelAndType>> {
    let response = query(indoc! {r#"
      SELECT ?id ?label ?type
      WITH {
        SELECT ?id ?type WHERE {
          ?id a wikibase:Property ;
                wikibase:propertyType ?type .
        }
      } AS %properties
      WHERE {
        INCLUDE %properties .
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "en" .
          ?id rdfs:label ?label .
        }
      }"#})?;

    let mut reader = csv::Reader::from_reader(response);
    Ok(reader.deserialize().flatten().collect())
}

pub fn property_usage() -> Result<Vec<PropertyUsage>> {
    let response = query(indoc! {r#"
      SELECT ?p (count(*) AS ?c) WHERE {
        ?s ?p ?o .
      } GROUP BY ?p ORDER BY DESC(?c)"#})?;

    let mut reader = csv::Reader::from_reader(response);
    let result = reader.deserialize().flatten().collect();
    Ok(result)
}

pub fn classes() -> Result<Vec<ClassLabelAndUsage>> {
    let response = query(indoc! {r#"
      SELECT ?id ?label ?c
      WITH { SELECT ?id (COUNT(*) AS ?c) WHERE {
         ?i wdt:P31 ?id
        } GROUP BY ?id
      } AS %classes
      WHERE {
        INCLUDE %classes
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "en" .
          ?id rdfs:label ?label .
        }
      }"#})?;

    let mut reader = csv::Reader::from_reader(response);
    let result = reader.deserialize().flatten().collect();
    Ok(result)
}

#[allow(dead_code)]
pub fn classes_fallback() -> Result<Vec<ClassLabelAndUsage>> {
    let response = query(indoc! {r#"
      SELECT ?id ?label
      WITH { SELECT DISTINCT ?id WHERE {
          ?i wdt:P31 ?id
        }
      } AS %classes
      WHERE {
        INCLUDE %classes
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "en" .
          ?id rdfs:label ?label .
        }
      }"#})?;

    let mut reader = csv::Reader::from_reader(response);
    let result = reader.deserialize().flatten().collect();
    Ok(result)
}

#[cfg(test)]
mod test {
    use super::*;
    use indoc::indoc;
    use test_env_log::test;

    #[test]
    fn simple_query() {
        use crate::types::Entity;
        use serde::Deserialize;

        #[derive(PartialEq, Eq, Debug, Deserialize)]
        struct Result {
            id: Entity,
            label: String,
        }

        let response = query(indoc! {r#"
                                 SELECT ?id ?label WHERE {
                                   VALUES (?id) { (wd:P31) (wd:P279) (wd:Q42) }
                                   ?id rdfs:label ?label .
                                   FILTER(LANG(?label) = "en")
                                 } ORDER BY ASC(?id)"#});
        assert!(response.is_ok());
        let response = response.unwrap();
        log::debug!(target: "sqid::sparql", "response: {}", response.status());
        assert_eq!(response.status(), 200);
        let mut reader = csv::Reader::from_reader(response);
        let result: Vec<Result> = reader.deserialize().flatten().collect();
        log::debug!(target: "sqid::sparql", "response: {:?}", result);
        assert_eq!(
            result,
            vec![
                Result {
                    id: Entity::property(31),
                    label: "instance of".to_string()
                },
                Result {
                    id: Entity::property(279),
                    label: "subclass of".to_string()
                },
                Result {
                    id: Entity::item(42),
                    label: "Douglas Adams".to_string()
                },
            ]
        );
    }
}
