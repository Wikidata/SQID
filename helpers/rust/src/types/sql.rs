use anyhow::{anyhow, Context, Result};
use dirs::home_dir;
use mysql::{prelude::Queryable, Opts, Pool};

use super::{php::SitePaths, SiteRecord};

pub const REPLICA_MY_CNF: &str = "replica.my.cnf";
pub const HOST: &str = "wikidatawiki.analytics.db.svc.wikimedia.cloud";
pub const DATABASE: &str = "wikidatawiki_p";

#[derive(Debug)]
pub struct Credentials {
    user: String,
    password: String,
}

impl Credentials {
    pub fn from_replica_my_cnf() -> Result<Self> {
        let mut path = home_dir().context("failed to get the path to the home directory")?;
        path.push(REPLICA_MY_CNF);
        let path = path
            .to_str()
            .context("failed to convert the path to a string")?;
        let cnf = ini::ini!(safe path)
            .map_err(|e| anyhow!(e))
            .context("failed to read the replica config")?;
        let client = &cnf["client"];
        let user = client["user"]
            .as_ref()
            .context(r#"no "user" in "client" section"#)?
            .to_owned();
        let password = client["password"]
            .as_ref()
            .context(r#"no "password" in "client" section"#)?
            .to_owned();
        Ok(Self { user, password })
    }
}

impl ToString for Credentials {
    fn to_string(&self) -> String {
        format!(
            "mysql://{}:{}@{}/{}",
            self.user, self.password, HOST, DATABASE
        )
    }
}

pub fn query_sites(
    credentials: &Credentials,
) -> Result<impl Iterator<Item = (String, SiteRecord)>> {
    let opts =
        Opts::from_url(&credentials.to_string()).context("failed to parse connection URL")?;
    let pool = Pool::new(opts).context("failed to create connection pool")?;
    let mut conn = pool
        .get_conn()
        .context("failed to connect to the replica")?;

    let result: Vec<Result<(String, SiteRecord)>> = conn
        .query_map(
            "SELECT site_global_key, site_group, site_language, site_data FROM sites",
            |(site, group, language, data): (String, String, String, String)| {
                let paths = data.parse::<SitePaths>().with_context(|| {
                    format!(r#"failed to parse site information for "{}""#, site)
                })?;
                let record = SiteRecord::new(group, language, paths.page_url().to_owned());
                Ok((site, record))
            },
        )
        .context(r#"failed to query the "sites" table"#)?;

    Ok(result.into_iter().flatten())
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn connection_string() {
        let creds = Credentials {
            user: "test".to_owned(),
            password: "pass".to_owned(),
        };

        assert_eq!(
            creds.to_string(),
            format!("MySQL://test:pass@{}/{}", HOST, DATABASE)
        );
    }
}
