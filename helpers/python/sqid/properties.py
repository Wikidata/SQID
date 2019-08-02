import logging
from . import sparql, queries, statistics

PROPERTY_USAGE_TYPES = {sparql.WIKIDATA_PROPERTY_URI_PREFIX: 's',
                        sparql.WIKIDATA_QUALIFIER_URI_PREFIX: 'q',
                        sparql.WIKIDATA_REFERENCE_URI_PREFIX: 'e',
                        }
PROPERTY_USAGE_PREFIXES = sorted(PROPERTY_USAGE_TYPES.keys(),
                                 key=len,
                                 reverse=True)
logger = logging.getLogger(__name__)


def update_property_records():
    """Updates statistics for properties."""
    logger.info('Fetching property ids, labels and types ...')
    timestamp = statistics.get_current_timestamp()
    results = sparql.sparql_query(queries.QUERY_PROPERTIES)

    updated = {}

    def value(binding, key):
        return binding[key]['value']

    for binding in results['results']['bindings']:
        uri = value(binding, 'id')
        if not sparql.is_wikidata_entity(uri):
            continue

        pid = sparql.wikidata_entity_id(uri)
        typ = sparql.wikibase_type_name(value(binding, 'type'))

        updated[pid] = {'l': value(binding, 'idLabel'),
                        'd': typ,
                        's': 0,
                        'q': 0,
                        'e': 0,
                        }

    logger.info('Fetching property usage statistics')
    results = sparql.sparql_query(queries.QUERY_PROPERTY_USAGE)

    for binding in results['results']['bindings']:
        uri = value(binding, 'p')

        for typ in PROPERTY_USAGE_PREFIXES:
            if uri.startswith(typ):
                pid = uri[len(typ) + 1:]
                if not pid.isdigit():
                    continue
                key = PROPERTY_USAGE_TYPES[typ]
                val = value(binding, 'c')

                try:
                    if pid in updated:
                        updated[pid][key] = int(val)
                        break
                    else:
                        logger.warning('Got Property usage for '
                                       'unknown PID %s', pid)
                except ValueError:
                    logger.erorr("Error reading count value `{}': "
                                 "not an integer.".format(val))

    logger.info('Augmenting current property data ...')
    data = statistics.get_json_data('properties')
    merged = statistics.merge(data, updated)
    statistics.update_json_data('properties', merged, timestamp)
