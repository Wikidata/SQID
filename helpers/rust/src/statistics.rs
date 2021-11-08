use crate::types::Settings;
use anyhow::Result;
use chrono::{Date, Utc};
use std::fs;

/// Check for a new dump file. If present, queue a job on the grid to
/// rebuild the full statistics.
pub(super) fn check_for_new_dump(settings: &Settings) -> Result<()> {
    let last_dump = settings.get_dump_date()?;
    log::info!(
        "Current dump is dated {}, checking for new dump ...",
        last_dump
    );

    log::debug!(
        "Enumerating dumps in {}",
        settings.dump_directory.to_str().unwrap()
    );
    fs::read_dir(&settings.dump_directory.as_ref())?
        .filter(|entry| {
            entry
                .as_ref()
                .map(|entry| entry.path().is_dir())
                .unwrap_or(false)
        })
        .into_iter()
        .for_each(|subdir| {
            log::debug!("Found dump: {:?}", subdir.map(|sd| sd.file_name()));
        });

    todo!()
}

pub(super) fn process_dump(_settings: &Settings, _new_dump: Date<Utc>) -> Result<()> {
    todo!()
}
