use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    fmt::Display,
    fs::{metadata, File},
    hash::Hash,
    io::BufWriter,
    os::unix::prelude::PermissionsExt,
    path::PathBuf,
};
use strum::Display;
use tempfile::NamedTempFile;

mod ids;
mod json;
mod php;
mod sparql;
mod sql;
mod statistics;

pub use ids::{properties, Entity, Item, Property, Qualifier, Reference};
pub use json::{
    formats::date::date_from_str, ClassRecord, Classes, EntityStatistics, Properties,
    PropertyClassification, PropertyRecord, PropertyUsageRecord, SiteRecord, Statistics, Type,
};
pub use sparql::{ClassLabelAndUsage, PropertyLabelAndType, PropertyUsage, PropertyUsageType};
pub use sql::sitelinks;
pub use statistics::DumpStatistics;

const DATA_FILE_MODE: u32 = 0o0644;

type Id = u32;
type Count = u32;
type LargeCount = u64;

/// Returns true if the value is zero. Used to skip serialisation for
/// empty counters.
pub(crate) fn is_zero<T: PartialEq<T> + From<u8>>(value: &T) -> bool {
    *value == 0.into()
}

/// Holds settings given on the command line, particularly the path to
/// the data directories.
#[derive(Debug, Clone)]
pub(crate) struct Settings {
    pub(crate) data_directory: Box<PathBuf>,
    pub(crate) dump_directory: Box<PathBuf>,
    pub(crate) dump_info: Option<DumpInfo>,
}

/// Holds information on the current dump file to process.
#[derive(Debug, Clone)]
pub(crate) struct DumpInfo {
    pub(crate) date: NaiveDate,
    pub(crate) path: Box<PathBuf>,
}

/// The different kinds of split properties files we use and/or update.
#[derive(Copy, Clone, Debug, Display)]
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

impl PropertyDataFile {
    fn with_chunk(&self, chunk_index: usize) -> Result<Self> {
        match self {
            PropertyDataFile::Classification => Err(anyhow!("{} is not chunked", self)),
            PropertyDataFile::Related => Ok(Self::RelatedChunk(chunk_index)),
            PropertyDataFile::RelatedChunk(_) => Ok(Self::RelatedChunk(chunk_index)),
            PropertyDataFile::URLPatterns => Err(anyhow!("{} is not chunked", self)),
            PropertyDataFile::Usage => Err(anyhow!("{} is not chunked", self)),
            PropertyDataFile::Datatypes => Err(anyhow!("{} is not chunked", self)),
        }
    }
}

/// The different kinds of split class files we use and/or update.
#[derive(Copy, Clone, Debug, Display)]
#[strum(serialize_all = "lowercase")]
pub enum ClassDataFile {
    /// `classes/hierarchy.json`
    Hierarchy,
    /// `classes/hierarchy-<chunk>.json`
    #[strum(disabled)]
    HierarchyChunk(usize),
}

impl ClassDataFile {
    fn with_chunk(&self, chunk_index: usize) -> Result<Self> {
        match self {
            ClassDataFile::Hierarchy => Ok(Self::HierarchyChunk(chunk_index)),
            ClassDataFile::HierarchyChunk(_) => Ok(Self::HierarchyChunk(chunk_index)),
        }
    }
}

/// The different data files we use and/or update.
#[derive(Copy, Clone, Debug)]
pub enum DataFile {
    /// `properties.json`
    Properties,
    /// `properties/<name>.json`
    SplitProperties(PropertyDataFile),
    /// `classes.json`
    Classes,
    /// `classes/<name>.json`
    SplitClasses(ClassDataFile),
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
            Self::SplitClasses(_) => false,
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
                true => Err(anyhow!("Data file {} has no associated timestamp.", self)),
            },
        }
    }

    fn get_timestamp(&self, statistics: &Statistics) -> Result<Option<DateTime<Utc>>> {
        match self {
            Self::Properties => Ok(statistics.property_update),
            Self::Classes => Ok(statistics.class_update),
            _ => Err(anyhow!("Data file {} has no associated timestamp.", self)),
        }
    }

    fn with_chunk(&self, chunk_index: usize) -> Result<Self> {
        match self {
            DataFile::Properties => Err(anyhow!("{} is not chunked", self)),
            DataFile::SplitProperties(kind) => {
                Ok(Self::SplitProperties(kind.with_chunk(chunk_index)?))
            }
            DataFile::Classes => Err(anyhow!("{} is not chunked", self)),
            DataFile::SplitClasses(kind) => Ok(Self::SplitClasses(kind.with_chunk(chunk_index)?)),
            DataFile::Statistics => Err(anyhow!("{} is not chunked", self)),
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
                Self::SplitClasses(ClassDataFile::HierarchyChunk(chunk)) =>
                    format!("classes/hierarchy-{}", chunk),
                Self::SplitClasses(kind) => format!("classes/{}", kind),
                Self::SplitProperties(kind) => format!("properties/{}", kind),
            }
        )
    }
}

