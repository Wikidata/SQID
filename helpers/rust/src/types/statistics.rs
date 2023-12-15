use anyhow::{bail, Context, Result};
use std::collections::{HashMap, HashSet, VecDeque};

use crate::{
    classes::derive_class_hierarchy,
    properties::derive_related_properties,
    types::{ids::properties, DataFile, Properties},
};

use super::{
    ids::{EntityKind, Item, Property},
    json::{
        dump::{CommonData, Rank, Record, Sitelink},
        ClassRecord, PropertyRecord,
    },
    Classes, Count, EntityStatistics, Settings, SiteRecord, Statistics, Type,
};

#[derive(Debug, Default)]
pub struct DumpStatistics {
    classes: HashMap<Item, ClassRecord>,
    properties: HashMap<Property, PropertyRecord>,
    statistics: Statistics,
    total_sitelinks: usize,
    total_entities: usize,
    entities_with_properties: usize,
}

impl DumpStatistics {
    const REPORT_INTERVAL: usize = 100_000;

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

        result.statistics.sites = sites.collect();
        result.statistics.sites.shrink_to_fit();
        result
            .statistics
            .sites
            .values_mut()
            .for_each(|sitelink| sitelink.shrink_to_fit());
        log::info!("Got {} sitelink records", result.statistics.sites.len());

