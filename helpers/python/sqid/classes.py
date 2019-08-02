import logging
from . import sparql, queries, statistics


logger = logging.getLogger(__name__)


def update_class_records():
    """Updates statistics for classes."""
    logger.info('Fetching class ids and labels for '
                'classes with direct instances')
    timestamp = statistics.get_current_timestamp()
    results = sparql.sparql_query(queries.QUERY_CLASSES,
                                  fallback=queries.QUERY_CLASSSES_FALLBACK)

    if 'error' in results:
        logger.error('Got no SPARQL results.')
        return

    updated = {}

    def value(binding, key):
        return binding[key]['value']

    for binding in results['results']['bindings']:
        uri = value(binding, 'cl')
        if not sparql.is_wikidata_entity(uri):
            continue

        qid = sparql.wikidata_entity_id(uri)
        label = value(binding, 'clLabel')
        record = {'l': label, }

        if 'c' in binding:
            record['i'] = int(value(binding, 'c'))
        updated[qid] = record

    logger.info('Augmenting current classes data ...')
    data = statistics.get_json_data('classes')
    merged = statistics.merge(data, updated, default_others={'i': 0})
    statistics.update_json_data('classes', merged, timestamp)
