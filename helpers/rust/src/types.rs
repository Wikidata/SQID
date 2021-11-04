use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Utc};
use std::{fmt::Display, fs::File, path::PathBuf};
use strum::Display;
use tempfile::NamedTempFile;

mod ids;
mod json;
mod sparql;

pub use ids::{Entity, Item, Property, Qualifier, Reference};
pub use json::{
    ClassRecord, Classes, EntityStatistics, Properties, PropertyRecord, SiteRecord, Statistics,
    Type,
};
pub use sparql::{ClassLabelAndUsage, PropertyLabelAndType, PropertyUsage, PropertyUsageType};

/// Returns true if the value is zero. Used to skip serialisation for
/// empty counters.
pub(crate) fn is_zero(value: &usize) -> bool {
    *value == 0
}

/// Holds settings given on the command line, particularly the path to
/// the data directories.
#[derive(Debug)]
pub(crate) struct Settings {
    data_directory: Box<PathBuf>,
}

/// The different kinds of split properties files we use and/or update.
#[derive(Debug, Display)]
#[strum(serialize_all = "lowercase")]
pub enum PropertyDataFile {
    /// `properties/classification.json`
    Classification,
    /// `properties/related.json`
    Related,
    /// `properties/related-<chunk>.json`
    #[strum(disabled)]
    RelatedChunk(usize),
    /// `properties/urlpatterns.json`
    URLPatterns,
    /// `properties/usage.json`
    Usage,
    /// `properties/datatypes.json`
    Datatypes,
}

/// The different data files we use and/or update.
#[derive(Debug)]
pub enum DataFile {
    /// `properties.json`
    Properties,
    /// `properties/<name>.json`
    SplitProperties(PropertyDataFile),
    /// `classes.json`
    Classes,
    /// `statistics.json`
    Statistics,
}

impl DataFile {
    fn has_timestamp(&self) -> bool {
        match self {
            Self::Properties => true,
            Self::Classes => true,
            Self::Statistics => false,
            Self::SplitProperties(_) => false,
        }
    }

    fn with_timestamp(
        &self,
        statistics: &mut Statistics,
        update: impl FnOnce(&mut Option<DateTime<Utc>>) -> Result<()>,
    ) -> Result<()> {
        match self {
            Self::Properties => update(&mut statistics.property_update),
            Self::Classes => update(&mut statistics.class_update),
            _ => match self.has_timestamp() {
                false => Ok(()),
                true => Err(anyhow!("Data file {:?} has no associated timestamp.")),
            },
        }
    }
}

impl Display for DataFile {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Self::Properties => "properties".to_string(),
                Self::Classes => "classes".to_string(),
                Self::Statistics => "statistics".to_string(),
                Self::SplitProperties(PropertyDataFile::RelatedChunk(chunk)) =>
                    format!("properties/related-{}", chunk),
                Self::SplitProperties(kind) => format!("properties/{}", kind),
            }
        )
    }
}

impl Settings {
    /// Constructs a new settings object with data directory set to `path`.
    pub fn new(data: &str) -> Self {
        Self {
            data_directory: Box::new(data.into()),
        }
    }

    /// Returns the path to the given [`DataFile`].
    fn data_file_path(&self, data_file: DataFile) -> PathBuf {
        self.data_directory
            .join(data_file.to_string())
            .with_extension("json")
    }

    /// Opens the given [`DataFile`].
    pub fn data_file(&self, data_file: DataFile) -> std::io::Result<File> {
        File::open(self.data_file_path(data_file))
    }

    /// Replaces the given [`DataFile`] atomically, by applying the `write`
    /// closure to obtain the file contents.
    pub fn replace_data_file(
        &self,
        data_file: DataFile,
        write: impl FnOnce(&mut File) -> Result<()>,
    ) -> Result<()> {
        let path = *self.data_directory.clone();
        let mut file = NamedTempFile::new_in(path)?;
        let name = data_file.to_string();

        log::debug!("Writing new JSON data: {} ...", name);
        write(file.as_file_mut())?;
        log::debug!("Wrote new JSON file: {} ...", name);

        file.persist(self.data_file_path(data_file))?;

        log::debug!("Update for {} complete.", name);

        Ok(())
    }

    /// Update the timestamp for [`DataFile`] `data_file`.
    pub fn update_timestamp(&self, data_file: DataFile) -> Result<()> {
        log::debug!("Updating timestamp for {}", data_file);
        if data_file.has_timestamp() {
            let mut statistics = serde_json::from_reader(self.data_file(DataFile::Statistics)?)?;
            data_file.with_timestamp(&mut statistics, |timestamp| {
                *timestamp = Some(Utc::now());
                Ok(())
            })?;
            self.replace_data_file(DataFile::Statistics, |file| {
                serde_json::to_writer(file, &statistics).context("Failed to serialise statistics")
            })
        } else {
            Err(anyhow!(
                "Data file {} has no associated timestamp.",
                data_file
            ))
        }
    }
}

#[cfg(test)]
mod test {
    use super::{DataFile, PropertyDataFile};
    use test_env_log::test;

    #[test]
    fn test_data_file_names() {
        assert_eq!(DataFile::Properties.to_string(), "properties");
        assert_eq!(DataFile::Classes.to_string(), "classes");
        assert_eq!(DataFile::Statistics.to_string(), "statistics");
        assert_eq!(
            DataFile::SplitProperties(PropertyDataFile::Classification).to_string(),
            "properties/classification"
        );
        assert_eq!(
            DataFile::SplitProperties(PropertyDataFile::Related).to_string(),
            "properties/related"
        );
        assert_eq!(
            DataFile::SplitProperties(PropertyDataFile::URLPatterns).to_string(),
            "properties/urlpatterns"
        );
        assert_eq!(
            DataFile::SplitProperties(PropertyDataFile::Usage).to_string(),
            "properties/usage"
        );
        assert_eq!(
            DataFile::SplitProperties(PropertyDataFile::Datatypes).to_string(),
            "properties/datatypes"
        );
    }
}
