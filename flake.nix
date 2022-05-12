{
  description = "SQID, a data browser for Wikidata";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-21.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";

    utils.url = "github:gytis-ivaskevicius/flake-utils-plus";

    gitignoresrc = {
      url = "github:hercules-ci/gitignore.nix";
      flake = false;
    };

    node2nix = {
      url = "github:svanderburg/node2nix";
      flake = false;
    };

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "utils/flake-utils";
      };
    };
  };

  outputs = inputs@{ self, utils, ... }:
    let
      sqid-overlay = import ./nix { inherit (inputs) gitignoresrc; };
    in
    utils.lib.mkFlake
      {
        inherit self inputs;

        supportedSystems = [ "x86_64-linux" ];

        channels.nixpkgs.overlaysBuilder = channels: [
          inputs.rust-overlay.overlay
          (final: prev: {
            cargo = final.pkgs.rust-bin.stable.latest.default;
            rustc = final.pkgs.rust-bin.stable.latest.default;
            inherit (channels.nixpkgs-unstable) rust-analyzer rust-analyzer-unwrapped;
          })
          sqid-overlay
        ];

        overlays.default = sqid-overlay;

        outputsBuilder = channels:
          {
            packages = rec {
              sqid-helper = channels.nixpkgs.sqid-helper;
              default = sqid-helper;
            };

            apps = rec {
              sqid-helper = utils.lib.mkApp {
                drv = channels.nixpkgs.sqid-helper;
              };
              default = sqid-helper;
            };

            devShell = channels.nixpkgs.mkShell {
              RUST_LOG = "debug";
              RUST_BACKTRACE = "1";

              buildInputs = with channels.nixpkgs; [
                inputs.node2nix
                nodejs-16_x
                nodePackages.eslint
                nodePackages.typescript
                nodePackages.typescript-language-server
                nodePackages.vls
                nodePackages.vscode-css-languageserver-bin
                nodePackages.vscode-html-languageserver-bin
                nodePackages.vue-cli
                bashInteractive
                rust-bin.nightly.latest.rustfmt
                rust-bin.stable.latest.default
                rust-analyzer
                cargo-audit
                cargo-license
                python37
                ansible
                openssl
                pkg-config
              ];
            };
          };
      };
}
