use crate::sparql;
use crate::types::Settings;
use anyhow::Result;

pub(super) fn update_property_records(_settings: &Settings) -> Result<()> {
    log::info!(target: "sqid::properties", "Fetching property ids, labels and types ...");
    let properties = sparql::properties();
    log::info!(target: "sqid::properties", "Fetched property ids, labels and types.");
    log::debug!(target: "sqid::properties", "{:?}", properties);
    let usage = sparql::property_usage();
    log::debug!(target: "sqid::properties", "{:?}", usage);
    Ok(())
}
