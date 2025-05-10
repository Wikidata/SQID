{
  dream2nix,
  packageSets,
  ...
}:
dream2nix.lib.evalModules {
  inherit packageSets;

  modules = [
    (import ./paths.nix)
    (import ./sqid.nix)
  ];
}