        result
    }

    pub fn clear_counters(&mut self) {
        for class in self.classes.values_mut() {
            class.direct_instances = 0;
            class.direct_subclasses = 0;
            class.all_instances = 0;
            class.all_subclasses = 0;
            class.related_properties.clear();
        }

        for property in self.properties.values_mut() {
            property.in_items = 0;
            property.in_statements = 0;
            property.in_qualifiers = 0;
            property.in_references = 0;
            property.with_qualifiers.clear();
            property.related_properties.clear();
        }
    }

    fn close_subclasses(&mut self) -> usize {
        log::info!("Computing subclass closure");

        let mut added = 0;
        let direct_superclasses = self
            .classes
            .iter()
            .map(|(class, record)| (*class, record.direct_superclasses.clone()))
            .collect::<HashMap<_, _>>();
        let mut class_queue = self.classes.keys().cloned().collect::<VecDeque<_>>();

        while let Some(class) = class_queue.pop_front() {
            let record = self.classes.entry(class).or_default();
            let mut done = HashSet::new();
            let mut superclasses = record
                .direct_superclasses
                .iter()
                .cloned()
                .collect::<VecDeque<_>>();

            while let Some(superclass) = superclasses.pop_front() {
                record.superclasses.insert(superclass);
                done.insert(superclass);
                added += 1;

                if let Some(new_superclasses) = direct_superclasses.get(&superclass) {
                    superclasses.extend(
                        new_superclasses
                            .iter()
                            .filter(|superclass| !done.contains(superclass))
                            .cloned(),
                    );
                }
            }
        }

        added
    }

    fn compute_nonempty_subclasses(&mut self) {
        let _ = self.close_subclasses();

        let mut classes = self
            .classes
            .iter()
            .filter_map(|(class, record)| {
                (record.direct_subclasses > 0 || record.direct_instances > 0)
                    .then_some((*class, record.direct_superclasses.clone()))
            })
            .collect::<VecDeque<_>>();

        log::info!("Found {} non-empty classes", classes.len());

        while let Some((class, superclasses)) = classes.pop_front() {
            for super_class in superclasses {
                let record = self.classes.entry(super_class).or_default();
                record.direct_subclasses += 1;
                record.non_empty_subclasses.insert(class);
            }
        }

        let mut classes = self
            .classes
            .values()
            .filter_map(|record| {
                (!record.superclasses.is_empty()).then_some(record.superclasses.clone())
            })
            .collect::<VecDeque<_>>();

        while let Some(superclasses) = classes.pop_front() {
            for super_class in superclasses {
                if let Some(record) = self.classes.get_mut(&super_class) {
                    record.all_subclasses += 1;
                }
            }
        }
    }

    pub(crate) fn process_line(&mut self, line: &str) -> Result<()> {
        let raw_record = line.trim_end_matches(&['\n', ',']);

        if raw_record.is_empty() {
            return Ok(());
        }

        log::trace!("parsing record: {raw_record:?}");

        let record = serde_json::from_str::<Record>(raw_record);

        if let Err(error) = record {
            log::warn!("Failed to parse record: {error}");
            log::debug!("{raw_record:?}");

            return Ok(());
        }

        let mut record = record?;
        record.shrink_to_fit();

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
        if let Some(class) = self.classes.get_mut(&item) {
            // only keep the label if we know this is a class, to keep
            // memory consumption manageable.
            class.label = common.label();
        }

        if let Some(claims) = common.claims.get(&properties::SUBCLASS_OF) {
            for claim in claims {
                if let Some(class_id) = claim
                    .mainsnak()
                    .as_data_value()
                    .and_then(|value| value.as_entity_id())
                    .and_then(|entity| entity.id.as_item())
                {
                    self.classes
                        .entry(item)
                        .or_default()
                        .direct_superclasses
                        .insert(class_id);
                }
            }
        }

        for property in common.claims.keys() {
            self.properties.entry(*property).or_default().in_items += 1;
        }

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
                        .insert(class.id.as_item().expect("class Id should be an Item"));
                }
            });
        }

        self.process_terms(common, EntityKind::Property)
            .context("Failed to process the terms")?;
        self.process_claims(common, EntityKind::Property)
            .context("Failed to process the claims")
    }

    fn process_sitelink(&mut self, site: &str, _sitelink: &Sitelink) -> Result<()> {
        match self.statistics.sites.get_mut(site) {
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
        stats.labels += Count::try_from(common.labels.len()).expect("should fit");
        stats.descriptions += Count::try_from(common.descriptions.len()).expect("should fit");
        stats.aliases += common
            .aliases
            .values()
            .map(|aliases| aliases.len())
            .filter_map(|count| Count::try_from(count).ok())
            .sum::<Count>();

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
                Self::count_cooccurring_properties(
                    common,
                    &mut self.classes.entry(class_id).or_default().cooccurrences,
                    None,
                );
            }
        };

        for (property, statements) in common.claims.iter() {
            self.stats_for_entity_kind(target)?.statements +=
                Count::try_from(statements.len()).expect("should fit");
            Self::count_cooccurring_properties(
                common,
                &mut self.properties.entry(*property).or_default().cooccurrences,
                Some(property),
            );

            statements.iter().for_each(|statement| {
                self.properties.entry(*property).or_default().in_statements += 1;

                statement.references().for_each(|reference| {
                    for reference_property in reference.snaks.keys() {
                        self.properties
                            .entry(*reference_property)
                            .or_default()
                            .in_references += 1;
                    }
                });

                statement.qualifiers().for_each(|(&qualifier, _)| {
                    *self
                        .properties
                        .entry(*property)
                        .or_default()
                        .with_qualifiers
                        .entry(qualifier.into())
                        .or_default() += 1;
                    self.properties.entry(qualifier).or_default().in_qualifiers += 1;
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
        common: &CommonData,
        cooccurrences: &mut HashMap<Property, Count>,
        this_property: Option<&Property>,
    ) {
        for property in common.claims.keys() {
            if Some(property) == this_property {
                return;
            }

            *cooccurrences.entry(*property).or_default() += 1;
        }
    }

    fn related_properties(
        &self,
        count: Count,
        cooccurrences: &HashMap<Property, Count>,
    ) -> Result<HashMap<Property, Count>> {
        Ok(cooccurrences
            .iter()
            .map(|(property, cooccurrences)| {
                let item_count = count as f64;
                let other_this_item_rate = (*cooccurrences as f64) / item_count;
                let other_global_item_rate = self
                    .properties
                    .get(property)
                    .map(|record| record.in_items as f64)
                    .unwrap_or(0.0)
                    / (self.entities_with_properties as f64);
                let other_this_item_rate_step =
                    1.0 / (1.0 + f64::exp(6.0 * (-2.0 * other_this_item_rate + 0.5)));
                let other_inv_global_item_rate_step =
                    1.0 / (1.0 + f64::exp(6.0 * (-2.0 * (1.0 - other_global_item_rate) + 0.5)));

                let score = other_this_item_rate_step
                    * other_inv_global_item_rate_step
                    * other_this_item_rate
                    / other_global_item_rate;

                (*property, ((10.0 * score) as Count))
            })
            .collect())
    }

    fn compute_related_properties(&mut self) -> Result<()> {
        let related_properties = self
            .properties
            .iter()
            .flat_map(|(property, record)| {
                Ok::<_, anyhow::Error>((
                    *property,
                    self.related_properties(record.in_items, &record.cooccurrences)?,
                ))
            })
            .collect::<HashMap<_, _>>();

        for (property, related_properties) in related_properties {
            self.properties
                .entry(property)
                .or_default()
                .related_properties = related_properties;
        }

        let related_properties = self
            .classes
            .iter()
            .flat_map(|(class, record)| {
                Ok::<_, anyhow::Error>((
                    *class,
                    self.related_properties(record.direct_instances, &record.cooccurrences)?,
                ))
            })
            .collect::<HashMap<_, _>>();

        for (class, related_properties) in related_properties {
            self.classes.entry(class).or_default().related_properties = related_properties;
        }

        Ok(())
    }

    pub(crate) fn finalise(mut self, settings: &Settings) -> Result<()> {
        log::info!("Computing related properties");
        self.compute_related_properties()?;
        log::info!("Finding non-empty subclasses");
        self.compute_nonempty_subclasses();

        settings.replace_data(DataFile::Properties, &self.properties)?;
        settings.update_timestamp(DataFile::Properties)?;

        settings.replace_data(DataFile::Classes, &self.classes)?;
        settings.update_timestamp(DataFile::Classes)?;

        log::info!("Deriving updated property data");
        derive_related_properties(settings, &Properties(self.properties))?;

        log::info!("Deriving updated class hierarchy");
        derive_class_hierarchy(settings, &Classes(self.classes))?;

        log::info!("Updating dump date");
        let dump_info = settings.dump_info.clone().expect("dump info should be set");
        self.statistics.dump_date = Some(dump_info.date);
        settings.replace_data(DataFile::Statistics, &self.statistics)
    }
}
