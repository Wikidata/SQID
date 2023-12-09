use std::{env::current_exe, process::Command};

use anyhow::{Context, Result};
use chrono::NaiveDate;
use strum::Display;

#[derive(Debug, Display, Default, Copy, Clone, PartialEq, Eq)]
#[strum(serialize_all = "lowercase")]
#[allow(dead_code)]
enum Notifications {
    #[default]
    None,
    OnFailure,
    OnFinish,
    All,
}

const DUMP_NAME: &str = "sqid-process-dump";
const DUMP_IMAGE: &str = "bookworm";
const DUMP_MEM_GB: Option<usize> = Some(4);
const DUMP_CPU: Option<usize> = Some(1);
const DUMP_NOTIFICATIONS: Notifications = Notifications::OnFailure;

pub(super) fn schedule_dump_processing(dump_file: &str, dump_date: &NaiveDate) -> Result<()> {
    let sqid = current_exe().context("failed to get executable path")?;
    let sqid = sqid.to_str().expect("should be valid UTF-8");
    let mut command = Command::new("toolforge");
    command.args(["jobs", "run", DUMP_NAME]);
    command.args([
        "--command",
        &format!("{sqid} --only=process-dump --dump {dump_file} --date {dump_date}"),
        "--image",
        DUMP_IMAGE,
    ]);

    if let Some(cpu) = DUMP_CPU {
        command.args(["--cpu", &format!("{cpu}")]);
    }

    if let Some(mem) = DUMP_MEM_GB {
        command.args(["--mem", &format!("{mem}G")]);
    }

    match DUMP_NOTIFICATIONS {
        Notifications::None => (),
        _ => {
            command.args(["--email", &format!("{DUMP_NOTIFICATIONS}")]);
        }
    }

    log::info!("executing: {command:?}");

    let output = command
        .output()
        .context("failed to run the `toolforge` utility")?;

    if output.status.success() {
        log::info!("successfully scheduled dump processing job");
    } else {
        log::error!("failed to schedule dump processing job");
    }

    Ok(())
}
