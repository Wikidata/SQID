#!/usr/bin/python
# -*- coding: utf-8 -*-

# This script retrieves data about the use of classes and properties
# on Wikidata from SPARQL. The results are processed and stored in the
# files properties.json and classes.json. The script must be run in a
# directory that already contains these files (possibly with no content
# other than an empty map {}). Normally, the files are first generated
# by the Java export tool, which provides some statistics that cannot
# be obtained in an acceptable time from SPARQL.

import os
import logging
import sqid

HELPERS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HELPERS_DIR, '..', '..', 'src', 'data')
logger = logging.getLogger(__name__)


if __name__ == '__main__':
    sqid._setup_default_logger()  # pylint:disable=protected-access

    # try to guess the correct directory
    try:
        wd = os.getcwd()
        os.chdir(DATA_DIR)

        sqid.update_property_records()
        sqid.update_class_records()
    finally:
        os.chdir(wd)            # restore previous working directory
