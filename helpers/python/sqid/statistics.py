import os
import json
import time
import shutil
import logging

from copy import deepcopy
from tempfile import NamedTemporaryFile
from collections import defaultdict

SEPARATORS = (',', ':')
TIMESTAMP_KEYS = {'classes': 'classUpdate',
                  'properties': 'propertyUpdate',
                  }
ISO8601_TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S"
logger = logging.getLogger(__name__)


def get_current_timestamp():
    """Returns the current timestamp in suitable (ISO 8601) format."""
    return time.strftime(ISO8601_TIMESTAMP_FORMAT)


def _json_file_name(name):
    """Returns the name of the statistics file for `name`."""
    return name + '.json'


def get_json_data(name):
    """Load statistics file "`name`.json"."""
    try:
        with open(_json_file_name(name), 'r') as file:
            return json.load(file)
    except OSError:
        return {}


def update_json_data(name, data, timestamp=None):
    """Atomically replaces the data in file "`name'.json"."""
    try:
        with NamedTemporaryFile(mode='w', delete=False) as file:
            logger.info('Writing new JSON %s data ...', name)
            json.dump(data, file, separators=SEPARATORS)
            logger.info('Writing new %s JSON file ...', name)
    except RuntimeError as err:
        logger.error('Writing dump failed: %s', err)
    else:
        os.chmod(file.name, 0o644)
        shutil.move(file.name, _json_file_name(name))
        if timestamp is not None:
            update_timestamp(name, timestamp)
        logger.info('Update for %s complete.', name)


def update_timestamp(name, timestamp):
    """Updates the statistics `timestamp` for `name`."""
    data = get_json_data('statistics')
    data[TIMESTAMP_KEYS[name]] = timestamp

    with open(_json_file_name('statistics'), 'w') as file:
        json.dump(data, file)


def merge(old, new, default_others=None):
    """Merges two statistics documents `old` and `new`.

    `default_others` is a dict that will be applied to all items
    not updated.
    """
    merged = defaultdict(dict, deepcopy(old))

    for key in new.keys():
        merged[key].update(new[key])

    if default_others is not None:
        others = old.keys() - new.keys()

        for key in others:
            merged[key].update(default_others)

    return dict(merged)
