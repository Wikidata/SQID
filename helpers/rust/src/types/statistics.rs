use anyhow::{bail, Context, Result};
use std::collections::{HashMap, HashSet, VecDeque};

use crate::types::{ids::properties, DataFile};

use super::{
    ids::{EntityKind, Item, Property},
    json::{
        dump::{CommonData, Rank, Record, Sitelink},
        ClassRecord, PropertyRecord,
    },
    Entity, EntityStatistics, Settings, SiteRecord, Statistics, Type,
};

#[derive(Debug, Default)]
pub struct DumpStatistics {
    classes: HashMap<Item, ClassRecord>,
    properties: HashMap<Property, PropertyRecord>,
    sitelinks: HashMap<String, SiteRecord>,
    statistics: Statistics,
    total_sitelinks: usize,
    total_entities: usize,
    entities_with_properties: usize,
    cooccurences: HashMap<Entity, usize>,
}

impl DumpStatistics {
    const REPORT_INTERVAL: usize = 100000;

    pub fn new() -> Self {
        Default::default()
    }

    pub fn with_classes_and_sites(
        classes: HashMap<Item, ClassRecord>,
        sites: &mut impl Iterator<Item = (String, SiteRecord)>,
    ) -> Self {
        let mut result = Self::new();
        result.classes = classes;
        log::info!("Got {} class records", result.classes.len());
        let added = result.close_subclasses();
        log::info!("Added {} indirect subclass relationships", added);

        result.sitelinks = sites.collect();
        log::info!("Got {} sitelink records", result.sitelinks.len());

        result
    }

    fn close_subclasses(&mut self) -> usize {
        let added = 0;
        let mut class_queue = self.classes.keys().cloned().collect::<VecDeque<_>>();

        while let Some(class) = class_queue.pop_front() {
            let class_record = self.classes.entry(class).or_default();
            //class_record

            class_queue.extend(class_record.superclasses.iter());
            todo!("close for subclass inclusion")
        }

        added
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
        self.classes.entry(item).or_default().label = common.label();

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
        let record = &mut self.properties.entry(property).or_default();
        record.label = common.label();
        record.datatype = Some(datatype);

        // find best URL pattern
        let mut pattern = None;
        if let Some(claims) = common.claims.get(&properties::FORMATTER_URL) {
            for claim in claims {
                if let Some(value) = claim.mainsnak().as_data_value() {
                    if pattern.is_none() || claim.rank() == Rank::Preferred {
                        pattern = Some(value);
                    }
                }
            }
        }

        // collect classes this property belongs to
        if let Some(claims) = common.claims.get(&properties::INSTANCE_OF) {
            claims.iter().for_each(|claim| {
                if let Some(class) = claim
                    .mainsnak()
                    .as_data_value()
                    .and_then(|value| value.as_entity_id())
                {
                    record
                        .instance_of
                        .push(class.id.as_item().expect("class Id should be an Item"))
                }
            });
        }

        self.process_terms(common, EntityKind::Property)
            .context("Failed to process the terms")?;
        self.process_claims(common, EntityKind::Property)
            .context("Failed to process the claims")
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
        let stats = match target {
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
        self.total_entities += 1;
        self.stats_for_entity_kind(target)?.count += 1;

        if !common.claims.is_empty() {
            self.entities_with_properties += 1;
        }

        let mut superclasses = HashSet::new();
        if let Some(statements) = common.claims.get(&properties::INSTANCE_OF) {
            statements.iter().for_each(|statement| {
                if let Some(class_id) = statement
                    .mainsnak()
                    .as_data_value()
                    .and_then(|value| value.as_entity_id())
                    .and_then(|id| id.id.as_item())
                {
                    superclasses.insert(class_id);
                    let superclass = self.classes.entry(class_id).or_default();
                    superclass.direct_instances += 1;
                    superclasses.extend(superclass.superclasses.iter());
                }
            });

            for class_id in superclasses {
                self.classes.entry(class_id).or_default().all_instances += 1;
                self.count_cooccurring_properties(common, &Entity::from(class_id), None);
            }
        };

        for (property, statements) in common.claims.iter() {
            self.stats_for_entity_kind(target)?.statements += statements.len();
            self.count_cooccurring_properties(common, &Entity::from(*property), Some(property));
            let prop = self.properties.entry(*property).or_default();
            prop.in_items += 1;

            statements.iter().for_each(|statement| {
                statement.qualifiers().for_each(|(&qualifier, _)| {
                    *prop.with_qualifiers.entry(qualifier.into()).or_default() += 1;
                });
            });
        }

        if self.total_entities % Self::REPORT_INTERVAL == 0 {
            log::info!("Processed {} entities", self.total_entities);
        }

        Ok(())
    }

    fn stats_for_entity_kind(&mut self, entity_kind: EntityKind) -> Result<&mut EntityStatistics> {
        match entity_kind {
            EntityKind::Item => Ok(&mut self.statistics.items),
            EntityKind::Property => Ok(&mut self.statistics.properties),
            _ => bail!("Unsupported entity kind {:?}", entity_kind),
        }
    }

    fn count_cooccurring_properties(
        &mut self,
        common: &CommonData,
        entity: &Entity,
        this_property: Option<&Property>,
    ) {
        for property in common.claims.keys() {
            if Some(property) == this_property {
                return;
            }

            *self.cooccurences.entry(*entity).or_default() += 1;
        }
    }

    fn compute_related_properties_for_classes(&mut self) {
        todo!("compute related properties for classes");
    }

    fn compute_related_properties_for_properties(&mut self) {
        todo!("compute related properties for properties");
    }

    pub(crate) fn finalise(mut self, settings: &Settings) -> Result<()> {
        self.compute_related_properties_for_classes();
        self.compute_related_properties_for_properties();

        settings.replace_data(DataFile::Properties, &self.properties)?;
        settings.update_timestamp(DataFile::Properties)?;

        settings.replace_data(DataFile::Classes, &self.classes)?;
        settings.update_timestamp(DataFile::Classes)?;

        let dump_info = settings.dump_info.clone().expect("dump info should be set");
        self.statistics.dump_date = Some(dump_info.date);
        settings.replace_data(DataFile::Statistics, &self.statistics)
    }
}