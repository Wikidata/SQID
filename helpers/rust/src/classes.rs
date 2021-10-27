use crate::sparql;
use crate::types::Settings;
use anyhow::Result;

pub(super) fn update_class_records(_settings: &Settings) -> Result<()> {
    log::info!(target: "sqid::classes", "Fetching class ids and labels for classes with direct instances ...");
    let classes = sparql::classes();
    log::info!(target: "sqid::classes", "Fetched class ids and labels for classes with direct instances.");
    log::debug!(target: "sqid::classes", "{:?}", classes);
    Ok(())
}
