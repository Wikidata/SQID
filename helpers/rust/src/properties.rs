use crate::types::{DataFile, Settings};
use crate::{sparql, types::Properties};
use anyhow::{Context, Result};

pub(super) fn update_property_records(settings: &Settings) -> Result<()> {
    log::info!("Fetching property ids, labels and types ...");
    let labels_and_types = sparql::properties()?;
    log::info!("Fetched property ids, labels and types.");
    log::trace!("{:?}", labels_and_types);

    log::info!("Fetching property usage statistics ...");
    let usage = sparql::property_usage()?;
    log::info!("Fetched property usage statistics.");
    log::trace!("{:?}", usage);

    log::info!("Reading old statistics data ...");
    let mut properties: Properties =
        serde_json::from_reader(settings.data_file(DataFile::Properties)?)?;

    log::info!("Augmenting current property data ...");
    properties.update_labels_and_types(labels_and_types.into_iter());
    properties.update_usage(usage.into_iter());
    log::trace!("{:?}", properties);
    settings.replace_data_file(DataFile::Properties, &mut |file| {
        serde_json::to_writer(file, &properties).context("Failed to serialise properties")
    })?;
    log::info!("Augmented current property data.");

    settings.update_timestamp(DataFile::Properties)?;

    Ok(())
}
