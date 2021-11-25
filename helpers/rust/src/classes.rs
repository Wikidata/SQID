use std::collections::HashMap;

use crate::{
    sparql,
    types::{ClassDataFile, ClassRecord, Classes, DataFile, Item, Settings},
};
use anyhow::Result;

pub(super) fn update_class_records(settings: &Settings) -> Result<()> {
    log::info!("Fetching class ids and labels for classes with direct instances ...");
    let labels_and_usage = sparql::classes()?;
    log::info!("Fetched class ids and labels for classes with direct instances.");
    log::trace!("{:?}", labels_and_usage);

    log::info!("Reading old statistics data ...");
    let mut classes: Classes = settings.get_data(DataFile::Classes)?;

    log::info!("Augmenting current class data ...");
    classes.update_labels_and_usage(labels_and_usage.into_iter());
    log::trace!("{:?}", classes);
    settings.replace_data(DataFile::Classes, &classes)?;
    log::info!("Augmented current class data.");

    settings.update_timestamp(DataFile::Classes)
}

pub(super) fn update_derived_class_records(settings: &Settings) -> Result<()> {
    let classes = settings.get_data(DataFile::Classes)?;
    derive_class_hierarchy(settings, &classes)
}

pub(super) fn derive_class_hierarchy(settings: &Settings, classes: &Classes) -> Result<()> {
    log::info!("Deriving class hierarchy ...");
    let hierarchy: HashMap<Item, ClassRecord> = HashMap::from_iter(
        classes
            .0
            .iter()
            .map(|(cid, class)| (*cid, class.project_to_hierarchy())),
    );

    settings.replace_data(DataFile::SplitClasses(ClassDataFile::Hierarchy), &hierarchy)?;
    settings.replace_chunked_data(
        DataFile::SplitClasses(ClassDataFile::Hierarchy),
        &hierarchy,
        1000,
    )
}
