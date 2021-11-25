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

use std::{path::PathBuf, str::FromStr};

use anyhow::Result;
use clap::{App, Arg};
use env_logger::Env;
use statistics::process_dump;
use strum::{EnumIter, EnumProperty, EnumString, IntoEnumIterator, IntoStaticStr};
use types::Settings;

use crate::{
    classes::{update_class_records, update_derived_class_records},
    properties::{update_derived_property_records, update_property_records},
    statistics::check_for_new_dump,
    types::DumpInfo,
};

mod classes;
mod properties;
mod sparql;
mod statistics;
mod types;

/// Possible actions the tool can perform.
#[derive(Debug, PartialEq, Eq, EnumIter, EnumString, IntoStaticStr)]
#[strum(serialize_all = "kebab-case")]
enum Action {
    Properties,
    Classes,
    Derived,
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
            Self::CheckDump => check_for_new_dump(settings),
            Self::ProcessDump => process_dump(settings),
        }
    }
}
/// Log levels implemented by the tool.
#[derive(Debug, PartialEq, Eq, EnumIter, EnumString, EnumProperty, IntoStaticStr)]
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

const NAME: Option<&'static str> = option_env!("CARGO_PKG_NAME");
const DESCRIPTION: Option<&'static str> = option_env!("CARGO_PKG_DESCRIPTION");
const VERSION: Option<&'static str> = option_env!("CARGO_PKG_VERSION");
const AUTHORS: Option<&'static str> = option_env!("CARGO_PKG_AUTHORS");

/// The entry point to the whole program.
fn main() {
    let default_path = PathBuf::new().join("..").join("..").join("data");
    let actions = Action::iter()
        .map(|action| action.into())
        .collect::<Vec<&'static str>>();
    let log_levels = LogLevel::iter()
        .map(|level| level.into())
        .collect::<Vec<&'static str>>();
    let matches = App::new(NAME.unwrap_or("sqid-helper"))
        .version(VERSION.unwrap_or("(unknown)"))
        .author(AUTHORS.unwrap_or("Maximilian Marx <maximilian.marx@tu-dresden.de>"))
        .about(DESCRIPTION.unwrap_or("Update statistics data for SQID, a Wikidata browser"))
        .arg(
            Arg::with_name("version")
                .short("V")
                .long("version")
                .help("Shows the version of sqid-helper"),
        )
        .arg(
            Arg::with_name("only")
                .short("o")
                .long("only")
                .value_name("KIND")
                .possible_values(&actions)
                .help("only update statistics for KIND"),
        )
        .arg(
            Arg::with_name("path")
                .long("data-path")
                .value_name("DIR")
                .help("path to data files")
                .default_value(default_path.to_str().expect("fixed path should not fail")),
        )
        .arg(
            Arg::with_name("no-derived")
                .long("no-derived")
                .help("do not compute derived records"),
        )
        .arg(
            Arg::with_name("verbose")
                .short("v")
                .long("verbose")
                .help("increase verbosity")
                .conflicts_with_all(&["loglevel", "quiet"]),
        )
        .arg(
            Arg::with_name("quiet")
                .short("q")
                .long("quiet")
                .help("suppress (some) output")
                .conflicts_with_all(&["loglevel", "verbose"]),
        )
        .arg(
            Arg::with_name("loglevel")
                .short("l")
                .long("loglevel")
                .help("sets the log level")
                .possible_values(&log_levels)
                .default_value("INFO"),
        )
        .arg(
            Arg::with_name("date")
                .long("date")
                .takes_value(true)
                .hidden(true)
                .required_if("only", "process-dump"),
        )
        .arg(
            Arg::with_name("dump")
                .hidden(true)
                .last(true)
                .required_if("only", "process-dump"),
        )
        .get_matches();

    let loglevel = if matches.is_present("quiet") {
        LogLevel::Warning
    } else if matches.is_present("verbose") {
        LogLevel::Debug
    } else {
        LogLevel::from_str(
            matches
                .value_of("loglevel")
                .expect("default value should be present"),
        )
        .expect("should be one of the allowed values")
    };

    env_logger::Builder::from_env(
        Env::default()
            .default_filter_or(loglevel.get_str("level").expect("level should be defined")),
    )
    .init();
    log::debug!("Log level is {:?} ({:?})", loglevel, log::max_level());

    let only = matches
        .value_of("only")
        .and_then(|action| Action::from_str(action).ok());
    log::debug!("Only is {:?}", only);
    log::debug!("Default path: {:?}", default_path);

    if matches.is_present("no-derived") && only == Some(Action::Derived) {
        log::error!("--no-derived and --only=derived are mutually exclusive");
        std::process::exit(1);
    }

    if matches.is_present("dump") && only != Some(Action::ProcessDump) {
        log::error!("a dump file can only be specified together with --only=process-dump");
        std::process::exit(1);
    }

    if matches.is_present("date") && only != Some(Action::ProcessDump) {
        log::error!("a dump date can only be specified together with --only=process-dump");
        std::process::exit(1);
    }

    let mut settings = Settings::new(matches.value_of("path").expect("path should be set"));

    if let Some(Action::ProcessDump) = only {
        let date = matches.value_of("date").expect("date should be set");
        settings.dump_info = Some(DumpInfo {
            date: types::utc_from_str(date).expect("date should parse"),
            path: Box::new(
                matches
                    .value_of("dump")
                    .expect("dump path should be set")
                    .into(),
            ),
        });
    }

    let state = match only {
        Some(action) => action.perform(&settings),
        None => Action::iter().try_for_each(|action| match action {
            Action::Derived => {
                if matches.is_present("no-derived") {
                    Ok(())
                } else {
                    action.perform(&settings)
                }
            }
            Action::ProcessDump => Ok(()),
            _ => action.perform(&settings),
        }),
    };

    if state.is_err() {
        log::error!("An error occurred. Exiting.");
        log::error!("{}", state.unwrap_err());
        std::process::exit(1);
    }
}
