{
  description = "SQID, a data browser for Wikidata";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
    utils.url = "github:gytis-ivaskevicius/flake-utils-plus";

    gitignoresrc = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    node2nix = {
      url = "github:svanderburg/node2nix";
      inputs = {
        flake-utils.follows = "utils/flake-utils";
        nixpkgs.follows = "nixpkgs";
      };
    };

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "utils/flake-utils";
      };
    };
  };

  outputs = inputs @ {
    self,
    utils,
    ...
  }: let
    sqid-overlay = import ./nix {inherit (inputs) gitignoresrc;};
    mkToolchain = pkgs:
      pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
  in
    utils.lib.mkFlake {
      inherit self inputs;

      channels.nixpkgs.overlaysBuilder = channels: [
        inputs.rust-overlay.overlays.default
        sqid-overlay
      ];

      overlays.default = sqid-overlay;

      outputsBuilder = channels: {
        packages = rec {
          sqid-helper = channels.nixpkgs.sqid-helper;
          default = sqid-helper;
        };

        devShell = channels.nixpkgs.mkShell {
          RUST_LOG = "debug";
          RUST_BACKTRACE = "1";

          buildInputs = with channels.nixpkgs; [
            (mkToolchain channels.nixpkgs)
            # inputs.node2nix.packages."${channels.nixpkgs.system}".node2nix
            nodejs
            nodePackages.eslint
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.vls
            nodePackages.vscode-css-languageserver-bin
            nodePackages.vscode-html-languageserver-bin
            nodePackages.vue-cli
            cargo-audit
            cargo-license
            python310
            ansible
            openssl
            pkg-config
          ];
        };

        formatter = channels.nixpkgs.alejandra;
      };
    };
}
