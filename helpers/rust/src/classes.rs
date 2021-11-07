use crate::{
    sparql,
    types::{Classes, DataFile, Settings},
};
use anyhow::{Context, Result};

pub(super) fn update_class_records(settings: &Settings) -> Result<()> {
    log::info!("Fetching class ids and labels for classes with direct instances ...");
    let labels_and_usage = sparql::classes()?;
    log::info!("Fetched class ids and labels for classes with direct instances.");
    log::trace!("{:?}", labels_and_usage);

    log::info!("Reading old statistics data ...");
    let mut classes: Classes = serde_json::from_reader(settings.data_file(DataFile::Classes)?)?;

    log::info!("Augmenting current class data ...");
    classes.update_labels_and_usage(labels_and_usage.into_iter());
    log::trace!("{:?}", classes);
    settings.replace_data_file(DataFile::Classes, |file| {
        serde_json::to_writer(file, &classes).context("Failed to serialise classes")
    })?;
    log::info!("Augmented current class data.");

    settings.update_timestamp(DataFile::Classes)
}