impl Settings {
    /// Constructs a new settings object with data directory set to `path`.
    pub fn new(data: PathBuf) -> Self {
        Self {
            data_directory: Box::new(data),
            dump_directory: Box::new("/public/dumps/public/wikidatawiki/entities/".into()),
            dump_info: None,
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

    pub fn get_data<T>(&self, data_file: DataFile) -> Result<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        serde_json::from_reader(self.data_file(data_file)?)
            .context(format!("Failed to deserialise data file {}", data_file))
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

        let file = file.persist(self.data_file_path(data_file))?;
        file.set_permissions(PermissionsExt::from_mode(DATA_FILE_MODE))?;

        log::debug!("Update for {} complete.", name);

        Ok(())
    }

    pub fn replace_data<T>(&self, data_file: DataFile, value: &T) -> Result<()>
    where
        T: Serialize,
    {
        self.replace_data_file(data_file, |file| {
            serde_json::to_writer(BufWriter::new(file), value)
                .context(format!("Failed to serialise data file {data_file}"))
        })
    }

    pub fn replace_chunked_data<K, V>(
        &self,
        data_file: DataFile,
        value: &HashMap<K, V>,
        chunk_size: usize,
    ) -> Result<()>
    where
        K: Eq + Hash + Serialize,
        V: Serialize,
    {
        value
            .iter()
            .collect::<Vec<_>>()
            .chunks(chunk_size)
            .enumerate()
            .try_for_each(|(idx, chunk)| {
                let items: HashMap<&K, &V> =
                    HashMap::from_iter(chunk.iter().map(|(id, item)| (*id, *item)));
                self.replace_data(data_file.with_chunk(idx)?, &items)
            })
    }

    /// Update the timestamp for [`DataFile`] `data_file`.
    pub fn update_timestamp(&self, data_file: DataFile) -> Result<()> {
        log::debug!("Updating timestamp for {}", data_file);
        if data_file.has_timestamp() {
            let mut statistics = self.get_data(DataFile::Statistics)?;
            data_file.with_timestamp(&mut statistics, |timestamp| {
                *timestamp = Some(Utc::now());
                Ok(())
            })?;
            self.replace_data(DataFile::Statistics, &statistics)
        } else {
            Err(anyhow!(
                "Data file {} has no associated timestamp.",
                data_file
            ))
        }
    }

    #[allow(dead_code)]
    pub fn get_timestamp(&self, data_file: DataFile) -> Result<Option<DateTime<Utc>>> {
        log::debug!("Looking up timestamp for {}", data_file);
        if data_file.has_timestamp() {
            let statistics = self.get_data(DataFile::Statistics)?;
            data_file.get_timestamp(&statistics)
        } else {
            Err(anyhow!(
                "Data file {} has no associated timestamp.",
                data_file
            ))
        }
    }

    pub fn get_dump_date(&self) -> Result<Option<NaiveDate>> {
        log::debug!("Looking up dump date");
        let statistics: Statistics = self.get_data(DataFile::Statistics)?;
        Ok(statistics.dump_date)
    }

    pub(crate) fn dump_file(&self, directory: &String) -> PathBuf {
        let mut result = *self.dump_directory.clone();

        result.push(directory);
        result.push(format!("wikidata-{directory}-all.json.gz"));

        result
    }

    pub(crate) fn is_usable_dump(&self, directory: &String) -> bool {
        let metadata = metadata(self.dump_file(directory));

        metadata.map(|metadata| metadata.is_file()).unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::{DataFile, PropertyDataFile};
    use test_log::test;

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
