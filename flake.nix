{
  description = "SQID, a data browser for Wikidata";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    utils.url = "github:gytis-ivaskevicius/flake-utils-plus";

    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      utils,
      ...
    }:
    let
      sqid-overlay = import ./nix inputs;
      mkToolchain = pkgs: pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
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
          inherit (channels.nixpkgs) sqid sqid-helper;

          default = sqid-helper;
        };

        devShells.default = channels.nixpkgs.callPackage ./nix/sqid/devshell.nix {
          inherit (inputs) dream2nix;
          packageSets = channels;
          rustToolchain = mkToolchain channels.nixpkgs;
        };

        apps =
          let
            inherit (channels.nixpkgs) python3 writeShellApplication system;

            sqid-preview = utils.lib.mkApp {
              drv = writeShellApplication {
                name = "sqid-preview";

                runtimeInputs = [ python3 ];

                text = ''
                  cd ${self.packages.${system}.sqid}/dist
                  python3 -m http.server
                '';
              };
            };
          in
          {
            inherit sqid-preview;
            default = sqid-preview;
          };

        formatter = channels.nixpkgs.treefmt-with-formatters;
      };
    };
}
