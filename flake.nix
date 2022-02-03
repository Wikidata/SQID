{
  description = "SQID, a data browser for Wikidata";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
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
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [
          (import inputs.rust-overlay)
          (final: prev: {
            cargo = final.pkgs.rust-bin.stable.latest.default;
            rustc = final.pkgs.rust-bin.stable.latest.default;
          })
          (import ./nix { inherit (inputs) gitignoresrc; })
        ];
        pkgs = import inputs.nixpkgs { inherit system overlays; };
      in
      rec {
        packages = flake-utils.lib.flattenTree {
          inherit (pkgs) sqid-helper;
        };
        defaultPackage = packages.sqid-helper;
        apps.sqid-helper = flake-utils.lib.mkApp { drv = packages.sqid-helper; };
        defaultApp = apps.sqid-helper;
        devShell =
          pkgs.mkShell
            {
              RUST_LOG = "debug";
              RUST_BACKTRACE = "1";

              buildInputs = [
                inputs.node2nix
                pkgs.nodejs-14_x
                pkgs.nodePackages.eslint
                pkgs.nodePackages.typescript
                pkgs.nodePackages.typescript-language-server
                pkgs.nodePackages.vls
                pkgs.nodePackages.vscode-css-languageserver-bin
                pkgs.nodePackages.vscode-html-languageserver-bin
                pkgs.nodePackages.vue-cli
                pkgs.bashInteractive
                pkgs.rust-bin.nightly.latest.rustfmt
                pkgs.rust-bin.stable.latest.default
                pkgs.rust-analyzer
                pkgs.cargo-audit
                pkgs.cargo-license
                pkgs.python37
                pkgs.ansible
                pkgs.openssl
                pkgs.pkg-config
              ];
            };
      }
    );
}
