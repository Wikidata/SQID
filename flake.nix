{
  description = "SQID, a data browser for Wikidata";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixos-26.05/nixexprs.tar.xz";
    systems.url = "github:nix-systems/default";

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    crane.url = "github:ipetkov/crane";

    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    pre-commit-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };

    advisory-db = {
      url = "github:rustsec/advisory-db";
      flake = false;
    };
  };

  outputs =
    inputs:
    let
      inherit (inputs.nixpkgs) lib;

      forAllSystems' = systems: lib.genAttrs systems;
      forAllSystems = forAllSystems' (import inputs.systems);

      perSystem =
        system:
        let
          pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [ inputs.rust-overlay.overlays.default ];
          };
          toolchain = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;

          crane = (inputs.crane.mkLib pkgs).overrideToolchain toolchain;
          src = crane.cleanCargoSource ./.;

          commonArgs = {
            inherit src;
            strictDeps = true;

            nativeBuildInputs = [ pkgs.pkg-config ];

            buildInputs = [
              pkgs.openssl
              pkgs.installShellFiles
            ]
            ++ lib.optionals pkgs.stdenv.isDarwin [
              pkgs.libiconv
              pkgs.darwin.apple_sdk.frameworks.Security
              pkgs.darwin.apple_sdk.frameworks.SystemConfiguration
            ];
          };

          cargoArtifacts = crane.buildDepsOnly commonArgs;

          individualCrateArgs = commonArgs // {
            inherit cargoArtifacts;
            inherit (crane.crateNameFromCargoToml { inherit src; }) version;
            doCheck = false;
          };

          fileSetForCrate =
            crate:
            lib.fileset.toSource {
              root = ./.;
              fileset = lib.fileset.unions [
                ./Cargo.toml
                ./Cargo.lock
                crate
              ];
            };

          cargoMeta = (fromTOML (builtins.readFile ./Cargo.toml)).workspace.package;

          sqid-helper = crane.buildPackage (
            individualCrateArgs
            // {
              pname = "sqid-helper";
              cargoExtraArgs = "-p sqid-helper";
              src = fileSetForCrate ./helpers/rust/src;

              preInstall = ''
                mkdir -p $out
              '';

              inherit (cargoMeta) version;

              meta = {
                inherit (cargoMeta) description homepage;
                license = lib.licenses.asl20;
                mainProgram = "sqid-helper";
              };
            }
          );

          treefmtConfig = {
            projectRootFile = "flake.nix";

            programs = {
              # nix
              nixfmt.enable = true;
              statix.enable = true;
              deadnix.enable = true;

              # rust
              rustfmt = {
                enable = true;
                package = toolchain;
              };
              taplo.enable = true;

              shellcheck.enable = true;
            };

            settings = {
              formatter = {
                shellcheck.excludes = [ ".envrc" ];
              };
            };
          };

          treefmt = inputs.treefmt-nix.lib.evalModule pkgs treefmtConfig;
        in
        {

          packages = {
            inherit sqid-helper;
            default = sqid-helper;
          };

          checks = {
            inherit sqid-helper;

            cargo-workspace-clippy = crane.cargoClippy (
              commonArgs
              // {
                inherit cargoArtifacts;
                cargoClippyExtraArgs = "--all-targets -- --deny warnings";
              }
            );

            cargo-workspace-doc = crane.cargoDoc (commonArgs // { inherit cargoArtifacts; });
            cargo-workspace-fmt = crane.cargoFmt { inherit src; };
            cargo-workspace-audit = crane.cargoAudit {
              inherit src;
              inherit (inputs) advisory-db;
            };
            cargo-workspace-deny = crane.cargoDeny { inherit src; };
            cargo-workspace-nextest = crane.cargoNextest (
              commonArgs
              // {
                inherit cargoArtifacts;
                partitions = 1;
                partitionType = "count";
                cargoNextestExtraArgs = lib.concatStringsSep " " [
                  "--skip sparql::test::simple_query" # queries the network
                  "--skip types::json::test::deserialise_example_" # relies on existing example data
                ];

              }
            );

            pre-commit-check =
              let
                replaceFormatters = {
                };
                treefmtFormatters = lib.mapAttrs' (
                  key: value: lib.nameValuePair (replaceFormatters.${key} or key) value
                ) treefmtConfig.programs;
              in
              inputs.pre-commit-hooks.lib.${system}.run {
                src = ./.;
                hooks = treefmtFormatters // {
                  rustfmt = {
                    enable = true;
                    packageOverrides = {
                      cargo = toolchain;
                      rustfmt = toolchain;
                    };
                  };
                  check-merge-conflicts.enable = true;
                  end-of-file-fixer.enable = true;
                  fix-byte-order-marker.enable = true;
                  editorconfig-checker = {
                    enable = true;
                    excludes = [ ''^LICENSES/.*\.txt$'' ];
                  };
                  shellcheck = {
                    enable = true;
                    excludes = [ "\\.envrc" ];
                  };
                };
              };

            formatting = treefmt.config.build.check inputs.self;
          };

          devShells.default = crane.devShell {
            checks = inputs.self.checks.${system};

            RUST_LOG = "debug";
            RUST_BACKTRACE = 1;

            packages = lib.attrValues {
              inherit toolchain;
              inherit (pkgs)
                cargo-license
                cargo-audit
                cargo-update
                rust-analyzer
                ;
            };

            inherit (inputs.self.checks.${system}.pre-commit-check) shellHook;
          };

          formatter = treefmt.config.build.wrapper;
        };

      shared = { };

    in
    shared
    // (lib.genAttrs [
      "checks"
      "devShells"
      "formatter"
      "packages"
    ] (output: forAllSystems (system: (perSystem system).${output})));
}
