{
  lib,
  stdenv,
  treefmt,
  makeWrapper,
  nixfmt-rfc-style,
  rustfmt,
  taplo,
  nodePackages,
  ...
}:
let
  formatters = [
    nixfmt-rfc-style
    rustfmt
    taplo
    nodePackages.prettier
  ];
in
stdenv.mkDerivation {
  pname = "treefmt-with-formatters";
  inherit (treefmt) version;

  nativeBuildInputs = [ makeWrapper ];
  buildInputs = [
    treefmt
  ] ++ formatters;

  meta.mainProgram = "treefmt";

  dontUnpack = true;
  dontBuild = true;
  installPhase = ''
    runHook preInstall

    mkdir -p $out/bin/
    cp ${treefmt}/bin/treefmt $out/bin/treefmt
    wrapProgram $out/bin/treefmt --prefix PATH : ${lib.makeBinPath formatters}

    runHook postInstall
  '';
}
