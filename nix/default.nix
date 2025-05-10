inputs: final: prev:
let
  inherit (final.pkgs) callPackage;
in
{
  sqid = callPackage ./sqid {
    inherit (inputs) dream2nix;
    packageSets.nixpkgs = final;
  };
  sqid-helper = callPackage ./sqid-helper { };

  treefmt-with-formatters = callPackage ./treefmt-with-formatters.nix { };
}
