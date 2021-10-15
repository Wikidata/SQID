{
  description = "SQID, a data browser for Wikidata";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-21.05";
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
  };

  outputs = { self, nixpkgs, flake-utils, node2nix, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShell =
          pkgs.mkShell
            {
              buildInputs = [
                node2nix
                pkgs.nodejs-12_x
                pkgs.nodePackages.eslint
                pkgs.nodePackages.typescript
                pkgs.nodePackages.typescript-language-server
                pkgs.nodePackages.vue-language-server
                pkgs.nodePackages.vscode-css-languageserver-bin
                pkgs.nodePackages.vscode-html-languageserver-bin
                pkgs.nodePackages.vue-cli
                pkgs.bashInteractive
              ];
            };
      }
    );
}
