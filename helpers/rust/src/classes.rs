use std::collections::HashMap;

use crate::{
    sparql,
    types::{ClassDataFile, Classes, DataFile, Settings},
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

pub(super) fn update_derived_class_records(settings: &Settings) -> Result<()> {
    derive_class_hierarchy(settings)
}

pub(super) fn derive_class_hierarchy(settings: &Settings) -> Result<()> {
    log::info!("Deriving class hierarchy ...");
    let classes: Classes = serde_json::from_reader(settings.data_file(DataFile::Classes)?)?;
    let mut hierarchy = HashMap::new();
    classes.0.iter().for_each(|(cid, class)| {
        let _ = hierarchy.insert(cid, class.project_to_hierarchy());
    });

    settings.replace_data_file(DataFile::SplitClasses(ClassDataFile::Hierarchy), |file| {
        serde_json::to_writer(file, &hierarchy).context("Failed to serialise class hierarchy")
    })?;

    hierarchy
        .iter()
        .collect::<Vec<_>>()
        .chunks(1000)
        .enumerate()
        .map(|(idx, chunk)| {
            let mut hierarchy = HashMap::new();

            chunk.iter().for_each(|(cid, class)| {
                hierarchy.insert(**cid, *class);
            });

            settings.replace_data_file(
                DataFile::SplitClasses(ClassDataFile::HierarchyChunk(idx)),
                |file| {
                    serde_json::to_writer(file, &hierarchy)
                        .context(format!("Failed to serialise classes chunk {}", idx))
                },
            )
        })
        .collect()
}
