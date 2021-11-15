{ lib
, cargo
, gitignoreSource
, openssl
, pkg-config
, rustPlatform
, rustc
}:

rustPlatform.buildRustPackage rec {
  pname = "sqid-helper";
  version = "0.1.0";

  src = gitignoreSource ../../helpers/rust;

  cargoLock = {
    lockFile = ../../helpers/rust/Cargo.lock;
  };

  nativeBuildInputs = [
    rustc
    cargo
    pkg-config
  ];
  buildInputs = [
    openssl
  ];

  checkFlags = [
    "--skip sparql::test::simple_query" # queries the network
    "--skip types::json::test::deserialise_example_" # relies on existing example data
  ];

  meta = {
    description = "Helper to collect and update statistics for the SQID browser for Wikidata";
    homepage = "https://github.com/Wikidata/SQID";
    license = lib.licenses.asl20;
  };

}
