import logging

from .classes import update_class_records
from .classes import update_derived_class_records
from .properties import update_property_records
from .properties import update_derived_property_records


SQID_LOG_FORMAT = '[%(asctime)-15s] %(levelname)-8s %(name)s: %(message)s'
SQID_LOG_TIME_FORMAT = '%Y-%m-%d %H:%M:%S'


def _setup_default_logger(loglevel=logging.INFO):
    """Sets up default logging format for SQID."""
    logging.basicConfig(format=SQID_LOG_FORMAT,
                        datefmt=SQID_LOG_TIME_FORMAT,
                        level=loglevel)


def update_derived_records():
    """Update derived records for classes and properties."""
    update_derived_property_records()
    update_derived_class_records()
