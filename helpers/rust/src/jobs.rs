use std::{env::current_exe, process::Command};

use anyhow::{Context, Result};
use chrono::NaiveDate;

use crate::types::Settings;

pub(super) fn do_dump_processing(
    settings: &Settings,
    dump_file: &String,
    dump_date: &NaiveDate,
) -> Result<()> {
    let sqid = current_exe().context("failed to get executable path")?;
    let sqid = sqid.to_str().expect("should be valid UTF-8");
    let data_dir = settings.data_directory.to_str().expect("valid UTF-8");
    let dump_date = dump_date.format("%Y%m%d").to_string();
    let dump_file = settings.dump_file(dump_file);
    let dump_file = dump_file.to_str().expect("valid UTF-8");
    let mut command = Command::new(sqid);
    command.args([
        "--only=process-dump",
        "--data-path",
        data_dir,
        "--date",
        &dump_date,
        "--",
        dump_file,
    ]);

    log::info!("executing: {command:?}");

    let output = command
        .status()
        .context("failed to start the dump processing")?;

    if output.success() {
        log::info!("successfully processed dump");
    } else {
        log::error!("failed to start dump processing");
    }

    Ok(())
}
