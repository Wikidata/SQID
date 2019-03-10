<?php

const HOMEDIR = '/data/project/sqid';
const SECRET_DIR = HOMEDIR . '/.oauth-secrets';
const SECRET_TOKEN = SECRET_DIR . '/token';
const SECRET_KEY = SECRET_DIR . '/key';
const SECRET_CERTIFICATE = SECRET_DIR . '/certificate';

const API = 'https://www.wikidata.org/w/api.php';
const ENDPOINT = 'https://www.wikidata.org/w/index.php?title=Special:OAuth';
const CALLBACK = 'https://tools.wmflabs.org/sqid/';

?>
