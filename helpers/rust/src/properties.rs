use std::collections::HashMap;

use crate::{
    sparql,
    types::{
        Count, DataFile, Property, PropertyDataFile, PropertyLabelAndType, PropertyRecord,
        PropertyUsage, Settings,
    },
};
use anyhow::Result;

/// Updates statistics for properties.
pub(super) fn update_property_records(settings: &Settings) -> Result<()> {
    #[derive(Debug)]
    struct Update {
        label_and_type: PropertyLabelAndType,
        usage: Vec<PropertyUsage>,
    }

    let mut updates = HashMap::<Property, Update>::new();

    log::info!("Fetching property ids, labels and types ...");
    let mut labels_and_types = sparql::properties()?;
    log::info!("Fetched property ids, labels and types.");

    for label_and_type in labels_and_types.drain(..) {
        updates
            .entry(
                label_and_type
                    .property
                    .as_property()
                    .expect("is a property"),
            )
            .and_modify(|e| e.label_and_type = label_and_type.clone())
            .or_insert_with(|| Update {
                label_and_type,
                usage: Vec::new(),
            });
    }

    log::info!("Fetching property usage statistics ...");
    let mut usage = sparql::property_usage()?;
    log::info!("Fetched property usage statistics.");

    for usage in usage.drain(..) {
        let property = usage.property();
        if let Some(update) = updates.get_mut(&property) {
            update.usage.push(usage);
        } else {
            log::warn!("Unknown type for property {property} with usage information, ignoring");
        };
    }

    settings.update_data_file(
        DataFile::Properties,
        DataFile::Properties,
        |property: &Property, record: &PropertyRecord| {
            let mut result = record.clone();

            if let Some(update) = updates.get(property) {
                result.update_label_and_type(
                    update.label_and_type.label.clone(),
                    update.label_and_type.datatype,
                );

                for usage in &update.usage {
                    result.update_usage(usage);
                }
            }

            Ok(Some(result))
        },
    )?;

    log::info!("Augmented current property data.");
    settings.update_timestamp(DataFile::Properties)
}

/// Updates all derived property records.
pub(super) fn update_derived_property_records(settings: &Settings) -> Result<()> {
    derive_property_classification(settings)?;
    derive_related_properties(settings)?;
    derive_url_patterns(settings)?;
    derive_property_usage(settings)?;
    derive_property_datatypes(settings)
}

/// Derives the property classification from property statistics.
fn derive_property_classification(settings: &Settings) -> Result<()> {
    log::info!("Deriving property classification ...");

    settings.update_data_file(
        DataFile::Properties,
        DataFile::SplitProperties(PropertyDataFile::Classification),
        |pid: &Property, record: &PropertyRecord| Ok(Some((*pid, record.classification(pid)))),
    )
}

/// Derives the list of related properties from property statistics.
pub(super) fn derive_related_properties(settings: &Settings) -> Result<()> {
    log::info!("Deriving related properties ...");

    fn related(
        _pid: &Property,
        record: &PropertyRecord,
    ) -> Result<Option<HashMap<Property, Count>>> {
        Ok(Some(record.related_properties.clone()))
    }

    settings.update_data_file(
        DataFile::Properties,
        DataFile::SplitProperties(PropertyDataFile::Related),
        related,
    )?;

    settings.update_data_file_chunked(
        DataFile::Properties,
        DataFile::SplitProperties(PropertyDataFile::Related),
        related,
        10,
    )
}

/// Derives the list of URL patterns from property statistics.
pub(super) fn derive_url_patterns(settings: &Settings) -> Result<()> {
    log::info!("Deriving URL patterns ...");

    fn patterns(_pid: &Property, record: &PropertyRecord) -> Result<Option<String>> {
        Ok(record.url_pattern.clone())
    }

    settings.update_data_file(
        DataFile::Properties,
        DataFile::SplitProperties(PropertyDataFile::URLPatterns),
        patterns,
    )
}

/// Derives the property usage statistics from property statistics.
pub(super) fn derive_property_usage(settings: &Settings) -> Result<()> {
    log::info!("Deriving property usage ...");

    settings.update_data_file(
        DataFile::Properties,
        DataFile::SplitProperties(PropertyDataFile::Usage),
        |_pid: &Property, record: &PropertyRecord| Ok(Some(record.project_to_usage())),
    )
}

/// Derives the property datatype information from property statistics.
pub(super) fn derive_property_datatypes(settings: &Settings) -> Result<()> {
    log::info!("Deriving property datatypes ...");

    settings.update_data_file(
        DataFile::Properties,
        DataFile::SplitProperties(PropertyDataFile::Datatypes),
        |_pid: &Property, record: &PropertyRecord| Ok(record.datatype),
    )
}
