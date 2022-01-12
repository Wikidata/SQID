use anyhow::{Context, Result};
use std::collections::HashMap;

use super::{
    ids::{Item, Property},
    json::{dump::Record, ClassRecord, PropertyRecord},
};

#[derive(Debug, Default)]
pub struct DumpStatistics {
    classes: HashMap<Item, ClassRecord>,
    properties: HashMap<Property, PropertyRecord>,
}

impl DumpStatistics {
    pub fn new() -> Self {
        Default::default()
    }

    pub(crate) fn process_line(&mut self, line: &str) -> Result<()> {
        let raw_record = line
            .strip_suffix('\n')
            .unwrap_or(line)
            .strip_suffix(',')
            .unwrap_or(line);

        let record: Record =
            serde_json::from_str(raw_record).context("Failed parsing the record")?;

        log::debug!("{:?}", record);

        Ok(())
    }
}
