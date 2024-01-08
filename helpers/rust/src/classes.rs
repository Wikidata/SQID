use std::collections::HashMap;

use crate::{
    sparql,
    types::{ClassDataFile, ClassRecord, DataFile, Item, Settings},
};
use anyhow::Result;

pub(super) fn update_class_records(settings: &Settings) -> Result<()> {
    log::info!("Fetching class ids and labels for classes with direct instances ...");
    let labels_and_usage = sparql::classes()?;
    log::info!("Fetched class ids and labels for classes with direct instances.");

    let updates = labels_and_usage
        .into_iter()
        .map(|record| (record.class, record))
        .collect::<HashMap<_, _>>();

    settings.update_data_file(
        DataFile::Classes,
        DataFile::Classes,
        |cid: &Item, record: &ClassRecord| {
            let mut result = record.clone();

            if let Some(update) = updates.get(cid) {
                result.update_label_and_usage(update.label.clone(), update.usage);
            }

            Ok(Some(result))
        },
    )?;

    settings.update_timestamp(DataFile::Classes)
}

pub(super) fn update_derived_class_records(settings: &Settings) -> Result<()> {
    derive_class_hierarchy(settings)
}

pub(super) fn derive_class_hierarchy(settings: &Settings) -> Result<()> {
    log::info!("Deriving class hierarchy ...");

    fn project(_cid: &Item, record: &ClassRecord) -> Result<Option<ClassRecord>> {
        Ok(Some(record.project_to_hierarchy()))
    }

    let hierarchy = DataFile::SplitClasses(ClassDataFile::Hierarchy);

    settings.update_data_file(DataFile::Classes, hierarchy, project)?;
    settings.update_data_file_chunked(DataFile::Classes, hierarchy, project, 1000)
}
