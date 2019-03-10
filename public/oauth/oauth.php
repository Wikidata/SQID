<?php
require_once __DIR__ . '/vendor/autoload.php';

use MediaWiki\OAuthClient\ClientConfig;
use MediaWiki\OAuthClient\Consumer;
use MediaWiki\OAuthClient\Client;
use MediaWiki\OAuthClient\Token;

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/rsa_client.php';

const ACTIONS = array(
  'initiate' => 'initiate',
  'complete' => 'complete',
  'identify' => 'identify',
);

const KEY_HEADER = 'HTTP_X_SQID_KEY';
const SECRET_HEADER = 'HTTP_X_SQID_SECRET';

header('Content-type: application/json');

if (!array_key_exists('action', $_GET)) {
  error('no action given');
}

$action = strtolower(trim($_GET['action']));

if (!array_key_exists($action, ACTIONS)) {
  // unknown action
  error('no such action');
} else {
  try {
    call_user_func(ACTIONS[$action]);
  } catch (Exception $e) {
    error($e->getMessage());
  }
}

exit(0);

function get_secret($secret) {
  return trim(file_get_contents($secret));
}

function withClient() {
  $config = new ClientConfig(ENDPOINT);
  $config->setConsumer(new Consumer(
    get_secret(SECRET_TOKEN),
    get_secret(SECRET_KEY)
  ));
  $client = new Client($config);

  $suffix = '';
  if (array_key_exists('route', $_GET)) {
    $suffix = $_GET['route'];
  }
  $client->setCallback(CALLBACK . $suffix);

  return $client;
}

function withToken() {
  if (!array_key_exists(KEY_HEADER, $_SERVER)) {
    error('missing key');
  }

  if (!array_key_exists(SECRET_HEADER, $_SERVER)) {
    error('missing secret');
  }

  return new Token($_SERVER[KEY_HEADER], $_SERVER[SECRET_HEADER]);
}

function withParameter($param) {
  if (!array_key_exists($param, $_GET)) {
    error('missing ' . $param);
  }

  return $_GET[$param];
}

function response($obj) {
  print(json_encode($obj));

  exit(0);
}

function error($msg) {
  response(array('error' => $msg));
}

function initiate() {
  $client = withClient();
  list($url, $token) = $client->initiate();

  response(array(
    'url' => $url,
    'key' => $token->key,
    'secret' => $token->secret,
  ));
}

function complete() {
  $client = withClient();
  $requestToken = withToken();
  $verifier = withParameter('verifier');
  $accessToken = $client->complete($requestToken, $verifier);

  response(array(
    'key' => $accessToken->key,
    'secret' => $accessToken->secret,
  ));
}

function identify() {
  $client = withClient();
  $token = withToken();

  $identity = $client->identify($token);

  response($identity);
}

?>
