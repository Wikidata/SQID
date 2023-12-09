//! SQID helper, a tool that augments and updates the statistics files used by [SQID](https://sqid.toolforge.org/).

#![deny(
    missing_debug_implementations,
    missing_copy_implementations,
    trivial_casts,
    trivial_numeric_casts,
    unsafe_code
)]
#![warn(
    missing_docs,
    unused_import_braces,
    unused_qualifications,
    unused_extern_crates,
    variant_size_differences
)]

use std::path::PathBuf;

use anyhow::Result;
use clap::{Args, Parser};
use env_logger::Env;
use rules::update_rules;
use statistics::process_dump;
use strum::{EnumIter, EnumProperty, EnumString, IntoEnumIterator};

use crate::{
    classes::{update_class_records, update_derived_class_records},
    properties::{update_derived_property_records, update_property_records},
    statistics::{check_for_new_dump, update_sitelinks},
    types::{DumpInfo, Settings},
};

mod classes;
mod jobs;
mod properties;
mod rules;
mod sparql;
mod statistics;
mod types;

/// Possible actions the tool can perform.
#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumIter, EnumString)]
#[strum(serialize_all = "kebab-case")]
enum Action {
    Properties,
    Classes,
    Derived,
    Rules,
    Sitelinks,
    CheckDump,
    ProcessDump,
}

impl Action {
    fn perform(&self, settings: &Settings) -> Result<()> {
        match self {
            Self::Properties => update_property_records(settings),
            Self::Classes => update_class_records(settings),
            Self::Derived => {
                update_derived_property_records(settings)?;
                update_derived_class_records(settings)?;
                log::info!("Finished updating derived information.");
                Ok(())
            }
            Self::Sitelinks => update_sitelinks(settings),
            Self::Rules => update_rules(settings),
            Self::CheckDump => check_for_new_dump(settings),
            Self::ProcessDump => process_dump(settings),
        }
    }
}

/// Log levels implemented by the tool.
#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumString, EnumProperty)]
#[strum(serialize_all = "UPPERCASE")]
enum LogLevel {
    /// Show only critical output
    #[strum(props(level = "off"))]
    Critical,
    /// Show only errors
    #[strum(props(level = "error"))]
    Error,
    /// Show warnings and errors
    #[strum(props(level = "warn"))]
    Warning,
    /// Show informative output
    #[strum(props(level = "info"))]
    Info,
    /// Show extra output useful for debugging
    #[strum(props(level = "debug"))]
    Debug,
    /// Show everything
    #[strum(props(level = "trace"))]
    Trace,
}

fn get_default_data_path() -> PathBuf {
    PathBuf::new().join("..").join("..").join("data")
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(flatten)]
    verbosity: Verbosity,

    /// Only update statistics for KIND
    #[arg(short, long, value_name = "KIND")]
    only: Option<Action>,

    /// Path to data files
    #[arg(long = "data-path", value_name = "DIR", default_value = get_default_data_path().into_os_string())]
    path: PathBuf,

    /// Do not compute derived records
    #[arg(long = "no-derived")]
    no_derived: bool,

    /// Date of the dump to be processed
    #[arg(long, required_if_eq("only", "process-dump"))]
    date: Option<String>,

    /// Path to the dump to be processed
    #[arg(last = true, required_if_eq("only", "process-dump"))]
    dump: Option<PathBuf>,
}

#[derive(Args)]
#[group(required = false, multiple = false)]
struct Verbosity {
    /// Increase verbosity
    #[arg(short, long)]
    verbose: bool,

    /// Suppress (some) output
    #[arg(short, long)]
    quiet: bool,

    /// Set the log level
    #[arg(short, long = "loglevel", default_value = "INFO")]
    log_level: LogLevel,
}

impl Verbosity {
    fn get(&self) -> LogLevel {
        if self.quiet {
            LogLevel::Warning
        } else if self.verbose {
            LogLevel::Debug
        } else {
            self.log_level
        }
    }
}

/// The entry point to the whole program.
fn main() {
    let cli = Cli::parse();

    let loglevel = cli.verbosity.get();

    env_logger::Builder::from_env(
        Env::default()
            .default_filter_or(loglevel.get_str("level").expect("level should be defined")),
    )
    .init();

    if cli.no_derived && cli.only == Some(Action::Derived) {
        log::error!("--no-derived and --only=derived are mutually exclusive");
        std::process::exit(1);
    }

    if cli.dump.is_some() && cli.only != Some(Action::ProcessDump) {
        log::error!("a dump file can only be specified together with --only=process-dump");
        std::process::exit(1);
    }

    if cli.date.is_some() && cli.only != Some(Action::ProcessDump) {
        log::error!("a dump date can only be specified together with --only=process-dump");
        std::process::exit(1);
    }

    let mut settings = Settings::new(cli.path);

    if let Some(Action::ProcessDump) = cli.only {
        let date = cli.date.expect("date should be set");
        log::trace!("parsing dump date: {date:?}");
        settings.dump_info = Some(DumpInfo {
            date: types::date_from_str(&date).expect("date should parse"),
            path: Box::new(cli.dump.expect("dump path should be set")),
        });
    }

    let state = match cli.only {
        Some(action) => action.perform(&settings),
        None => Action::iter().try_for_each(|action| match action {
            Action::Derived => {
                if cli.no_derived {
                    Ok(())
                } else {
                    action.perform(&settings)
                }
            }
            Action::ProcessDump => Ok(()),
            _ => action.perform(&settings),
        }),
    };

    if let Err(error) = state {
        log::error!("An error occurred. Exiting.");
        for cause in error.chain() {
            log::error!("{}", cause);
        }
        std::process::exit(1);
    }
}
