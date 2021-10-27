use crate::types::Settings;
use crate::{sparql, types::Properties};
use anyhow::Result;

pub(super) fn update_property_records(_settings: &Settings) -> Result<()> {
    log::info!(target: "sqid::properties", "Fetching property ids, labels and types ...");
    let labels_and_types = sparql::properties()?;
    log::info!(target: "sqid::properties", "Fetched property ids, labels and types.");
    log::trace!(target: "sqid::properties", "{:?}", labels_and_types);
    let usage = sparql::property_usage()?;
    log::trace!(target: "sqid::properties", "{:?}", usage);

    let mut properties = Properties::new();
    properties.update_labels_and_types(labels_and_types.into_iter());
    properties.update_usage(usage.into_iter());
    log::trace!(target: "sqid::properties", "{:?}", properties);

    Ok(())
}
