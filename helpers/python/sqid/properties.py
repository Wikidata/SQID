import logging
from collections import defaultdict

from . import sparql, queries, statistics

PROPERTY_USAGE_TYPES = {sparql.WIKIDATA_PROPERTY_URI_PREFIX: 's',
                        sparql.WIKIDATA_QUALIFIER_URI_PREFIX: 'q',
                        sparql.WIKIDATA_REFERENCE_URI_PREFIX: 'e',
                        }
PROPERTY_USAGE_PREFIXES = sorted(PROPERTY_USAGE_TYPES.keys(),
                                 key=len,
                                 reverse=True)
CLASSIFICATION = {'ids': 'i',
		  'family': 'f',
		  'media': 'm',
		  'wiki': 'w',
		  'other': 'o',
		  'hierarchy': 'h',
		  }

CLASSES_IDS = {'19847637',  # "Wikidata property representing a unique identifier"
               '18614948',  # "Wikidata property for authority control"
               '19595382',  # "Wikidata property for authority control for people"
               '19829908',  # "Wikidata property for authority control for places"
               '19833377',  # "Wikidata property for authority control for works"
               '18618628',  # "Wikidata property for authority control for cultural heritage identification"
               '21745557',  # "Wikidata property for authority control for organisations"
               '19833835',  # "Wikidata property for authority control for substances"
               '22964274',  # "Wikidata property for identication in the film industry"
               }
CLASSES_HUMAN_RELATIONS = {'22964231',  # "Wikidata property for human relationships"
                           }
CLASSES_MEDIA = {'18610173',    # "Wikidata property for Commons"
                 }
CLASSES_WIKI = {'18667213',  # "Wikidata property about Wikimedia categories"
                '22969221',  # "Wikidata property giving Wikimedia list"
                }
PROPERTIES_WIKI = {'1151',      # "topic's main Wikimedia portal"
                   '910',       # "topic's main category"
                   '1204',      # "Wikimedia portal's main topic"
                   }
PROPERTIES_HIERARCHY = {'31',   # "instance of"
                        '279',  # "subclass of"
                        }

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


def update_derived_property_records():
    """Update all derived property records."""
    derive_property_classification()
    derive_related_properties()
    derive_url_patterns()
    derive_property_usage()
    derive_property_datatypes()


def derive_property_classification():
    """Derive the property classification from property statistics."""
    logger.info('Deriving property classification ...')
    data = statistics.get_json_data('properties')

    classification = {}

    for pid in data:
        datatype = None
        if 'd' in data[pid]:
          datatype = data[pid]['d']
        classes = set([])
        if 'pc' in data[pid]:
            classes = set(data[pid]['pc'])
        kind = CLASSIFICATION['other']

        is_id = (datatype == 'ExternalId') or bool(classes & CLASSES_IDS)
        is_human_relation = bool(classes & CLASSES_HUMAN_RELATIONS)
        is_media = (datatype == 'CommonsMedia') or bool(classes & CLASSES_MEDIA)
        is_wiki = (pid in PROPERTIES_WIKI) or bool(classes & CLASSES_WIKI)

        if pid in PROPERTIES_HIERARCHY:
            kind = CLASSIFICATION['hierarchy']
        elif is_id:
            kind = CLASSIFICATION['ids']
        elif is_human_relation:
            kind = CLASSIFICATION['family']
        elif is_media:
            kind = CLASSIFICATION['media']
        elif is_wiki:
            kind = CLASSIFICATION['wiki']

        classification[pid] = kind

    statistics.update_json_data('properties/classification', classification)


def derive_related_properties():
    """Derive the list of related properties from property statistics."""
    logger.info('Deriving related properties ...')
    data = statistics.get_json_data('properties')

    related = {}

    for pid in data:
        if 'r' in data[pid] and data[pid]['r']:
            related[pid] = data[pid]['r']

    statistics.update_json_data('properties/related', related)
    statistics.update_split_json_data('properties/related', related, 10)


def derive_url_patterns():
    """Derive the list of URL patterns from property statistics."""
    logger.info('Deriving URL patterns ...')
    data = statistics.get_json_data('properties')

    patterns = {}

    for pid in data:
        if 'u' in data[pid] and data[pid]['u']:
            patterns[pid] = data[pid]['u']

    statistics.update_json_data('properties/urlpatterns', patterns)


def derive_property_usage():
    """Derive property usage statistics from property statistics."""
    logger.info('Deriving property usage ...')
    data = statistics.get_json_data('properties')

    usage = defaultdict(dict)
    keys = ['i', 's', 'q', 'e', 'qs', 'pc']

    for pid in data:
        for key in keys:
            if key in data[pid] and data[pid][key]:
                usage[pid][key] = data[pid][key]

    statistics.update_json_data('properties/usage', usage)


def derive_property_datatypes():
    """Derive property datatype information from property statistics."""
    logger.info('Deriving property datatypes ...')
    data = statistics.get_json_data('properties')

    types = {}

    for pid in data:
        if 'd' in data[pid] and data[pid]['d']:
            types[pid] = data[pid]['d']

    statistics.update_json_data('properties/datatypes', types)
