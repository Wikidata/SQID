use crate::types::Settings;
use anyhow::Result;
use chrono::{Date, Utc};

/// Check for a new dump file. If present, queue a job on the grid to
/// rebuild the full statistics.
pub(super) fn check_for_new_dump(settings: &Settings) -> Result<()> {
    let last_dump = settings.get_dump_date()?;
    log::info!(
        "Current dump is dated {}, checking for new dump ...",
        last_dump
    );

    //let basedir = settings.dump_directory;

    todo!()
}

pub(super) fn process_dump(_settings: &Settings, _new_dump: Date<Utc>) -> Result<()> {
    todo!()
}
