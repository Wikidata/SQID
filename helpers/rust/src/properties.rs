use crate::types::Settings;
use anyhow::Result;

pub(super) fn update_property_records(_settings: &Settings) -> Result<()> {
    log::info!(target: "properties", "Fetching property ids, labels and types ...");

    Ok(())
}
