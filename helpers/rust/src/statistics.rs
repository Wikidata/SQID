use crate::{
    jobs::schedule_dump_processing,
    types::{sitelinks, ClassRecord, DataFile, DumpStatistics, Item, Settings, Statistics},
};
use anyhow::{Context, Result};
use chrono::{Date, NaiveDate, TimeZone, Utc};
use flate2::read::GzDecoder;
use std::{
    cmp::Ordering,
    collections::HashMap,
    fs::{self, File},
    io::{BufRead, BufReader},
};

fn into_description(ordering: Ordering) -> String {
    match ordering {
        Ordering::Less => "newer",
        Ordering::Equal => "still current",
        Ordering::Greater => "older",
    }
    .into()
}

/// Check for a new dump file. If present, queue a job on the grid to
/// rebuild the full statistics.
pub(super) fn check_for_new_dump(settings: &Settings) -> Result<()> {
    let last_processed_dump = settings
        .get_dump_date()?
        .unwrap_or_else(|| Utc.ymd(1970, 1, 1));

    log::info!(
        "Current dump is dated {}, checking for new dump ...",
        last_processed_dump
    );

    log::debug!(
        "Enumerating dumps in {}",
        settings.dump_directory.to_str().unwrap()
    );
    let mut dumps = fs::read_dir(settings.dump_directory.as_ref())?
        .filter(|entry| {
            entry
                .as_ref()
                .map(|entry| entry.path().is_dir())
                .unwrap_or(false)
        })
        .filter_map(|entry| {
            entry
                .map(|direntry| direntry.file_name().into_string().ok())
                .unwrap_or(None)
                .filter(|directory| settings.is_usable_dump(directory))
        })
        .collect::<Vec<String>>();
    dumps.sort_unstable();

    let latest_dump = dumps.last().context("Could not find any dumps")?;

    let latest: Date<Utc> = Date::from_utc(NaiveDate::parse_from_str(latest_dump, "%Y%m%d")?, Utc);
    let order = last_processed_dump.cmp(&latest);

    log::info!(
        "Latest dump is dated {}, which is {}",
        latest,
        into_description(order)
    );

    if order == Ordering::Less {
        schedule_dump_processing(
            settings
                .dump_file(latest_dump)
                .to_str()
                .expect("valid UTF-8"),
            &latest,
        )?;
    }

    Ok(())
}

pub(super) fn update_sitelinks(settings: &Settings) -> Result<()> {
    log::info!("Fetching sitelink information");
    let sitelinks = sitelinks()?;

    log::info!("Reading old sitelink data ...");
    let mut statistics: Statistics = settings.get_data(DataFile::Statistics)?;

    log::info!("Augmenting current sitelink data ...");
    statistics.update_sitelinks(sitelinks);
    log::info!("Augmented current sitelink data.");
    settings.replace_data(DataFile::Statistics, &statistics)
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

    let stats: Statistics = settings.get_data(DataFile::Statistics)?;
    let classes: HashMap<Item, ClassRecord> = settings.get_data(DataFile::Classes)?;
    let mut count: usize = 0;
    let mut statistics =
        DumpStatistics::with_classes_and_sites(classes, &mut stats.sites.into_iter());

    statistics.clear_counters();

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

    statistics.finalise(settings)
}
