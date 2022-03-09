use crate::types::{sitelinks, DataFile, DumpStatistics, Settings, Statistics};
use anyhow::{Context, Result};
use chrono::{Date, NaiveDate, TimeZone, Utc};
use flate2::read::GzDecoder;
use std::{
    fs::{self, File},
    io::{BufRead, BufReader},
};

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
        NaiveDate::parse_from_str(dumps.last().context("Could not find any dumps")?, "%Y%m%d")?,
        Utc,
    );
    let order = last_dump.cmp(&latest);

    log::info!(
        "Latest dump is dated {}, which is {}",
        latest,
        match order {
            std::cmp::Ordering::Less => "newer",
            std::cmp::Ordering::Equal => "still current",
            std::cmp::Ordering::Greater => "older",
        }
    );

    todo!()
}

pub(super) fn update_sitelinks(settings: &Settings) -> Result<()> {
    log::info!("Fetching sitelink information");
    let sitelinks = sitelinks()?;

    log::info!("Reading old sitelink data ...");
    let mut statistics: Statistics = settings.get_data(DataFile::Statistics)?;

    log::info!("Augmenting current sitelink data ...");
    statistics.update_sitelinks(sitelinks);
    log::info!("Augmented current sitelink data.");
    Ok(())
}

/// Actually process the dump file to gather statistics
pub(super) fn process_dump(settings: &Settings) -> Result<()> {
    let dump_info = settings
        .dump_info
        .as_ref()
        .context("dump info should be set")?;

    log::info!(
        "Processing dump {}, dated {}",
        dump_info.path.to_str().context("dump path should parse")?,
        dump_info.date
    );

    let dump = File::open(dump_info.path.as_path())?;
    let decoder = GzDecoder::new(dump);
    let mut reader = BufReader::new(decoder);
    let mut line = String::new();

    reader.read_line(&mut line)?;
    assert_eq!(line, "[\n");

    let mut stats: Statistics = settings.get_data(DataFile::Statistics)?;
    let mut count: usize = 0;
    let mut statistics = DumpStatistics::with_sites(&mut stats.sites.into_iter());
    loop {
        count += 1;
        line.clear();
        reader.read_line(&mut line)?;

        if count % 100 == 0 {
            log::debug!("line {}", count);
        }

        if line.starts_with(']') {
            break;
        };

        statistics.process_line(&line)?;
    }

    assert_eq!(line, "]\n");

    todo!()
}
