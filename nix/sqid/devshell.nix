{
  dream2nix,
  packageSets,
  rustToolchain,
  ...
}:
dream2nix.lib.evalModules {
  inherit packageSets;

  modules = [
    (import ./paths.nix)

    (
      {
        lib,
        config,
        dream2nix,
        pkgs,
        ...
      }:
      let
        package = builtins.fromJSON (lib.readFile ../../package.json);
        dontDownloadCypressEnv = {
          CYPRESS_INSTALL_BINARY = 0;
          CYPRESS_RUN_BINARY = "${pkgs.cypress}/bin/Cypress";
        };
      in
      {
        name = "sqid";
        inherit (package) version;

        imports = [
          dream2nix.modules.dream2nix.nodejs-package-lock-v3
          dream2nix.modules.dream2nix.nodejs-devshell-v3
        ];

        env = dontDownloadCypressEnv // {
          RUST_LOG = "debug";
          RUST_BACKTRACE = "1";
        };

        mkDerivation = {
          src = ../../.;

          nativeBuildInputs = lib.attrValues {
            inherit (config.deps)
              nodejs
              cypress
              vue-language-server
              vscode-langservers-extracted
              rustToolchain
              cargo-audit
              cargo-license
              python312
              ansible
              openssl
              pkg-config
              treefmt-with-formatters
              eslint
              typescript
              typescript-language-server
              ;
          };

          buildPhase = "mkdir $out";
        };

        deps =
          { nixpkgs, ... }:
          {
            inherit
              rustToolchain
              ;
            inherit (nixpkgs)
              nodejs
              cypress
              vue-language-server
              vscode-langservers-extracted
              cargo-audit
              cargo-license
              python312
              ansible
              openssl
              pkg-config
              treefmt-with-formatters
              ;
            inherit (nixpkgs.nodePackages) eslint typescript typescript-language-server;
          };

        nodejs-package-lock-v3 = {
          packageLockFile = "${config.mkDerivation.src}/package-lock.json";
        };

        nodejs-devshell-v3.nodeModules.nodejs-granular-v3.overrides.cypress = {
          env = dontDownloadCypressEnv;
          mkDerivation.nativeBuildInputs = [ config.deps.cypress ];
        };
      }
    )
  ];
}
