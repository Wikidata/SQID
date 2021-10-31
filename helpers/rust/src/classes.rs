use crate::sparql;
use crate::types::Settings;
use anyhow::Result;

pub(super) fn update_class_records(_settings: &Settings) -> Result<()> {
    log::info!("Fetching class ids and labels for classes with direct instances ...");
    let classes = sparql::classes();
    log::info!("Fetched class ids and labels for classes with direct instances.");
    log::trace!("{:?}", classes);
    Ok(())
}
