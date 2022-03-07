use anyhow::{bail, Context, Result};
use std::collections::HashMap;

use super::{
    ids::{EntityKind, Item, Property},
    json::{
        dump::{CommonData, Record, Sitelink},
        ClassRecord, PropertyRecord,
    },
    SiteRecord, Statistics, Type,
};

#[derive(Debug, Default)]
pub struct DumpStatistics {
    classes: HashMap<Item, ClassRecord>,
    properties: HashMap<Property, PropertyRecord>,
    sitelinks: HashMap<String, SiteRecord>,
    statistics: Statistics,
    total_sitelinks: usize,
}

impl DumpStatistics {
    pub fn new() -> Self {
        Default::default()
    }

    pub fn with_sites(sites: &mut impl Iterator<Item = (String, SiteRecord)>) -> Self {
        let mut result = Self::new();
        result.sitelinks = sites.collect();

        result
    }

    pub(crate) fn process_line(&mut self, line: &str) -> Result<()> {
        let raw_record = line
            .strip_suffix('\n')
            .unwrap_or(line)
            .strip_suffix(',')
            .unwrap_or(line);

        let record: Record =
            serde_json::from_str(raw_record).context("Failed parsing the record")?;

        match record {
            Record::Item {
                id,
                sitelinks,
                common,
            } => self.process_item(id, &sitelinks, &common),
            Record::Property {
                id,
                datatype,
                common,
            } => self.process_property(id, datatype, &common),
        }
        .context("Failed to process the record")?;

        Ok(())
    }

    fn process_item(
        &mut self,
        item: Item,
        sitelinks: &HashMap<String, Sitelink>,
        common: &CommonData,
    ) -> Result<()> {
        self.classes
            .entry(item)
            .and_modify(|class| class.label = common.label());

        self.total_sitelinks += sitelinks.len();
        sitelinks
            .iter()
            .try_for_each(|(site, sitelink)| self.process_sitelink(site, sitelink))
            .context("Failed to process the sitelinks")?;
        self.process_terms(common, EntityKind::Item)
            .context("Failed to process the terms")?;
        self.process_claims(common, EntityKind::Item)
            .context("Failed to process the claims")
    }

    fn process_property(
        &mut self,
        property: Property,
        datatype: Type,
        common: &CommonData,
    ) -> Result<()> {
        todo!()
    }

    fn process_sitelink(&mut self, site: &str, _sitelink: &Sitelink) -> Result<()> {
        match self.sitelinks.get_mut(site) {
            Some(link) => {
                link.items += 1;
                Ok(())
            }
            None => bail!("Sitelink for site {} not found", site),
        }
    }

    fn process_terms(&mut self, common: &CommonData, target: EntityKind) -> Result<()> {
        let mut stats = match target {
            EntityKind::Item => &mut self.statistics.items,
            EntityKind::Property => &mut self.statistics.properties,
            _ => bail!("Unsupported entity kind {:?}", target),
        };
        stats.labels += common.labels.len();
        stats.descriptions += common.descriptions.len();
        stats.aliases += common
            .aliases
            .values()
            .map(|aliases| aliases.len())
            .sum::<usize>();

        Ok(())
    }

    fn process_claims(&mut self, common: &CommonData, target: EntityKind) -> Result<()> {
        match target {
            EntityKind::Item => todo!(),
            EntityKind::Property => todo!(),
            _ => bail!("Unsupported entity kind {:?}", target),
        }
    }
}
