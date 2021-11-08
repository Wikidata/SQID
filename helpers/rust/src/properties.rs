use std::collections::HashMap;

use crate::{
    sparql,
    types::{
        DataFile, Properties, Property, PropertyClassification, PropertyDataFile,
        PropertyUsageRecord, Settings, Type,
    },
};
use anyhow::Result;

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
    let mut properties: Properties = settings.get_data(DataFile::Properties)?;

    log::info!("Augmenting current property data ...");
    properties.update_labels_and_types(labels_and_types.into_iter());
    properties.update_usage(usage.into_iter());
    log::trace!("{:?}", properties);
    settings.replace_data(DataFile::Properties, &properties)?;
    log::info!("Augmented current property data.");

    settings.update_timestamp(DataFile::Properties)
}

/// Updates all derived property records.
pub(super) fn update_derived_property_records(settings: &Settings) -> Result<()> {
    let properties: Properties = settings.get_data(DataFile::Properties)?;

    derive_property_classification(settings, &properties)?;
    derive_related_properties(settings, &properties)?;
    derive_url_patters(settings, &properties)?;
    derive_property_usage(settings, &properties)?;
    derive_property_datatypes(settings, &properties)
}

/// Derives the property classification from property statistics.
fn derive_property_classification(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving property classification ...");

    let classification: HashMap<Property, PropertyClassification> = HashMap::from_iter(
        properties
            .0
            .iter()
            .map(|(pid, property)| (*pid, property.classification(pid))),
    );

    settings.replace_data(
        DataFile::SplitProperties(PropertyDataFile::Classification),
        &classification,
    )
}

/// Derives the list of related properties from property statistics.
pub(super) fn derive_related_properties(
    settings: &Settings,
    properties: &Properties,
) -> Result<()> {
    log::info!("Deriving related properties ...");

    let related: HashMap<Property, &HashMap<Property, usize>> = HashMap::from_iter(
        properties
            .0
            .iter()
            .map(|(pid, property)| (*pid, &property.related_properties)),
    );

    settings.replace_data(
        DataFile::SplitProperties(PropertyDataFile::Related),
        &related,
    )?;
    settings.replace_chunked_data(
        DataFile::SplitProperties(PropertyDataFile::Related),
        &related,
        10,
    )
}

/// Derives the list of URL patterns from property statistics.
pub(super) fn derive_url_patters(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving URL patterns ...");

    let patterns: HashMap<Property, &String> = HashMap::from_iter(
        properties
            .0
            .iter()
            .filter_map(|(pid, property)| Some((*pid, property.url_pattern.as_ref()?))),
    );

    settings.replace_data(
        DataFile::SplitProperties(PropertyDataFile::URLPatterns),
        &patterns,
    )
}

/// Derives the property usage statistics from property statistics.
pub(super) fn derive_property_usage(settings: &Settings, properties: &Properties) -> Result<()> {
    log::info!("Deriving property usage ...");

    let usage: HashMap<Property, PropertyUsageRecord> = HashMap::from_iter(
        properties
            .0
            .iter()
            .map(|(pid, property)| (*pid, property.project_to_usage())),
    );

    settings.replace_data(DataFile::SplitProperties(PropertyDataFile::Usage), &usage)
}

/// Derives the property datatype information from property statistics.
pub(super) fn derive_property_datatypes(
    settings: &Settings,
    properties: &Properties,
) -> Result<()> {
    log::info!("Deriving property datatypes ...");

    let types: HashMap<Property, Type> = HashMap::from_iter(
        properties
            .0
            .iter()
            .filter_map(|(pid, property)| Some((*pid, property.datatype?))),
    );

    settings.replace_data(
        DataFile::SplitProperties(PropertyDataFile::Datatypes),
        &types,
    )
}
