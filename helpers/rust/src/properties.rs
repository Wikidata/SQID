use std::collections::HashMap;

use crate::types::{DataFile, PropertyDataFile, Settings};
use crate::{sparql, types::Properties};
use anyhow::{Context, Result};

/// Updates statistics for properties.
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
    settings.replace_data_file(DataFile::Properties, |file| {
        serde_json::to_writer(file, &properties).context("Failed to serialise properties")
    })?;
    log::info!("Augmented current property data.");

    settings.update_timestamp(DataFile::Properties)?;

    Ok(())
}

/// Updates all derived property records.
pub(super) fn update_derived_property_records(settings: &Settings) -> Result<()> {
    let properties: Properties =
        serde_json::from_reader(settings.data_file(DataFile::Properties)?)?;

    derive_property_classification(settings, &properties)?;
    derive_related_properties(settings, &properties)?;
    derive_url_patters(settings, &properties)?;
    derive_property_usage(settings, &properties)?;
    derive_property_datatypes(settings, &properties)?;

    Ok(())
}

/// Derives the property classification from property statistics.
fn derive_property_classification(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving property classification ...");

    let mut classification = HashMap::new();
    properties.0.iter().for_each(|(pid, property)| {
        classification.insert(pid, property.classification(pid));
    });

    settings.replace_data_file(
        DataFile::SplitProperties(PropertyDataFile::Classification),
        |file| {
            serde_json::to_writer(file, &classification)
                .context("Failed to serialise property classification")
        },
    )
}

/// Derives the list of related properties from property statistics.
fn derive_related_properties(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving related properties ...");

    let mut related = HashMap::new();
    properties.0.iter().for_each(|(pid, property)| {
        if !property.related_properties.is_empty() {
            related.insert(pid, &property.related_properties);
        }
    });

    settings.replace_data_file(
        DataFile::SplitProperties(PropertyDataFile::Related),
        |file| {
            serde_json::to_writer(file, &related).context("Failed to serialise related properties")
        },
    )?;

    related
        .iter()
        .collect::<Vec<_>>()
        .chunks(10)
        .enumerate()
        .map(|(idx, chunk)| {
            let mut related = HashMap::new();

            chunk.iter().for_each(|(pid, related_properties)| {
                related.insert(**pid, **related_properties);
            });

            settings.replace_data_file(
                DataFile::SplitProperties(PropertyDataFile::RelatedChunk(idx)),
                |file| {
                    serde_json::to_writer(file, &related).context(format!(
                        "Failed to serialise related properties chunk {}",
                        idx
                    ))
                },
            )
        })
        .collect()
}

/// Derives the list of URL patterns from property statistics.
fn derive_url_patters(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving URL patterns ...");

    let mut patterns = HashMap::new();
    properties.0.iter().for_each(|(pid, property)| {
        if property.url_pattern.is_some() {
            patterns.insert(
                pid,
                property
                    .url_pattern
                    .clone()
                    .expect("URL pattern cannot be empty"),
            );
        }
    });

    settings.replace_data_file(
        DataFile::SplitProperties(PropertyDataFile::URLPatterns),
        |file| serde_json::to_writer(file, &patterns).context("Failed to serialise URL patterns"),
    )
}

/// Derives the property usage statistics from property statistics.
fn derive_property_usage(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving property usage ...");

    let mut usage = HashMap::new();
    properties.0.iter().for_each(|(pid, property)| {
        usage.insert(pid, property.project_to_usage());
    });

    settings.replace_data_file(DataFile::SplitProperties(PropertyDataFile::Usage), |file| {
        serde_json::to_writer(file, &usage).context("Failed to serialise property usage")
    })
}

/// Derives the property datatype information from property statistics.
fn derive_property_datatypes(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving property datatypes ...");

    let mut types = HashMap::new();
    properties.0.iter().for_each(|(pid, property)| {
        if property.datatype.is_some() {
            types.insert(pid, property.datatype.expect("datatype cannot be empty"));
        }
    });

    settings.replace_data_file(
        DataFile::SplitProperties(PropertyDataFile::Datatypes),
        |file| {
            serde_json::to_writer(file, &types).context("Failed to serialise property datatypes")
        },
    )
}
