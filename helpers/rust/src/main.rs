use std::{path::PathBuf, str::FromStr};

use clap::{App, Arg};
use env_logger::Env;
use log;
use strum::{EnumIter, EnumProperty, EnumString, IntoEnumIterator, IntoStaticStr};

#[derive(Debug, PartialEq, Eq, EnumIter, EnumString, IntoStaticStr)]
#[strum(serialize_all = "kebab-case")]
enum Action {
    Properties,
    Classes,
    Derived,
    CheckDump,
    ProcessDump,
}

#[derive(Debug, PartialEq, Eq, EnumIter, EnumString, EnumProperty, IntoStaticStr)]
#[strum(serialize_all = "UPPERCASE")]
enum LogLevel {
    #[strum(props(level = "off"))]
    Critical,
    #[strum(props(level = "error"))]
    Error,
    #[strum(props(level = "warn"))]
    Warning,
    #[strum(props(level = "info"))]
    Info,
    #[strum(props(level = "debug"))]
    Debug,
    #[strum(props(level = "trace"))]
    Trace,
}

fn main() {
    let default_path = PathBuf::new().join("..").join("data");
    let actions = Action::iter()
        .map(|action| action.into())
        .collect::<Vec<&'static str>>();
    let log_levels = LogLevel::iter()
        .map(|level| level.into())
        .collect::<Vec<&'static str>>();
    let matches = App::new("sqid-helper")
        .version("0.1.0")
        .author("Maximilian Marx <maximilian.marx@tu-dresden.de>")
        .about("Update statistics data for SQID, a Wikidata browser")
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
    log::debug!("Log level is {:?}", loglevel);

    let only = matches
        .value_of("only")
        .and_then(|action| Action::from_str(action).ok());
    log::debug!("Only is {:?}", only);

    if matches.is_present("no-derived") && only == Some(Action::Derived) {
        log::error!("--no-derived and --only=derived are mutually exclusive");
        std::process::exit(1);
    }
}