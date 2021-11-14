use crate::types::Settings;
use anyhow::{Context, Result};
use chrono::{Date, NaiveDate, TimeZone, Utc};
use std::fs;

/// Check for a new dump file. If present, queue a job on the grid to
/// rebuild the full statistics.
pub(super) fn check_for_new_dump(settings: &Settings) -> Result<()> {
    let last_dump = settings
        .get_dump_date()?
        .unwrap_or_else(|| Utc.ymd(1970, 1, 1));

    log::info!(
        "Current dump is dated {}, checking for new dump ...",
        last_dump
    );

    log::debug!(
        "Enumerating dumps in {}",
        settings.dump_directory.to_str().unwrap()
    );
    let mut dumps = fs::read_dir(&settings.dump_directory.as_ref())?
        .filter(|entry| {
            entry
                .as_ref()
                .map(|entry| entry.path().is_dir())
                .unwrap_or(false)
        })
        .into_iter()
        .filter_map(|entry| {
            entry
                .map(|direntry| direntry.file_name().into_string().ok())
                .unwrap_or(None)
        })
        .collect::<Vec<String>>();
    dumps.sort_unstable();
    let latest: Date<Utc> = Date::from_utc(
        NaiveDate::parse_from_str(dumps.last().context("Could not find any dumps")?, "%Y%M%d")?,
        Utc,
    );

    log::info!("Latest dump is dated {}", latest);

    todo!()
}

pub(super) fn process_dump(_settings: &Settings, _new_dump: Date<Utc>) -> Result<()> {
    todo!()
}
