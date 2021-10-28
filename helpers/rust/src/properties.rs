use crate::types::Settings;
use crate::{sparql, types::Properties};
use anyhow::Result;

pub(super) fn update_property_records(settings: &Settings) -> Result<()> {
    log::info!(target: "sqid::properties", "Fetching property ids, labels and types ...");
    let labels_and_types = sparql::properties()?;
    log::info!(target: "sqid::properties", "Fetched property ids, labels and types.");
    log::trace!(target: "sqid::properties", "{:?}", labels_and_types);

    log::info!(target: "sqid::properties", "Fetching property usage statistics ...");
    let usage = sparql::property_usage()?;
    log::info!(target: "sqid::properties", "Fetched property usage statistics.");
    log::trace!(target: "sqid::properties", "{:?}", usage);

    log::info!(target: "sqid::properties", "Augmenting current property data ...");
    let mut properties: Properties = serde_json::from_reader(settings.data_file("properties")?)?;
    properties.update_labels_and_types(labels_and_types.into_iter());
    properties.update_usage(usage.into_iter());
    log::trace!(target: "sqid::properties", "{:?}", properties);
    log::info!(target: "sqid::properties", "Augmented current property data.");

    Ok(())
}
