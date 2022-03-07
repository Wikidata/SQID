use std::{collections::HashMap, str::FromStr};

use anyhow::{anyhow, Context, Result};
use nom::{
    branch::alt,
    bytes::complete::tag,
    character::complete::u64,
    combinator::{all_consuming, complete, map, opt},
    multi::{length_count, length_data},
    sequence::{delimited, preceded, separated_pair, terminated},
    IResult, ToUsize,
};

#[derive(Debug, Eq, PartialEq)]
pub struct Array(HashMap<String, Value>);

impl FromStr for Array {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (_, array) =
            complete(all_consuming(array))(s).map_err(|_| anyhow!("Failed to parse array"))?;

        Ok(array)
    }
}

#[derive(Debug, Eq, PartialEq)]
pub enum Value {
    String(String),
    Array(Array),
}

impl Value {
    fn as_string(&self) -> Option<&String> {
        match self {
            Value::String(str) => Some(str),
            Value::Array(_) => None,
        }
    }

    fn as_array(&self) -> Option<&Array> {
        match self {
            Value::String(_) => None,
            Value::Array(array) => Some(array),
        }
    }
}

impl FromStr for Value {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (_, value) = complete(all_consuming(value))(s)
            .map_err(|_| anyhow!("Failed parsing the array value"))?;

        Ok(value)
    }
}

#[derive(Debug, Eq, PartialEq)]
pub struct SitePaths {
    file: String,
    page: String,
}

impl SitePaths {
    pub fn page_url(&self) -> &str {
        &self.page
    }

    #[allow(dead_code)]
    pub fn file_url(&self) -> &str {
        &self.file
    }
}

impl FromStr for SitePaths {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let array = s.parse::<Array>()?;
        log::debug!("{:?}", array);

        let paths = array
            .0
            .get("paths")
            .context(r#"no "paths" in array"#)?
            .as_array()
            .context(r#""paths" value is not a subarray"#)?;
        let file = paths
            .0
            .get("file_path")
            .context(r#"no "file_path" in subarray"#)?
            .as_string()
            .context(r#""file_path" value is not a string"#)?
            .to_owned();
        let page = paths
            .0
            .get("page_path")
            .context(r#"no "page_path" in subarray"#)?
            .as_string()
            .context(r#""page_path" value is not a string"#)?
            .to_owned();

        Ok(SitePaths { file, page })
    }
}

fn array(input: &str) -> IResult<&str, Array> {
    let (rest, pairs) = delimited(
        tag("a:"),
        length_count(terminated(length, tag(":{")), key_value),
        tag("}"),
    )(input)?;

    Ok((rest, Array(pairs.into_iter().collect())))
}

fn string(input: &str) -> IResult<&str, &str> {
    map(
        preceded(
            tag("s:"),
            length_data(terminated(map(length, |len| len + 2), tag(":"))),
        ),
        |s: &str| &s[1..(s.len() - 1)],
    )(input)
}

fn length(input: &str) -> IResult<&str, usize> {
    map(u64, |u| u.to_usize())(input)
}

fn key_value(input: &str) -> IResult<&str, (String, Value)> {
    map(
        terminated(separated_pair(string, tag(";"), value), opt(tag(";"))),
        |(k, v)| (k.to_owned(), v),
    )(input)
}

fn value(input: &str) -> IResult<&str, Value> {
    alt((
        map(string, |str| Value::String(str.to_owned())),
        map(array, Value::Array),
    ))(input)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn parse_string() {
        let result = complete(all_consuming(string))(r#"s:5:"paths""#);

        assert!(result.is_ok());
        assert_eq!("paths", result.unwrap().1);
    }

    #[test]
    fn parse_empty_array() {
        let result = r#"a:0:{}"#.parse::<Array>();
        assert!(result.is_ok());
        assert_eq!(result.unwrap().0.len(), 0);
    }

    #[test]
    fn parse_nested_array() {
        let result = r#"a:1:{s:5:"inner";a:0:{};}"#.parse::<Array>();
        assert!(result.is_ok());
        let array = result.unwrap().0;
        assert_eq!(array.len(), 1);
        assert!(array.get("inner").is_some());
        assert!(array.get("inner").unwrap().as_array().is_some());
        assert_eq!(array.get("inner").unwrap().as_array().unwrap().0.len(), 0);
    }

    #[test]
    fn parse_array() {
        let result =
            r#"a:2:{s:9:"file_path";s:39:"https://test-commons.wikimedia.org/w/$1";s:9:"page_path";s:42:"https://test-commons.wikimedia.org/wiki/$1";}"#.parse::<Array>();

        assert!(result.is_ok());
        let array = result.unwrap().0;
        assert_eq!(array.len(), 2);

        assert_eq!(
            *array.get("file_path").unwrap(),
            Value::String("https://test-commons.wikimedia.org/w/$1".to_string())
        );
        assert!(array.get("page_path").is_some());
        assert_eq!(
            *array.get("page_path").unwrap(),
            Value::String("https://test-commons.wikimedia.org/wiki/$1".to_string())
        );
    }

    #[test]
    fn parse_test_commons() {
        let result =
            r#"a:1:{s:5:"paths";a:2:{s:9:"file_path";s:39:"https://test-commons.wikimedia.org/w/$1";s:9:"page_path";s:42:"https://test-commons.wikimedia.org/wiki/$1";}}"#.parse::<SitePaths>();

        log::debug!("parse result: {:?}", result);

        assert!(result.is_ok());
        assert_eq!(
            result.unwrap(),
            SitePaths {
                file: "https://test-commons.wikimedia.org/w/$1".to_string(),
                page: "https://test-commons.wikimedia.org/wiki/$1".to_string(),
            }
        );
    }
}
