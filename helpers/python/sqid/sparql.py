import csv
import json
import time
import requests
import logging


SPARQL_SERVICE_URL = 'https://query.wikidata.org/sparql'
SPARQL_USER_AGENT = 'SQID/1.0 (https://github.com/Wikidata/SQID)'
SPARQL_TOOL_BANNER = '#TOOL:SQID Python Helper\n'
WIKIBASE_TYPE_URI_PREFIX = 'http://wikiba.se/ontology#'
WIKIDATA_ENTITY_URI_PREFIX = 'http://www.wikidata.org/entity/'
WIKIDATA_PROPERTY_URI_PREFIX = 'http://www.wikidata.org/prop/'
WIKIDATA_QUALIFIER_URI_PREFIX = 'http://www.wikidata.org/prop/qualifier/'
WIKIDATA_REFERENCE_URI_PREFIX = 'http://www.wikidata.org/prop/reference/'
TIMEOUT_ERROR = json.loads('{ "error": "timeout", '
                           '"results": { "bindings": {} } }')


logger = logging.getLogger(__name__)


def _sparql_query(query):
    """Performs a SPARQL query."""
    params = {'query': SPARQL_TOOL_BANNER + query, }
    headers = {'user-agent': SPARQL_USER_AGENT,
               'accept': 'text/csv'}

    req = requests.get(SPARQL_SERVICE_URL,
                       params=params,
                       headers=headers)
    reader = csv.DictReader(req.text.splitlines())
    bindings = []

    for row in reader:
      binding = {}
      for key, value in row.items():
        binding[key] = { 'value': value }
      bindings.append(binding)

    result = { 'results': { 'bindings': bindings, }}
    return result

def _retry_sparql_query(query, delay, retries):
    """Retries a SPARQL query at most `retries` times,
    waiting `delay` between each try"""
    tries = retries + 1
    while tries:
        try:
            return _sparql_query(query)
        except ValueError as err:
            tries -= 1
            if tries:
                logger.debug(err)
                logger.warning("SPARQL query failed, possibly due to a time out. "
                                "Waiting for {} seconds ...".format(delay))
                time.sleep(delay)
                logger.info("Retrying query ...")
            else:
                raise err


def sparql_query(query, delay=60, retries=1, fallback=None):
    """Performs a SPARQL Query, retrying on failure, and optionally
    falling back to a simplified query."""
    try:
        return _retry_sparql_query(query, delay, retries)
    except ValueError:
        if fallback is not None:
            logger.warning("Falling back to fallback query.")
            try:
                return _retry_sparql_query(fallback, delay, retries)
            except ValueError:
                pass

        logger.error("Failed to get SPARQL results. Giving up.")
        return TIMEOUT_ERROR


def is_wikidata_entity(uri):
    """Checks whether the URI points to a Wikidata entity."""
    return uri.startswith(WIKIDATA_ENTITY_URI_PREFIX)


def wikidata_entity_id(uri):
    """Returns the entity ID part from a URI."""
    return uri[len(WIKIDATA_ENTITY_URI_PREFIX) + 1:]


def wikibase_type_name(uri):
    """Returns the Wikibase type name part from a URI, or UNKNOWN."""
    if uri.startswith(WIKIBASE_TYPE_URI_PREFIX):
        return uri[len(WIKIBASE_TYPE_URI_PREFIX):]
    return 'UNKNOWN'
