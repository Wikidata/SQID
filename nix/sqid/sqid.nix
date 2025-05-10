{
  lib,
  config,
  dream2nix,
  pkgs,
  ...
}:
let
  package = builtins.fromJSON (lib.readFile ../../package.json);
in
{
  name = "sqid";
  inherit (package) version;

  imports = [
    dream2nix.modules.dream2nix.nodejs-package-lock-v3
    dream2nix.modules.dream2nix.nodejs-granular-v3
  ];

  mkDerivation = {
    src = ../../.;

    nativeBuildInputs = [ config.deps.cypress ];

    installPhase = ''
      runHook preInstall

      cp -R dist $out

      runHook postInstall
    '';
  };

  deps =
    { nixpkgs, ... }:
    {
      inherit (nixpkgs) cypress;
    };

  nodejs-package-lock-v3 = {
    packageLockFile = "${config.mkDerivation.src}/package-lock.json";
  };

  nodejs-granular-v3 = {
    buildScript = "NODE_OPTIONS=--max_old_space_size=4096 npm run build";
    overrides.cypress = {
      env = {
        CYPRESS_INSTALL_BINARY = 0;
        CYPRESS_RUN_BINARY = "${pkgs.cypress}/bin/Cypress";
      };
      mkDerivation.nativeBuildInputs = [ config.deps.cypress ];
    };
  };
}
