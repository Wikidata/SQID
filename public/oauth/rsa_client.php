<?php

require_once __DIR__ . '/vendor/autoload.php';

use Psr\Log\LoggerInterface;
use MediaWiki\OAuthClient\Client;
use MediaWiki\OAuthClient\Request;
use MediaWiki\OAuthClient\ClientConfig;
use MediaWiki\OAuthClient\SignatureMethod\RsaSha1;

require_once __DIR__ . '/config.php';

class RsaSig extends RsaSha1 {
  protected function fetchPublicCert(Request $request) {
    // not used.
    return '';
  }

  protected function fetchPrivateCert(Request $request) {
    return trim(file_get_contents(SECRET_CERTIFICATE));
  }
}

class RsaClient extends Client {
  private $signatureMethod;

  public function __construct(
    ClientConfig $config,
    RsaSig $signatureMethod,
    LoggerInterface $logger = null
  ) {
    $this->signatureMethod = $signatureMethod;
    parent::__construct($config, $logger);
  }

  public function makeOAuthCall(
    $token, $url, $isPost = false, array $postFields = null
  ) {
    $hasFile = false;

    if (is_array($postFields)) {
      foreach ($postFields as $field) {
        if (is_a($field, 'CurlFile')) {
          $hasFile = true;
          break;
        }
      }
    }

    $params = [];

    if (strpos($url, '?')) {
      $parsed = parse_url($url);
      parse_str($parsed['query'], $params);
    }

    $params += $this->extraParams;
    if ($isPost && $postFields && !$hasFile) {
      $params += $postFields;
    }

    $method = $isPost ? 'POST' : 'GET';
    $req = Request::fromConsumerAndToken(
      $this->config->consumer,
      $token,
      $method,
      $url,
      $params
    );
    $req->signRequest(
      $this->signatureMethod,
      $this->config->consumer,
      $token
    );
    $this->lastNonce = $req->getParameter('oauth_nonce');

    return $this->makeCurlCall(
      $url,
      $req->toHeader(),
      $isPost,
      $postFields,
      $hasFile
    );
  }
}

?>
