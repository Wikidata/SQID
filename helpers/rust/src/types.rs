use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Utc};
use std::{fs::File, path::PathBuf};
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

/// Holds settings given on the command line, particularly the path to
/// the data directories.
#[derive(Debug)]
pub(crate) struct Settings {
    data_directory: Box<PathBuf>,
}

/// The different data files we use and/or update.
#[derive(Debug, Display)]
#[strum(serialize_all = "lowercase")]
pub enum DataFile {
    /// `properties.json`
    Properties,
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
            Self::Statistics => Ok(()),
        }
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
        write: &mut impl FnMut(&mut File) -> Result<()>,
    ) -> Result<()> {
        let path = *self.data_directory.clone();
        let mut file = NamedTempFile::new_in(path)?;

        write(file.as_file_mut())?;

        file.persist(self.data_file_path(data_file))?;

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
            self.replace_data_file(DataFile::Statistics, &mut |file| {
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
